package lk.tenderease.user.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.request.AddressDTO;
import lk.tenderease.user.dto.request.CreateOfficerRegistrationRequest;
import lk.tenderease.user.dto.request.LiaisonOfficerDTO;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationSuccessResponse;
import lk.tenderease.user.entity.Address;
import lk.tenderease.user.entity.LiaisonOfficer;
import lk.tenderease.user.entity.Officer;
import lk.tenderease.user.entity.RegistrationAudit;
import lk.tenderease.user.enums.OfficerStatus;
import lk.tenderease.user.event.OfficerEvent;
import lk.tenderease.user.event.OfficerEventPublisher;
import lk.tenderease.user.exception.InvalidOfficerStatusException;
import lk.tenderease.user.exception.OfficerNotFoundException;
import lk.tenderease.user.exception.OfficerRegistrationException;
import lk.tenderease.user.repository.LiaisonOfficerRepository;
import lk.tenderease.user.repository.OfficerRepository;
import lk.tenderease.user.repository.RegistrationAuditRepository;
import lk.tenderease.user.service.EmailService;
import lk.tenderease.user.service.OfficerRegistrationService;
import lk.tenderease.user.util.ReferenceIdGenerator;
import lk.tenderease.user.producer.UserEventProducer;
import lk.tenderease.common.event.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of {@link OfficerRegistrationService}.
 *
 * <p>Handles the complete officer registration lifecycle including
 * validation, persistence, event publishing, caching, and auditing.</p>
 *
 * <p><strong>Business Rules:</strong></p>
 * <ul>
 *   <li>One email = one officer (unique constraint)</li>
 *   <li>One NIC = one liaison officer (unique constraint)</li>
 *   <li>NIC must follow Sri Lankan format</li>
 *   <li>Terms &amp; Conditions must be accepted</li>
 *   <li>Multiple validation errors are collected and returned together</li>
 *   <li>A support ID is generated on every failure for troubleshooting</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OfficerRegistrationServiceImpl implements OfficerRegistrationService {

    private final OfficerRepository officerRepository;
    private final LiaisonOfficerRepository liaisonOfficerRepository;
    private final RegistrationAuditRepository registrationAuditRepository;
    private final ReferenceIdGenerator referenceIdGenerator;
    private final OfficerEventPublisher eventPublisher;
    private final UserEventProducer userEventProducer;
    private final EmailService emailService;

    // ────────────────────────────────────────────────────────
    //  PUBLIC REGISTRATION
    // ────────────────────────────────────────────────────────

    /**
     * {@inheritDoc}
     *
     * <p>Flow:</p>
     * <ol>
     *   <li>Collect all validation errors (don't fail fast)</li>
     *   <li>If errors exist → generate support ID, create audit, throw</li>
     *   <li>Generate registration reference ID</li>
     *   <li>Build and persist Officer + LiaisonOfficer</li>
     *   <li>Create success audit record</li>
     *   <li>Publish OfficerRegistered event</li>
     *   <li>Return success response with reference ID</li>
     * </ol>
     */
    @Override
    @Transactional
    public OfficerRegistrationSuccessResponse registerOfficer(CreateOfficerRegistrationRequest request) {
        log.info("Processing officer registration for email: {}", request.getOfficialEmail());

        // 1. Collect all validation errors
        final List<String> errors = validateRegistration(request);

        // 2. If errors, generate support ID and throw
        if (!errors.isEmpty()) {
            final String supportId = referenceIdGenerator.generateSupportId();
            createAuditRecord(null, "REGISTRATION_FAILED",
                    String.join("; ", errors), supportId, "REGISTER");
            log.warn("Registration validation failed for email {}: {} [supportId={}]",
                    request.getOfficialEmail(), errors, supportId);
            throw new OfficerRegistrationException(errors, supportId);
        }

        // 3. Generate reference ID
        final String referenceId = referenceIdGenerator.generateRegistrationReference();
        log.info("Generated registration reference: {}", referenceId);

        // 4. Build and persist Officer
        final Officer officer = buildOfficer(request, referenceId);
        final LiaisonOfficer liaisonOfficer = buildLiaisonOfficer(request.getLiaisonOfficer());
        officer.setLiaisonOfficer(liaisonOfficer);

        final Officer savedOfficer = officerRepository.save(officer);
        log.info("Officer saved with ID: {} and reference: {}", savedOfficer.getId(), referenceId);

        // 5. Create success audit
        createAuditRecord(referenceId, "PENDING", null, null, "REGISTER");

        // 6. Publish event for internal workflow
        publishOfficerEvent(savedOfficer, "REGISTERED");

        // 7. Emit KPI Event for Reporting Service
        userEventProducer.sendUserEvent(UserEvent.builder()
                .userId(savedOfficer.getId().toString())
                .eventType("REGISTERED")
                .role("OFFICER")
                .triggerBy("system")
                .build());

        // 7. Send asynchronous-like mock email
        try {
            emailService.sendRegistrationSuccessEmail(
                savedOfficer.getLiaisonOfficer().getEmail(),
                savedOfficer.getLiaisonOfficer().getName(),
                referenceId
            );
        } catch (Exception e) {
            log.error("Failed to send mock registration email to {}: {}", savedOfficer.getLiaisonOfficer().getEmail(), e.getMessage());
        }

        // 8. Return success response
        return OfficerRegistrationSuccessResponse.builder()
                .success(true)
                .message("Registration successful")
                .data(OfficerRegistrationSuccessResponse.RegistrationData.builder()
                        .referenceId(referenceId)
                        .build())
                .build();
    }

    // ────────────────────────────────────────────────────────
    //  ADMIN OPERATIONS
    // ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "officers", key = "#referenceId", unless = "#result == null")
    public OfficerProfileResponse getOfficerByReference(String referenceId) {
        log.debug("Fetching officer by reference: {}", referenceId);
        final Officer officer = officerRepository.findByRegistrationReference(referenceId)
                .orElseThrow(() -> new OfficerNotFoundException("registrationReference", referenceId));
        return mapToProfileResponse(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerProfileResponse getOfficerById(UUID id) {
        log.debug("Fetching officer by ID: {}", id);
        final Officer officer = findOfficerOrThrow(id);
        return mapToProfileResponse(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OfficerProfileResponse> listOfficers(OfficerStatus status, Pageable pageable) {
        log.debug("Listing officers [status={}, page={}]", status, pageable.getPageNumber());
        final Page<Officer> page = (status != null)
                ? officerRepository.findByStatus(status, pageable)
                : officerRepository.findAll(pageable);

        final List<OfficerProfileResponse> content = page.getContent()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.<OfficerProfileResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "officers", key = "#result.registrationReference")
    public OfficerProfileResponse approveOfficer(UUID id) {
        log.info("Approving officer: {}", id);
        final Officer officer = findOfficerOrThrow(id);

        // Idempotent: if already approved, just return current state
        if (officer.getStatus() == OfficerStatus.APPROVED) {
            log.info("Officer {} is already approved, returning current state", id);
            return mapToProfileResponse(officer);
        }

        if (officer.getStatus() != OfficerStatus.PENDING) {
            throw new InvalidOfficerStatusException(officer.getStatus().name(), "approve");
        }

        officer.setStatus(OfficerStatus.APPROVED);
        officerRepository.save(officer);

        createAuditRecord(officer.getRegistrationReference(), "APPROVED", null, null, "APPROVE");
        publishOfficerEvent(officer, "APPROVED");

        // Emit KPI Event
        userEventProducer.sendUserEvent(UserEvent.builder()
                .userId(officer.getId().toString())
                .eventType("ACCEPTED")
                .status("APPROVED")
                .role("OFFICER")
                .triggerBy("cao-user")
                .build());

        log.info("Officer {} approved (ref: {})", id, officer.getRegistrationReference());

        // Send approval emails to both Official and Liaison emails
        sendNotificationEmails(officer, "APPROVED", null);

        return mapToProfileResponse(officer);
    }

    @Override
    @Transactional
    @CacheEvict(value = "officers", key = "#result.registrationReference")
    public OfficerProfileResponse rejectOfficer(UUID id, String reason) {
        log.info("Rejecting officer: {} with reason: {}", id, reason);
        final Officer officer = findOfficerOrThrow(id);

        // Idempotent: if already rejected, just return current state
        if (officer.getStatus() == OfficerStatus.REJECTED) {
            log.info("Officer {} is already rejected, returning current state", id);
            return mapToProfileResponse(officer);
        }

        if (officer.getStatus() != OfficerStatus.PENDING) {
            throw new InvalidOfficerStatusException(officer.getStatus().name(), "reject");
        }

        officer.setStatus(OfficerStatus.REJECTED);
        officer.setRejectionReason(reason);
        officerRepository.save(officer);

        createAuditRecord(officer.getRegistrationReference(), "REJECTED", reason, null, "REJECT");
        publishOfficerEvent(officer, "REJECTED");

        log.info("Officer {} rejected (ref: {})", id, officer.getRegistrationReference());

        // Send rejection emails to both Official and Liaison emails
        sendNotificationEmails(officer, "REJECTED", reason);

        return mapToProfileResponse(officer);
    }

    // ────────────────────────────────────────────────────────
    //  VALIDATION
    // ────────────────────────────────────────────────────────

    /**
     * Collect all validation errors for the registration request.
     * Does NOT fail-fast: collects all errors to return to the UI at once.
     */
    private List<String> validateRegistration(CreateOfficerRegistrationRequest request) {
        final List<String> errors = new ArrayList<>();

        // NIC format validation
        final String nic = request.getLiaisonOfficer().getNic();
        if (!isValidNIC(nic)) {
            errors.add("NIC format incorrect");
        }

        // NIC uniqueness
        if (liaisonOfficerRepository.existsByNic(nic)) {
            errors.add("NIC already registered for another liaison officer");
        }

        // LO Email uniqueness
        if (liaisonOfficerRepository.existsByEmail(request.getLiaisonOfficer().getEmail())) {
            errors.add("Liaison officer email already registered");
        }

        return errors;
    }

    /**
     * Validate Sri Lankan NIC format.
     * Old format: 9 digits + V/X (e.g., 123456789V)
     * New format: 12 digits (e.g., 200012345678)
     */
    private boolean isValidNIC(String nic) {
        if (nic == null || nic.isBlank()) {
            return false;
        }
        return nic.matches("^([0-9]{9}[vVxX]|[0-9]{12})$");
    }

    private void sendNotificationEmails(Officer officer, String type, String reason) {
        String officialEmail = officer.getOfficialEmail();
        String loEmail = (officer.getLiaisonOfficer() != null) ? officer.getLiaisonOfficer().getEmail() : null;
        String name = (officer.getLiaisonOfficer() != null) ? officer.getLiaisonOfficer().getName() : "Officer";
        String ref = officer.getRegistrationReference();

        try {
            if ("APPROVED".equals(type)) {
                log.info("Sending approval emails for ref: {}", ref);
                emailService.sendRegistrationApprovalEmail(officialEmail, name, ref);
                if (loEmail != null && !loEmail.equals(officialEmail)) {
                    emailService.sendRegistrationApprovalEmail(loEmail, name, ref);
                }
            } else if ("REJECTED".equals(type)) {
                log.info("Sending rejection emails for ref: {}", ref);
                emailService.sendRegistrationRejectionEmail(officialEmail, name, ref, reason);
                if (loEmail != null && !loEmail.equals(officialEmail)) {
                    emailService.sendRegistrationRejectionEmail(loEmail, name, ref, reason);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send {} emails for {}: {}", type, ref, e.getMessage());
        }
    }

    // ────────────────────────────────────────────────────────
    //  VALIDATION
    // ────────────────────────────────────────────────────────

    private Officer findOfficerOrThrow(UUID id) {
        return officerRepository.findById(id)
                .orElseThrow(() -> new OfficerNotFoundException("id", id));
    }

    private Officer buildOfficer(CreateOfficerRegistrationRequest request, String referenceId) {
        final AddressDTO addr = request.getAddress();
        return Officer.builder()
                .procuringEntityType(request.getProcuringEntityType())
                .headDesignation(request.getHeadDesignation())
                .organizationName(request.getOrganizationName())
                .address(Address.builder()
                        .country(addr.getCountry())
                        .streetLine1(addr.getStreetLine1())
                        .streetLine2(addr.getStreetLine2())
                        .city(addr.getCity())
                        .province(addr.getProvince())
                        .postalCode(addr.getPostalCode())
                        .build())
                .personalLandPhone(request.getPersonalLandPhone())
                .officialEmail(request.getOfficialEmail())
                .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                .vatRegistrationNumber(request.getVatRegistrationNumber())
                .registrationReference(referenceId)
                .status(OfficerStatus.PENDING)
                .termsAccepted(request.getTermsAccepted())
                .build();
    }

    private LiaisonOfficer buildLiaisonOfficer(LiaisonOfficerDTO dto) {
        return LiaisonOfficer.builder()
                .title(dto.getTitle())
                .name(dto.getName())
                .designation(dto.getDesignation())
                .nic(dto.getNic())
                .mobile(dto.getMobile())
                .email(dto.getEmail())
                .build();
    }

    private void createAuditRecord(String referenceId, String status,
                                    String errorMessage, String supportId, String action) {
        try {
            final RegistrationAudit audit = RegistrationAudit.builder()
                    .referenceId(referenceId)
                    .status(status)
                    .errorMessage(errorMessage)
                    .supportId(supportId)
                    .action(action)
                    .build();
            registrationAuditRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to create audit record [ref={}, action={}]: {}",
                    referenceId, action, e.getMessage());
        }
    }

    private void publishOfficerEvent(Officer officer, String eventType) {
        final OfficerEvent event = OfficerEvent.builder()
                .referenceId(officer.getRegistrationReference())
                .email(officer.getOfficialEmail())
                .status(officer.getStatus().name())
                .eventType(eventType)
                .officerName(officer.getLiaisonOfficer() != null
                        ? officer.getLiaisonOfficer().getName() : null)
                .timestamp(LocalDateTime.now())
                .build();

        switch (eventType) {
            case "REGISTERED" -> eventPublisher.publishRegistered(event);
            case "APPROVED" -> eventPublisher.publishApproved(event);
            case "REJECTED" -> eventPublisher.publishRejected(event);
            default -> log.warn("Unknown event type: {}", eventType);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerProfileResponse getOfficerByEmail(String email) {
        log.debug("Fetching officer by email: {}", email);
        Officer officer = officerRepository.findByOfficialEmail(email).orElse(null);
        if (officer == null) {
            LiaisonOfficer lo = liaisonOfficerRepository.findByEmail(email)
                    .orElseThrow(() -> new OfficerNotFoundException("email", email));
            officer = lo.getOfficer();
        }
        return mapToProfileResponse(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerProfileResponse getOfficerByKeycloakUserId(String keycloakUserId) {
        log.debug("Fetching officer by keycloakUserId: {}", keycloakUserId);
        Officer officer = officerRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new lk.tenderease.user.exception.OfficerNotFoundException("keycloakUserId", keycloakUserId));
        return mapToProfileResponse(officer);
    }

    private OfficerProfileResponse mapToProfileResponse(Officer officer) {
        LiaisonOfficerDTO liaisonDto = null;
        if (officer.getLiaisonOfficer() != null) {
            final LiaisonOfficer lo = officer.getLiaisonOfficer();
            liaisonDto = LiaisonOfficerDTO.builder()
                    .title(lo.getTitle())
                    .name(lo.getName())
                    .designation(lo.getDesignation())
                    .nic(lo.getNic())
                    .mobile(lo.getMobile())
                    .email(lo.getEmail())
                    .build();
        }

        AddressDTO addressDto = null;
        if (officer.getAddress() != null) {
            final Address addr = officer.getAddress();
            addressDto = AddressDTO.builder()
                    .country(addr.getCountry())
                    .streetLine1(addr.getStreetLine1())
                    .streetLine2(addr.getStreetLine2())
                    .city(addr.getCity())
                    .province(addr.getProvince())
                    .postalCode(addr.getPostalCode())
                    .build();
        }

        return OfficerProfileResponse.builder()
                .officerId(officer.getId())
                .registrationReference(officer.getRegistrationReference())
                .status(officer.getStatus().name())
                .procuringEntityType(officer.getProcuringEntityType())
                .headDesignation(officer.getHeadDesignation())
                .organizationName(officer.getOrganizationName())
                .address(addressDto)
                .personalLandPhone(officer.getPersonalLandPhone())
                .officialEmail(officer.getOfficialEmail())
                .businessRegistrationNumber(officer.getBusinessRegistrationNumber())
                .vatRegistrationNumber(officer.getVatRegistrationNumber())
                .liaisonOfficer(liaisonDto)
                .termsAccepted(officer.getTermsAccepted())
                .keycloakUserId(officer.getKeycloakUserId())
                .createdAt(officer.getCreatedAt())
                .updatedAt(officer.getUpdatedAt())
                .rejectionReason(officer.getRejectionReason())
                .build();
    }
}
