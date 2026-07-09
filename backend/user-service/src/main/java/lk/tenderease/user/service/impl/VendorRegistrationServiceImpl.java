package lk.tenderease.user.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.client.DrcApiClient;
import lk.tenderease.user.dto.request.VendorRegisterRequest;
import lk.tenderease.user.dto.request.VendorSubmitRequest;
import lk.tenderease.user.dto.request.VerifyRegistrationRequest;
import lk.tenderease.user.dto.response.VendorDocumentResponse;
import lk.tenderease.user.dto.response.VendorProfileResponse;
import lk.tenderease.user.dto.response.VendorRegistrationResponse;
import lk.tenderease.user.dto.response.VerifyRegistrationResponse;
import lk.tenderease.user.entity.VendorAuthorizedOfficer;
import lk.tenderease.user.entity.VendorDocument;
import lk.tenderease.user.entity.VendorProfile;
import lk.tenderease.user.enums.VendorDocumentType;
import lk.tenderease.user.enums.VendorStatus;
import lk.tenderease.user.repository.VendorDocumentRepository;
import lk.tenderease.user.repository.VendorProfileRepository;
import lk.tenderease.user.service.FileStorageService;
import lk.tenderease.user.service.VendorRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorRegistrationServiceImpl implements VendorRegistrationService {

    private static final int MAX_DOCUMENTS = 5;

    private final VendorProfileRepository vendorProfileRepository;
    private final VendorDocumentRepository vendorDocumentRepository;
    private final DrcApiClient drcApiClient;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public VerifyRegistrationResponse verifyRegistrationNumber(VerifyRegistrationRequest request) {
        log.info("Verifying business registration: {}", request.getCertificateNo());
        return drcApiClient.verify(request.getCertificateNo());
    }

    @Override
    @Transactional
    public VendorRegistrationResponse register(VendorRegisterRequest request) {
        log.info("Registering vendor: {}", request.getOrganization().getBusinessName());

        if (vendorProfileRepository.existsByRegistrationNumber(request.getOrganization().getRegistrationNumber())) {
            throw new RuntimeException("A vendor with registration number '"
                    + request.getOrganization().getRegistrationNumber() + "' already exists.");
        }
        if (vendorProfileRepository.existsByOfficialEmail(request.getOrganization().getOfficialEmail())) {
            throw new RuntimeException("A vendor with email '"
                    + request.getOrganization().getOfficialEmail() + "' already exists.");
        }

        VendorProfile profile = VendorProfile.builder()
                .businessName(request.getOrganization().getBusinessName())
                .registrationAuthority(request.getOrganization().getRegistrationAuthority())
                .registrationNumber(request.getOrganization().getRegistrationNumber())
                .organizationType(request.getOrganization().getOrganizationType())
                .country(request.getOrganization().getCountry())
                .registrationAddress(request.getOrganization().getRegistrationAddress())
                .city(request.getOrganization().getCity())
                .province(request.getOrganization().getProvince())
                .website(request.getOrganization().getWebsite())
                .officialEmail(request.getOrganization().getOfficialEmail())
                .officialTelephone(request.getOrganization().getOfficialTelephone())
                .cidaGrade(request.getOrganization().getCidaGrade())
                .status(VendorStatus.PENDING_REVIEW)
                .drcVerified(false)
                .termsAccepted(false)
                .departments(request.getOrganization().getDepartments())
                .build();

        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        profile.setCreatedBy("public-registration");

        VendorProfile saved = vendorProfileRepository.save(profile);

        VendorAuthorizedOfficer officer = VendorAuthorizedOfficer.builder()
                .vendorProfile(saved)
                .nicOrPassportNo(request.getAuthorizedOfficer().getNicOrPassportNo())
                .name(request.getAuthorizedOfficer().getName())
                .designation(request.getAuthorizedOfficer().getDesignation())
                .mobilePhone(request.getAuthorizedOfficer().getMobilePhone())
                .email(request.getAuthorizedOfficer().getEmail())
                .build();
        officer.setCreatedAt(LocalDateTime.now());
        officer.setUpdatedAt(LocalDateTime.now());

        saved.setAuthorizedOfficer(officer);
        vendorProfileRepository.save(saved);

        log.info("Vendor registered with ID: {}", saved.getId());
        return mapToRegistrationResponse(saved);
    }

    @Override
    @Transactional
    public VendorDocumentResponse uploadDocument(UUID vendorId, MultipartFile file,
                                                  VendorDocumentType documentType, String documentTitle) {
        VendorProfile profile = findVendorOrThrow(vendorId);

        if (profile.getStatus() == VendorStatus.APPROVED || profile.getStatus() == VendorStatus.REJECTED) {
            throw new RuntimeException("Cannot upload documents for a vendor in status: " + profile.getStatus());
        }

        long existingCount = vendorDocumentRepository.countByVendorProfileId(vendorId);
        if (existingCount >= MAX_DOCUMENTS) {
            throw new RuntimeException("Maximum of " + MAX_DOCUMENTS + " documents allowed per vendor.");
        }

        if (documentType == VendorDocumentType.OTHER &&
                (documentTitle == null || documentTitle.isBlank())) {
            throw new RuntimeException("A document title is required for documents of type OTHER.");
        }

        String filePath = fileStorageService.store(file, vendorId, documentType.name());

        VendorDocument doc = VendorDocument.builder()
                .vendorProfile(profile)
                .documentType(documentType)
                .documentTitle(documentTitle)
                .filePath(filePath)
                .originalFileName(file.getOriginalFilename())
                .fileSizeBytes(file.getSize())
                .mimeType(file.getContentType())
                .build();
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());

        VendorDocument saved = vendorDocumentRepository.save(doc);
        log.info("Document uploaded for vendor {}: {}", vendorId, saved.getId());

        return mapToDocumentResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDocument(UUID vendorId, UUID docId) {
        findVendorOrThrow(vendorId);

        VendorDocument doc = vendorDocumentRepository.findById(docId)
                .filter(d -> d.getVendorProfile().getId().equals(vendorId))
                .orElseThrow(() -> new RuntimeException("Document not found: " + docId));

        fileStorageService.delete(doc.getFilePath());
        vendorDocumentRepository.delete(doc);
        log.info("Deleted document {} for vendor {}", docId, vendorId);
    }

    @Override
    @Transactional
    public VendorRegistrationResponse submit(UUID vendorId, VendorSubmitRequest request) {
        VendorProfile profile = findVendorOrThrow(vendorId);

        if (profile.getStatus() != VendorStatus.PENDING_REVIEW) {
            throw new RuntimeException("Vendor is not in PENDING_REVIEW status. Current: " + profile.getStatus());
        }

        long docCount = vendorDocumentRepository.countByVendorProfileId(vendorId);
        if (docCount == 0) {
            throw new RuntimeException("At least one document must be uploaded before submission.");
        }
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new RuntimeException("Terms and Conditions must be accepted to submit.");
        }

        profile.setStatus(VendorStatus.APPROVED);
        profile.setTermsAccepted(true);
        profile.setTermsAcceptedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());

        VendorProfile updated = vendorProfileRepository.save(profile);
        log.info("Vendor {} submitted for review.", vendorId);

        return mapToRegistrationResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public VendorProfileResponse getVendorById(UUID id) {
        VendorProfile profile = findVendorOrThrow(id);
        return mapToProfileResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VendorProfileResponse> listVendors(VendorStatus status, Pageable pageable) {
        Page<VendorProfile> page = (status != null)
                ? vendorProfileRepository.findByStatus(status, pageable)
                : vendorProfileRepository.findAll(pageable);

        List<VendorProfileResponse> content = page.getContent()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.<VendorProfileResponse>builder()
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
    public VendorProfileResponse approveVendor(UUID id) {
        VendorProfile profile = findVendorOrThrow(id);
        if (profile.getStatus() != VendorStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED vendors can be approved. Current: " + profile.getStatus());
        }
        profile.setStatus(VendorStatus.APPROVED);
        profile.setUpdatedAt(LocalDateTime.now());
        vendorProfileRepository.save(profile);
        log.info("Vendor {} approved.", id);
        return mapToProfileResponse(profile);
    }

    @Override
    @Transactional
    public VendorProfileResponse rejectVendor(UUID id, String reason) {
        VendorProfile profile = findVendorOrThrow(id);
        if (profile.getStatus() != VendorStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED vendors can be rejected. Current: " + profile.getStatus());
        }
        profile.setStatus(VendorStatus.REJECTED);
        profile.setRejectionReason(reason);
        profile.setUpdatedAt(LocalDateTime.now());
        vendorProfileRepository.save(profile);
        log.info("Vendor {} rejected with reason: {}", id, reason);
        return mapToProfileResponse(profile);
    }

    private VendorProfile findVendorOrThrow(UUID id) {
        return vendorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + id));
    }

    private VendorRegistrationResponse mapToRegistrationResponse(VendorProfile profile) {
        return VendorRegistrationResponse.builder()
                .vendorId(profile.getId())
                .businessName(profile.getBusinessName())
                .registrationNumber(profile.getRegistrationNumber())
                .officialEmail(profile.getOfficialEmail())
                .status(profile.getStatus().name())
                .createdAt(profile.getCreatedAt())
                .build();
    }

    private VendorProfileResponse mapToProfileResponse(VendorProfile profile) {
        VendorProfileResponse.OfficerDetail officerDetail = null;
        if (profile.getAuthorizedOfficer() != null) {
            officerDetail = VendorProfileResponse.OfficerDetail.builder()
                    .nicOrPassportNo(profile.getAuthorizedOfficer().getNicOrPassportNo())
                    .name(profile.getAuthorizedOfficer().getName())
                    .designation(profile.getAuthorizedOfficer().getDesignation())
                    .mobilePhone(profile.getAuthorizedOfficer().getMobilePhone())
                    .email(profile.getAuthorizedOfficer().getEmail())
                    .build();
        }

        List<VendorDocumentResponse> docs = profile.getDocuments().stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());

        return VendorProfileResponse.builder()
                .vendorId(profile.getId())
                .status(profile.getStatus().name())
                .businessName(profile.getBusinessName())
                .registrationAuthority(profile.getRegistrationAuthority())
                .registrationNumber(profile.getRegistrationNumber())
                .organizationType(profile.getOrganizationType().name())
                .country(profile.getCountry())
                .registrationAddress(profile.getRegistrationAddress())
                .city(profile.getCity())
                .province(profile.getProvince())
                .website(profile.getWebsite())
                .officialEmail(profile.getOfficialEmail())
                .officialTelephone(profile.getOfficialTelephone())
                .cidaGrade(profile.getCidaGrade())
                .drcVerified(Boolean.TRUE.equals(profile.getDrcVerified()))
                .drcCompanyName(profile.getDrcCompanyName())
                .drcIncorporationDate(profile.getDrcIncorporationDate())
                .authorizedOfficer(officerDetail)
                .documents(docs)
                .termsAccepted(profile.getTermsAccepted())
                .termsAcceptedAt(profile.getTermsAcceptedAt())
                .rejectionReason(profile.getRejectionReason())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private VendorDocumentResponse mapToDocumentResponse(VendorDocument doc) {
        return VendorDocumentResponse.builder()
                .docId(doc.getId())
                .documentType(doc.getDocumentType().name())
                .documentTitle(doc.getDocumentTitle())
                .originalFileName(doc.getOriginalFileName())
                .fileSizeBytes(doc.getFileSizeBytes())
                .mimeType(doc.getMimeType())
                .uploadedAt(doc.getCreatedAt())
                .build();
    }

    @Override
    public VendorProfileResponse getVendorByEmail(String email) {
        log.info("Fetching vendor profile for email: {}", email);
        VendorProfile profile = vendorProfileRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found with email: " + email));
        return mapToProfileResponse(profile);
    }
}
