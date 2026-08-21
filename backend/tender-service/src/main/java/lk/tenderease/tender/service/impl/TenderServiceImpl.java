package lk.tenderease.tender.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.common.event.NotificationEvent;
import lk.tenderease.tender.dto.request.ComplianceChecklistRequest;
import lk.tenderease.tender.dto.request.CreateTenderRequest;
import lk.tenderease.tender.dto.request.DocumentUploadRequest;
import lk.tenderease.tender.dto.request.TenderScheduleRequest;
import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.entity.ClarificationResponse;
import lk.tenderease.tender.entity.Department;
import lk.tenderease.tender.entity.FundingSource;
import lk.tenderease.tender.entity.Ministry;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.entity.TenderAmendment;
import lk.tenderease.tender.entity.TenderClarification;
import lk.tenderease.tender.entity.TenderDocument;
import lk.tenderease.tender.entity.TenderSchedule;
import lk.tenderease.tender.entity.TenderTimeline;
import lk.tenderease.tender.enums.TimelineEventType;
import lk.tenderease.tender.entity.TenderComplianceChecklist;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lk.tenderease.tender.producer.NotificationProducer;
import lk.tenderease.tender.repository.ClarificationResponseRepository;
import lk.tenderease.tender.repository.DepartmentRepository;
import lk.tenderease.tender.repository.FundingSourceRepository;
import lk.tenderease.tender.repository.MinistryRepository;
import lk.tenderease.tender.repository.SbdTemplateRepository;
import lk.tenderease.tender.dto.event.TenderSubmittedEvent;
import lk.tenderease.tender.dto.request.CreateAddendumRequest;
import lk.tenderease.tender.entity.AddendumVersion;
import lk.tenderease.tender.exception.AddendumNotFoundException;
import lk.tenderease.tender.exception.AddendumVersionConflictException;
import lk.tenderease.tender.exception.AddendumVersionNotFoundException;
import lk.tenderease.tender.exception.TenderNotFoundException;
import lk.tenderease.tender.repository.AddendumVersionRepository;
import lk.tenderease.tender.repository.TenderAmendmentRepository;
import lk.tenderease.tender.repository.TenderClarificationRepository;
import lk.tenderease.tender.repository.TenderContactRepository;
import lk.tenderease.tender.repository.TenderDocumentRepository;
import lk.tenderease.tender.repository.TenderRepository;
import lk.tenderease.tender.repository.TenderScheduleRepository;
import lk.tenderease.tender.repository.TenderTimelineRepository;
import lk.tenderease.tender.service.S3Service;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import lk.tenderease.common.exception.BusinessException;
import lk.tenderease.tender.enums.DocumentType;
import lk.tenderease.tender.enums.TimelineEventType;
import lk.tenderease.tender.entity.TenderTimeline;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenderServiceImpl implements TenderService {

    private final MinistryRepository ministryRepository;
    private final DepartmentRepository departmentRepository;
    private final FundingSourceRepository fundingSourceRepository;
    private final SbdTemplateRepository sbdTemplateRepository;
    private final TenderRepository tenderRepository;
    private final TenderDocumentRepository documentRepository;
    private final TenderAmendmentRepository amendmentRepository;
    private final AddendumVersionRepository addendumVersionRepository;
    private final TenderClarificationRepository clarificationRepository;
    private final ClarificationResponseRepository responseRepository;
    private final TenderTimelineRepository timelineRepository;
    private final TenderContactRepository contactRepository;
    private final TenderScheduleRepository scheduleRepository;
    private final NotificationProducer notificationProducer;
    private final S3Service s3Service;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${services.user-service.url:http://localhost:8081}")
    private String userServiceUrl;

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.tender:tender.exchange}")
    private String tenderExchangeName;

    @Value("${rabbitmq.routing-keys.tender-submitted:tender.submitted}")
    private String tenderSubmittedRoutingKey;

    @Override
    @Transactional
    public TenderResponse createTender(CreateTenderRequest request, String createdByUserId) {
        log.info("Creating tender '{}' for user '{}'", request.getTitle(), createdByUserId);

        // Check for duplicate tender number
        if (tenderRepository.existsByTenderNumber(request.getTenderNumber())) {
            throw new BusinessException("Tender number '" + request.getTenderNumber() + "' already exists");
        }

        // Fetch related entities
        Ministry ministry = ministryRepository.findById(request.getMinistryId())
                .orElseThrow(() -> new RuntimeException("Ministry not found with ID: " + request.getMinistryId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        FundingSource fundingSource = null;
        if (request.getFundingSourceId() != null) {
            fundingSource = fundingSourceRepository.findById(request.getFundingSourceId())
                    .orElseThrow(() -> new RuntimeException(
                            "Funding source not found with ID: " + request.getFundingSourceId()));
        }

        // Build tender entity
        Tender tender = Tender.builder()
                .tenderNumber(request.getTenderNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .procurementType(request.getProcurementType())
                .biddingMethod(request.getBiddingMethod())
                .tenderType(request.getTenderType())
                .ministry(ministry)
                .department(department)
                .estimatedBudget(request.getEstimatedBudget())
                .fundingSource(fundingSource)
                .templateId(request.getTemplateId())
                .dynamicData(request.getDynamicData())
                .status(TenderStatus.DRAFT)
                .build();

        // Set audit fields manually (since AuditorAware is not configured for dev)
        tender.setCreatedBy(createdByUserId != null ? createdByUserId : "dev-user");
        tender.setCreatedAt(LocalDateTime.now());
        tender.setEstimatedBudget(request.getEstimatedBudget());
        tender.setSbdTemplate(request.getSbdTemplate());
        tender.setTemplateVersion(request.getTemplateVersion());

        Tender saved = tenderRepository.save(tender);
        log.info("Tender created with ID: {}", saved.getId());

        // Fetch officer profile from user-service
        String officerName = "Procurement Officer";
        String designation = "Head of Procurement";
        String email = createdByUserId != null && createdByUserId.contains("@") ? createdByUserId
                : "officer@tenderease.lk";
        String phone = "+94 (0) 11 234 5678";

        try {
            if (email.contains("@")) {
                log.info("Fetching officer profile for email: {}", email);
                com.fasterxml.jackson.databind.JsonNode profile = restTemplate.getForObject(
                        userServiceUrl + "/api/v1/officers/email/" + email,
                        com.fasterxml.jackson.databind.JsonNode.class);

                if (profile != null) {
                    if (profile.has("liaisonOfficer") && !profile.get("liaisonOfficer").isNull()) {
                        com.fasterxml.jackson.databind.JsonNode liaison = profile.get("liaisonOfficer");
                        officerName = liaison.has("name") ? liaison.get("name").asText() : officerName;
                        designation = liaison.has("designation") ? liaison.get("designation").asText() : designation;
                        phone = liaison.has("mobile") ? liaison.get("mobile").asText() : phone;
                    } else {
                        officerName = profile.has("organizationName") ? profile.get("organizationName").asText()
                                : officerName;
                        designation = profile.has("headDesignation") ? profile.get("headDesignation").asText()
                                : designation;
                        phone = profile.has("personalLandPhone") ? profile.get("personalLandPhone").asText() : phone;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch officer profile for email {}. Using default contact info. Error: {}", email,
                    e.getMessage());
        }

        // Create contact for the officer
        lk.tenderease.tender.entity.TenderContact contact = lk.tenderease.tender.entity.TenderContact.builder()
                .tender(saved)
                .officerName(officerName)
                .designation(designation)
                .email(email)
                .phone(phone)
                .build();
        contactRepository.save(contact);

        // Auto-record CREATED timeline event
        recordTimelineEvent(saved, TimelineEventType.CREATED,
                "Tender '" + saved.getTitle() + "' was created and saved as draft.");

        return mapToResponse(saved);
    }

    private TenderResponse mapToResponse(Tender tender) {
        if (tender == null)
            return null;

        log.debug("Mapping tender {} to response", tender.getId());

        LocalDateTime effectiveClosingDate = tender.getClosingDate();
        if (effectiveClosingDate == null && tender.getSchedule() != null
                && tender.getSchedule().getBidSubmissionDeadline() != null) {
            effectiveClosingDate = tender.getSchedule().getBidSubmissionDeadline().atStartOfDay();
        }

        TenderResponse.TenderResponseBuilder<?, ?> builder = TenderResponse.builder()
                .id(tender.getId())
                .tenderNumber(tender.getTenderNumber())
                .title(tender.getTitle())
                .description(tender.getDescription())
                .procurementType(tender.getProcurementType())
                .biddingMethod(tender.getBiddingMethod())
                .tenderType(tender.getTenderType())
                .estimatedBudget(tender.getEstimatedBudget())
                .status(tender.getStatus())
                .createdAt(tender.getCreatedAt())
                .updatedAt(tender.getUpdatedAt())
                .createdBy(tender.getCreatedBy())
                .closingDate(effectiveClosingDate)
                .timeRemaining(calculateTimeRemaining(effectiveClosingDate))
                .rejectionReason(tender.getRejectionReason())
                .sbdTemplate(tender.getSbdTemplate())
                .templateVersion(tender.getTemplateVersion());

        // Defensive mapping for relationships
        if (tender.getMinistry() != null) {
            builder.ministryId(tender.getMinistry().getId());
            builder.ministryName(tender.getMinistry().getName());
        }

        if (tender.getDepartment() != null) {
            builder.departmentId(tender.getDepartment().getId());
            builder.departmentName(tender.getDepartment().getName());
        }

        if (tender.getFundingSource() != null) {
            builder.fundingSourceId(tender.getFundingSource().getId());
            builder.fundingSourceName(tender.getFundingSource().getName());
        }

        return builder.build();
    }

    @Override
    public TenderDetailResponse getTenderById(UUID id) {
        log.info("Fetching tender detail for ID: {}", id);
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));

        TenderDetailResponse response = new TenderDetailResponse();
        // Map from base TenderResponse (reusing the logic from mapToResponse if needed,
        // but let's be explicit)
        TenderResponse base = mapToResponse(tender);

        // Manual copy to the subclass
        response.setId(base.getId());
        response.setTenderNumber(base.getTenderNumber());
        response.setTitle(base.getTitle());
        response.setDescription(base.getDescription());
        response.setProcurementType(base.getProcurementType());
        response.setBiddingMethod(base.getBiddingMethod());
        response.setTenderType(base.getTenderType());
        response.setMinistryId(base.getMinistryId());
        response.setMinistryName(base.getMinistryName());
        response.setDepartmentId(base.getDepartmentId());
        response.setDepartmentName(base.getDepartmentName());
        response.setEstimatedBudget(tender.getEstimatedBudget());
        response.setSbdTemplate(tender.getSbdTemplate());
        response.setTemplateVersion(tender.getTemplateVersion());

        response.setFundingSourceId(base.getFundingSourceId());
        response.setFundingSourceName(base.getFundingSourceName());
        response.setStatus(base.getStatus());
        response.setCreatedAt(base.getCreatedAt());
        response.setUpdatedAt(base.getUpdatedAt());
        response.setCreatedBy(base.getCreatedBy());
        response.setClosingDate(base.getClosingDate());
        response.setTimeRemaining(base.getTimeRemaining());
        response.setRejectionReason(base.getRejectionReason());

        // Map specific details (documents, schedule, checklist)
        response.setDocuments(documentRepository.findByTenderId(id).stream().map(doc -> TenderDocumentResponse.builder()
                .id(doc.getId())
                .tenderId(doc.getTender().getId())
                .documentName(doc.getDocumentName())
                .documentType(doc.getDocumentType())
                .sbdTemplateId(doc.getSbdTemplate() != null ? doc.getSbdTemplate().getId() : null)
                .templateVersion(doc.getSbdTemplate() != null ? doc.getSbdTemplate().getVersion() : null)
                .fileSizeBytes(doc.getFileSizeBytes())
                .mimeType(doc.getMimeType())
                .uploadedAt(doc.getUploadedAt())
                .build()).collect(java.util.stream.Collectors.toList()));
        response.setSchedule(getSchedule(id));
        response.setComplianceChecklist(getComplianceChecklist(id));

        try {
            response.setNoticePreview(generateNoticePreview(id).getGeneratedText());
        } catch (Exception e) {
            log.warn("Notice preview could not be generated: {}", e.getMessage());
        }

        return response;
    }

    public TenderDetailResponse getTenderByNumber(String tenderNumber) {
        log.info("Fetching tender detail for number: {}", tenderNumber);
        Tender tender = tenderRepository.findByTenderNumber(tenderNumber)
                .orElseThrow(() -> new RuntimeException("Tender not found with number: " + tenderNumber));
        return getTenderById(tender.getId());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public TenderResponse updateTender(UUID id, CreateTenderRequest request, String callerUserId) {
        log.info("Updating tender with ID: {}", id);
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));

        if (tender.getStatus() != TenderStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT tenders can be updated");
        }

        Ministry ministry = ministryRepository.findById(request.getMinistryId())
                .orElseThrow(() -> new RuntimeException("Ministry not found with ID: " + request.getMinistryId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        FundingSource fundingSource = null;
        if (request.getFundingSourceId() != null) {
            fundingSource = fundingSourceRepository.findById(request.getFundingSourceId())
                    .orElseThrow(() -> new RuntimeException(
                            "Funding source not found with ID: " + request.getFundingSourceId()));
        }

        tender.setTenderNumber(request.getTenderNumber());
        tender.setTitle(request.getTitle());
        tender.setDescription(request.getDescription());
        tender.setProcurementType(request.getProcurementType());
        tender.setBiddingMethod(request.getBiddingMethod());
        tender.setTenderType(request.getTenderType());
        tender.setMinistry(ministry);
        tender.setDepartment(department);
        tender.setEstimatedBudget(request.getEstimatedBudget());
        tender.setFundingSource(fundingSource);
        tender.setTemplateId(request.getTemplateId());
        tender.setDynamicData(request.getDynamicData());

        tender.setUpdatedAt(java.time.LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

        return mapToResponse(saved);
    }

    @Override
    public void deleteTender(UUID id, String callerUserId) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));
        tenderRepository.delete(tender);
    }

    @Override
    public PageResponse<TenderResponse> listMyTenders(TenderStatus status, Pageable pageable, String callerUserId) {
        org.springframework.data.domain.Page<Tender> tenderPage;
        if (status != null) {
            tenderPage = tenderRepository.findByCreatedByAndStatus(callerUserId, status, pageable);
        } else {
            tenderPage = tenderRepository.findByCreatedBy(callerUserId, pageable);
        }

        java.util.List<TenderResponse> content = tenderPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<TenderResponse>builder()
                .content(content)
                .pageNumber(tenderPage.getNumber())
                .pageSize(tenderPage.getSize())
                .totalElements(tenderPage.getTotalElements())
                .totalPages(tenderPage.getTotalPages())
                .last(tenderPage.isLast())
                .build();
    }

    @Override
    public PageResponse<TenderResponse> listAllTenders(TenderStatus status, Pageable pageable) {
        org.springframework.data.domain.Page<Tender> tenderPage;
        if (status != null) {
            tenderPage = tenderRepository.findByStatus(status, pageable);
        } else {
            tenderPage = tenderRepository.findAll(pageable);
        }

        java.util.List<TenderResponse> content = tenderPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<TenderResponse>builder()
                .content(content)
                .pageNumber(tenderPage.getNumber())
                .pageSize(tenderPage.getSize())
                .totalElements(tenderPage.getTotalElements())
                .totalPages(tenderPage.getTotalPages())
                .last(tenderPage.isLast())
                .build();
    }

    @Override
    public TenderDocumentResponse uploadDocument(UUID tenderId, DocumentUploadRequest request, String callerUserId) {
        log.info("Uploading document for tender ID: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + tenderId));

        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new RuntimeException("File is empty or missing.");
        }

        String docName = request.getFile().getOriginalFilename();
        if (docName == null || docName.trim().isEmpty()) {
            docName = "Document_" + java.util.UUID.randomUUID().toString();
        }

        String fileName = java.util.UUID.randomUUID().toString() + "_" + docName;
        log.info("Saving uploaded file to S3 with key: {}", fileName);

        try {
            s3Service.uploadFile(fileName, request.getFile());
            log.info("File successfully uploaded to S3.");
        } catch (IOException e) {
            log.error("CRITICAL: Failed to store file to S3. Error: {}", e.getMessage());
            throw new RuntimeException("Could not store file", e);
        }

        // Save metadata to TenderDocument
        lk.tenderease.tender.entity.TenderDocument doc = lk.tenderease.tender.entity.TenderDocument.builder()
                .tender(tender)
                .documentName(docName)
                .documentType(request.getDocumentType() != null ? request.getDocumentType() : DocumentType.OTHER)
                .s3Key(fileName) // We use s3Key to store the local filename
                .fileSizeBytes(request.getFile().getSize())
                .mimeType(request.getFile().getContentType() != null ? request.getFile().getContentType()
                        : "application/octet-stream")
                .uploadedAt(java.time.LocalDateTime.now())
                .build();

        lk.tenderease.tender.entity.TenderDocument savedDoc = documentRepository.save(doc);
        log.info("Document saved successfully with ID: {}", savedDoc.getId());

        return TenderDocumentResponse.builder()
                .id(savedDoc.getId())
                .tenderId(tenderId)
                .documentName(savedDoc.getDocumentName())
                .documentType(savedDoc.getDocumentType())
                .fileSizeBytes(savedDoc.getFileSizeBytes())
                .mimeType(savedDoc.getMimeType())
                .uploadedAt(savedDoc.getUploadedAt())
                .build();
    }

    @Override
    public byte[] viewDocument(UUID docId) {
        log.info("Fetching document for viewing: {}", docId);
        TenderDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Path filePath = Paths.get(uploadDir).resolve(doc.getS3Key());
        log.info("Attempting to read file from path: {}", filePath.toAbsolutePath());
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Failed to read file: {}", e.getMessage());
            throw new RuntimeException("Could not read file", e);
        }
    }

    @Override
    public void deleteDocument(UUID tenderId, UUID docId, String callerUserId) {
        lk.tenderease.tender.entity.TenderDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!doc.getTender().getId().equals(tenderId)) {
            throw new RuntimeException("Document does not belong to tender");
        }

        try {
            Path filePath = Paths.get(uploadDir).resolve(doc.getS3Key());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete file from disk: {}", e.getMessage());
        }

        documentRepository.delete(doc);
    }

    @Override
    public TenderScheduleResponse getSchedule(UUID tenderId) {
        log.debug("Fetching schedule for tender: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found"));

        if (tender.getSchedule() == null) {
            return TenderScheduleResponse.builder().build();
        }

        TenderSchedule schedule = tender.getSchedule();
        return TenderScheduleResponse.builder()
                .advertisementStartDate(schedule.getAdvertisementStartDate())
                .bidSubmissionDeadline(schedule.getBidSubmissionDeadline())
                .preBidMeetingEnabled(schedule.getPreBidMeetingEnabled())
                .preBidMeetingDate(schedule.getPreBidMeetingDate())
                .preBidMeetingTime(schedule.getPreBidMeetingTime())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public TenderScheduleResponse saveSchedule(UUID tenderId, TenderScheduleRequest request, String callerUserId) {
        log.debug("Saving schedule for tender: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found"));

        TenderSchedule schedule = tender.getSchedule();
        if (schedule == null) {
            schedule = new TenderSchedule();
            schedule.setTender(tender);
        }

        schedule.setAdvertisementStartDate(request.getAdvertisementStartDate());
        schedule.setBidSubmissionDeadline(request.getBidSubmissionDeadline());
        schedule.setPreBidMeetingEnabled(request.getPreBidMeetingEnabled());
        schedule.setPreBidMeetingDate(request.getPreBidMeetingDate());
        schedule.setPreBidMeetingTime(request.getPreBidMeetingTime());

        tender.setSchedule(schedule);
        tender.setUpdatedAt(java.time.LocalDateTime.now());
        tenderRepository.save(tender);

        return TenderScheduleResponse.builder()
                .advertisementStartDate(schedule.getAdvertisementStartDate())
                .bidSubmissionDeadline(schedule.getBidSubmissionDeadline())
                .preBidMeetingEnabled(schedule.getPreBidMeetingEnabled())
                .preBidMeetingDate(schedule.getPreBidMeetingDate())
                .preBidMeetingTime(schedule.getPreBidMeetingTime())
                .build();
    }

    @Override
    public ComplianceChecklistResponse getComplianceChecklist(UUID tenderId) {
        log.debug("Fetching checklist for tender: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found"));

        if (tender.getComplianceChecklist() == null) {
            return ComplianceChecklistResponse.builder().allComplete(false).build();
        }

        TenderComplianceChecklist cl = tender.getComplianceChecklist();
        boolean allComplete = Boolean.TRUE.equals(cl.getProcurementPlanApproved()) &&
                Boolean.TRUE.equals(cl.getBudgetAvailabilityConfirmed()) &&
                Boolean.TRUE.equals(cl.getSbdsCompliantWithGuidelines()) &&
                Boolean.TRUE.equals(cl.getEvaluationCriteriaDefined());

        return ComplianceChecklistResponse.builder()
                .id(cl.getId())
                .tenderId(tenderId)
                .procurementPlanApproved(cl.getProcurementPlanApproved())
                .budgetAvailabilityConfirmed(cl.getBudgetAvailabilityConfirmed())
                .sbdsCompliantWithGuidelines(cl.getSbdsCompliantWithGuidelines())
                .evaluationCriteriaDefined(cl.getEvaluationCriteriaDefined())
                .allComplete(allComplete)
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ComplianceChecklistResponse saveComplianceChecklist(UUID tenderId, ComplianceChecklistRequest request,
            String callerUserId) {
        log.debug("Saving checklist for tender: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found"));

        TenderComplianceChecklist cl = tender.getComplianceChecklist();
        if (cl == null) {
            cl = new TenderComplianceChecklist();
            cl.setTender(tender);
        }

        cl.setProcurementPlanApproved(request.getProcurementPlanApproved());
        cl.setBudgetAvailabilityConfirmed(request.getBudgetAvailabilityConfirmed());
        cl.setSbdsCompliantWithGuidelines(request.getSbdsCompliantWithGuidelines());
        cl.setEvaluationCriteriaDefined(request.getEvaluationCriteriaDefined());

        tender.setComplianceChecklist(cl);
        tender.setUpdatedAt(java.time.LocalDateTime.now());
        tenderRepository.save(tender);

        boolean allComplete = Boolean.TRUE.equals(cl.getProcurementPlanApproved()) &&
                Boolean.TRUE.equals(cl.getBudgetAvailabilityConfirmed()) &&
                Boolean.TRUE.equals(cl.getSbdsCompliantWithGuidelines()) &&
                Boolean.TRUE.equals(cl.getEvaluationCriteriaDefined());

        return ComplianceChecklistResponse.builder()
                .id(cl.getId())
                .tenderId(tenderId)
                .procurementPlanApproved(cl.getProcurementPlanApproved())
                .budgetAvailabilityConfirmed(cl.getBudgetAvailabilityConfirmed())
                .sbdsCompliantWithGuidelines(cl.getSbdsCompliantWithGuidelines())
                .evaluationCriteriaDefined(cl.getEvaluationCriteriaDefined())
                .allComplete(allComplete)
                .build();
    }

    @Override
    public TenderNoticePreviewResponse generateNoticePreview(UUID tenderId) {
        log.debug("Generating notice preview for tender: {}", tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found"));

        String notice = String.format("INVITATION FOR BIDS\n\nTender: %s\nTitle: %s\nProcurement Type: %s",
                tender.getTenderNumber(), tender.getTitle(), tender.getProcurementType());

        return TenderNoticePreviewResponse.builder()
                .tenderId(tenderId)
                .tenderNumber(tender.getTenderNumber())
                .title(tender.getTitle())
                .biddingMethod(tender.getBiddingMethod())
                .generatedText(notice)
                .build();
    }

    @Override
    @Transactional
    public TenderResponse submitForApproval(UUID tenderId, String callerUserId) {
        log.info("Attempting to submit tender {} for approval. Caller: {}", tenderId, callerUserId);

        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + tenderId));

        if (tender.getStatus() != TenderStatus.DRAFT) {
            log.warn("Tender {} is in status {}, cannot submit.", tenderId, tender.getStatus());
            throw new RuntimeException(
                    "Only DRAFT tenders can be submitted for approval. Current status: " + tender.getStatus());
        }

        // 1. Set to Pending Approval
        tender.setStatus(TenderStatus.PENDING_APPROVAL);

        // Set closingDate from schedule's bid submission deadline if available
        lk.tenderease.tender.entity.TenderSchedule schedule = scheduleRepository.findByTenderId(tenderId).orElse(null);
        if (schedule != null && schedule.getBidSubmissionDeadline() != null) {
            tender.setClosingDate(schedule.getBidSubmissionDeadline().atStartOfDay());
        } else {
            // Default: 14 days from now
            tender.setClosingDate(LocalDateTime.now().plusDays(14));
        }

        tender.setUpdatedAt(LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

        // Auto-record SUBMITTED timeline event
        recordTimelineEvent(saved, TimelineEventType.SUBMITTED,
                "Tender submitted for CAO approval by " + (callerUserId != null ? callerUserId : "officer") + ".");

        // 2. Publish event to RabbitMQ for Notification Service
        try {
            TenderSubmittedEvent event = TenderSubmittedEvent.builder()
                    .tenderId(saved.getId())
                    .tenderNumber(saved.getTenderNumber())
                    .title(saved.getTitle())
                    .submittedBy(callerUserId != null ? callerUserId : "dev-user")
                    .submittedAt(LocalDateTime.now())
                    .build();

            log.info("Publishing TenderSubmittedEvent for tender: {}", saved.getTenderNumber());
            rabbitTemplate.convertAndSend(tenderExchangeName, tenderSubmittedRoutingKey, event);
        } catch (Exception e) {
            log.error("Failed to publish notification event: {}", e.getMessage());
            // We don't block the submission if notification fails, but we log it
        }

        // 3. Simple console log
        log.info("Tender {} has been successfully created and sent for review.", saved.getTenderNumber());

        return mapToResponse(saved);
    }

    @Override
    public Page<TenderSummaryDTO> getAllPublishedTenders(String search, TenderStatus status,
            ProcurementType procurementType, Pageable pageable) {
        String keyword = search == null ? "" : search;

        if (status != null) {
            return tenderRepository.searchWithStatus(keyword, status, procurementType, pageable)
                    .map(this::mapToSummaryDTO);
        }

        return tenderRepository.searchWithoutStatus(keyword, procurementType, pageable)
                .map(this::mapToSummaryDTO);
    }

    @Override
    public TenderDetailsDTO getPublicTenderById(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));
        return mapToDetailsDTO(tender);
    }

    public TenderDetailsDTO getPublicTenderByNumber(String tenderNumber) {
        log.info("Fetching public tender detail for number: {}", tenderNumber);
        Tender tender = tenderRepository.findByTenderNumber(tenderNumber)
                .orElseThrow(() -> new RuntimeException("Tender not found with number: " + tenderNumber));
        return getPublicTenderById(tender.getId());
    }

    @Override
    public List<TenderDocumentDTO> getDocuments(UUID tenderId) {
        return documentRepository.findByTenderId(tenderId).stream()
                .map(this::mapDocument)
                .collect(Collectors.toList());
    }

    @Override
    public List<TenderAmendmentDTO> getAddenda(UUID tenderId) {
        return amendmentRepository.findByTenderIdOrderByCreatedAtDesc(tenderId).stream()
                .map(this::mapAmendment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenderAmendmentDTO createAddendum(UUID tenderId, CreateAddendumRequest request, MultipartFile file,
            String callerUserId) {
        log.info("Creating addendum for tender ID: {} by user: {}", tenderId, callerUserId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new TenderNotFoundException("Tender not found with ID: " + tenderId));

        int nextAmendmentNumber = amendmentRepository.findByTenderIdOrderByCreatedAtDesc(tenderId).size() + 1;

        TenderAmendment amendment = TenderAmendment.builder()
                .tender(tender)
                .amendmentNumber(nextAmendmentNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .newClosingDate(request.getNewClosingDate())
                .createdAt(LocalDateTime.now())
                .build();

        TenderAmendment savedAmendment = amendmentRepository.save(amendment);

        if (request.getNewClosingDate() != null) {
            tender.setClosingDate(request.getNewClosingDate());
            tenderRepository.save(tender);
        }

        if (file != null && !file.isEmpty()) {
            String changeDesc = request.getChangeDescription() != null && !request.getChangeDescription().isBlank()
                    ? request.getChangeDescription()
                    : "Initial version";
            uploadAddendumVersionInternal(tender, savedAmendment, file, changeDesc, callerUserId);
        }

        return mapAmendment(savedAmendment);
    }

    @Override
    @Transactional
    public AddendumVersionResponse uploadAddendumVersion(UUID tenderId, Long addendumId, MultipartFile file,
            String changeDescription, String callerUserId) {
        log.info("Uploading version for addendum ID: {} on tender ID: {}", addendumId, tenderId);
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new TenderNotFoundException("Tender not found with ID: " + tenderId));

        TenderAmendment addendum = amendmentRepository.findById(addendumId)
                .orElseThrow(() -> AddendumNotFoundException.of(addendumId));

        if (!addendum.getTender().getId().equals(tenderId)) {
            throw new BusinessException("Addendum does not belong to the specified tender");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is empty or missing");
        }

        return uploadAddendumVersionInternal(tender, addendum, file, changeDescription, callerUserId);
    }

    private AddendumVersionResponse uploadAddendumVersionInternal(Tender tender, TenderAmendment addendum,
            MultipartFile file, String changeDescription, String callerUserId) {
        Integer maxVersion = addendumVersionRepository.findMaxVersionNumber(addendum.getId());
        int nextVersion = (maxVersion != null ? maxVersion : 0) + 1;

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "addendum_v" + nextVersion + ".pdf";
        }

        String key = String.format("tenderease/tenders/%s/addenda/%d/v%d_%s", tender.getId(), addendum.getId(),
                nextVersion, originalFilename);
        try {
            s3Service.uploadFile(key, file);
        } catch (java.io.IOException e) {
            throw new BusinessException("Failed to upload file to S3");
        }

        AddendumVersion version = AddendumVersion.builder()
                .addendum(addendum)
                .versionNumber(nextVersion)
                .cloudinaryPublicId(key)
                .cloudinaryUrl("s3://" + key)
                .secureUrl("s3://" + key)
                .originalFilename(originalFilename)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/pdf")
                .fileSize(file.getSize())
                .changeDescription(changeDescription)
                .uploadedBy(callerUserId)
                .createdAt(LocalDateTime.now())
                .build();

        try {
            AddendumVersion savedVersion = addendumVersionRepository.save(version);
            addendum.setVersion(nextVersion);
            amendmentRepository.save(addendum);
            log.info("Addendum version {} saved successfully with ID: {}", nextVersion, savedVersion.getId());
            return mapAddendumVersion(savedVersion);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.error("Conflict creating addendum version: {}", ex.getMessage());
            throw AddendumVersionConflictException.of(addendum.getId(), nextVersion);
        }
    }

    private AddendumVersionResponse mapAddendumVersion(AddendumVersion version) {
        return AddendumVersionResponse.builder()
                .id(version.getId())
                .versionNumber(version.getVersionNumber())
                .secureUrl(version.getSecureUrl())
                .originalFilename(version.getOriginalFilename())
                .contentType(version.getContentType())
                .fileSize(version.getFileSize())
                .changeDescription(version.getChangeDescription())
                .uploadedBy(version.getUploadedBy())
                .createdAt(version.getCreatedAt())
                .build();
    }

    @Override
    public List<AddendumVersionResponse> getAddendumVersionHistory(UUID tenderId, Long addendumId) {
        validateTenderAndAddendum(tenderId, addendumId);
        return addendumVersionRepository.findByAddendumIdOrderByVersionNumberAsc(addendumId).stream()
                .map(this::mapAddendumVersion)
                .collect(Collectors.toList());
    }

    @Override
    public AddendumVersionResponse getAddendumVersion(UUID tenderId, Long addendumId, Integer versionNumber) {
        validateTenderAndAddendum(tenderId, addendumId);
        return addendumVersionRepository.findByAddendumIdAndVersionNumber(addendumId, versionNumber)
                .map(this::mapAddendumVersion)
                .orElseThrow(() -> AddendumVersionNotFoundException.of(addendumId, versionNumber));
    }

    @Override
    public AddendumVersionResponse getCurrentAddendumVersion(UUID tenderId, Long addendumId) {
        validateTenderAndAddendum(tenderId, addendumId);
        return addendumVersionRepository.findTopByAddendumIdOrderByVersionNumberDesc(addendumId)
                .map(this::mapAddendumVersion)
                .orElseThrow(
                        () -> new AddendumVersionNotFoundException("No versions found for addendum ID: " + addendumId));
    }

    private TenderAmendment validateTenderAndAddendum(UUID tenderId, Long addendumId) {
        if (!tenderRepository.existsById(tenderId)) {
            throw new TenderNotFoundException("Tender not found with ID: " + tenderId);
        }
        TenderAmendment addendum = amendmentRepository.findById(addendumId)
                .orElseThrow(() -> AddendumNotFoundException.of(addendumId));
        if (!addendum.getTender().getId().equals(tenderId)) {
            throw new BusinessException("Addendum does not belong to the specified tender");
        }
        return addendum;
    }

    @Override
    public List<ClarificationDTO> getClarifications(UUID tenderId) {
        return clarificationRepository.findByTenderIdOrderByAskedAtDesc(tenderId).stream()
                .map(clarification -> {
                    var response = responseRepository.findByClarificationId(clarification.getId());
                    return ClarificationDTO.builder()
                            .id(clarification.getId())
                            .question(clarification.getQuestion())
                            .answer(response.map(ClarificationResponse::getResponse).orElse(null))
                            .askedAt(clarification.getAskedAt())
                            .answeredAt(response.map(ClarificationResponse::getRespondedAt).orElse(null))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private java.util.Map<String, String> fetchCreatorInfo(String createdBy) {
        java.util.Map<String, String> info = new java.util.HashMap<>();
        info.put("name", "Procurement Officer");
        info.put("role", "Procuring Entity");
        if (createdBy == null || createdBy.trim().isEmpty() || createdBy.equalsIgnoreCase("dev-user")) {
            return info;
        }
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://localhost:8081/api/officers";
            if (createdBy.contains("@")) {
                url += "/email/" + createdBy;
            } else {
                url += "/keycloak/" + createdBy;
            }
            java.util.Map<?, ?> response = restTemplate.getForObject(url, java.util.Map.class);
            if (response != null) {
                // Prefer the liaison officer's personal full name for the USER column
                java.util.Map<?, ?> liaisonOfficer = null;
                Object liaisonObj = response.get("liaisonOfficer");
                if (liaisonObj instanceof java.util.Map) {
                    liaisonOfficer = (java.util.Map<?, ?>) liaisonObj;
                }

                String fullName = null;
                String designation = null;

                if (liaisonOfficer != null) {
                    String liaisonName = (String) liaisonOfficer.get("name");
                    String liaisonTitle = (String) liaisonOfficer.get("title");
                    String liaisonDesignation = (String) liaisonOfficer.get("designation");
                    if (liaisonName != null && !liaisonName.trim().isEmpty()) {
                        // Prefix with title if available (e.g. "Mr. John Doe")
                        fullName = (liaisonTitle != null && !liaisonTitle.trim().isEmpty())
                                ? liaisonTitle + ". " + liaisonName
                                : liaisonName;
                    }
                    if (liaisonDesignation != null && !liaisonDesignation.trim().isEmpty()) {
                        designation = liaisonDesignation;
                    }
                }

                // Fall back to organization name if liaison officer name is not available
                if (fullName == null || fullName.trim().isEmpty()) {
                    String orgName = (String) response.get("organizationName");
                    if (orgName != null && !orgName.trim().isEmpty()) {
                        fullName = orgName;
                    }
                }
                if (designation == null || designation.trim().isEmpty()) {
                    String headDesignation = (String) response.get("headDesignation");
                    if (headDesignation != null && !headDesignation.trim().isEmpty()) {
                        designation = headDesignation;
                    }
                }

                if (fullName != null && !fullName.trim().isEmpty()) {
                    info.put("name", fullName);
                }
                if (designation != null && !designation.trim().isEmpty()) {
                    info.put("role", designation);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch creator info from user-service for key: {}", createdBy, e);
        }
        return info;
    }

    @Override
    public List<TimelineDTO> getTimeline(UUID tenderId) {
        Tender tender = tenderRepository.findById(tenderId).orElse(null);
        String tenderCreator = tender != null ? tender.getCreatedBy() : null;
        java.util.Map<String, String> creatorInfo = fetchCreatorInfo(tenderCreator);

        List<TenderTimeline> databaseEvents = timelineRepository.findByTenderIdOrderByTimestampDesc(tenderId);
        List<TimelineDTO> dtos = databaseEvents.stream()
                .map(event -> {
                    TimelineDTO dto = TimelineDTO.builder()
                            .eventType(event.getEventType())
                            .description(event.getDescription())
                            .timestamp(event.getTimestamp())
                            .createdBy(event.getCreatedBy())
                            .creatorRole(event.getCreatorRole())
                            .build();
                    if (dto.getCreatedBy() == null || dto.getCreatedBy().isBlank()) {
                        if (event.getEventType() == TimelineEventType.CREATED
                                || event.getEventType() == TimelineEventType.PUBLISHED) {
                            dto.setCreatedBy(creatorInfo.get("name"));
                            dto.setCreatorRole(creatorInfo.get("role"));
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toCollection(java.util.ArrayList::new));

        // Dynamically synthesize/enrich events from other microservices
        if (tender != null) {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // Define asynchronous tasks for external service calls in parallel to speed up
            // loading
            java.util.concurrent.CompletableFuture<Void> openingTask = java.util.concurrent.CompletableFuture
                    .runAsync(() -> {
                        try {
                            String sessionUrl = "http://localhost:8084/api/v1/opening/tender/" + tenderId;
                            java.util.Map<?, ?> sessionResponse = restTemplate.getForObject(sessionUrl,
                                    java.util.Map.class);
                            if (sessionResponse != null && sessionResponse.get("data") != null) {
                                java.util.Map<?, ?> sessionData = (java.util.Map<?, ?>) sessionResponse.get("data");
                                String sessionIdStr = (String) sessionData.get("id");
                                Object actualOpeningTimeObj = sessionData.get("actualOpeningTime");
                                String openedBy = (String) sessionData.get("openedBy");

                                if (actualOpeningTimeObj != null) {
                                    LocalDateTime actualOpeningTime = parseLocalDateTime(actualOpeningTimeObj);
                                    synchronized (dtos) {
                                        dtos.add(TimelineDTO.builder()
                                                .eventType(TimelineEventType.SESSION_UNLOCKED)
                                                .description("Session Unlocked: Bid opening session unlocked.")
                                                .timestamp(actualOpeningTime)
                                                .createdBy(openedBy != null ? openedBy : "Procurement Officer")
                                                .creatorRole("Committee")
                                                .build());
                                    }
                                }

                                if (sessionIdStr != null) {
                                    String attendanceUrl = "http://localhost:8084/api/v1/opening/session/"
                                            + sessionIdStr + "/attendance";
                                    java.util.Map<?, ?> attendanceResponse = restTemplate.getForObject(attendanceUrl,
                                            java.util.Map.class);
                                    if (attendanceResponse != null && attendanceResponse.get("data") != null) {
                                        java.util.List<?> attendanceList = (java.util.List<?>) attendanceResponse
                                                .get("data");
                                        synchronized (dtos) {
                                            for (Object itemObj : attendanceList) {
                                                java.util.Map<?, ?> attendee = (java.util.Map<?, ?>) itemObj;
                                                String officerName = (String) attendee.get("officerName");
                                                String designation = (String) attendee.get("designation");
                                                Object attendanceTimeObj = attendee.get("attendanceTime");
                                                if (officerName != null) {
                                                    dtos.add(TimelineDTO.builder()
                                                            .eventType(TimelineEventType.COMMITTEE_CHECKED_IN)
                                                            .description("Committee Checked-In: " + officerName + " ("
                                                                    + (designation != null ? designation : "Officer")
                                                                    + ")")
                                                            .timestamp(parseLocalDateTime(attendanceTimeObj))
                                                            .createdBy(officerName)
                                                            .creatorRole(designation != null ? designation
                                                                    : "Committee Member")
                                                            .build());
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (Exception e) {
                            // ignore
                        }
                    });

            java.util.concurrent.CompletableFuture<Void> bidsTask = java.util.concurrent.CompletableFuture
                    .runAsync(() -> {
                        try {
                            String bidsUrl = "http://localhost:8083/api/bids/tender/" + tenderId;
                            java.util.Map<?, ?> bidsResponse = restTemplate.getForObject(bidsUrl, java.util.Map.class);
                            if (bidsResponse != null && bidsResponse.get("data") != null) {
                                java.util.List<?> bidsList = (java.util.List<?>) bidsResponse.get("data");
                                synchronized (dtos) {
                                    for (Object bidObj : bidsList) {
                                        java.util.Map<?, ?> bid = (java.util.Map<?, ?>) bidObj;
                                        String companyName = (String) bid.get("companyName");
                                        String bidderName = (String) bid.get("bidderName");
                                        Object submittedAtObj = bid.get("submittedAt");
                                        if (companyName != null) {
                                            dtos.add(TimelineDTO.builder()
                                                    .eventType(TimelineEventType.BID_SUBMITTED)
                                                    .description("Bid Submitted: " + companyName
                                                            + " submitted a bid proposal.")
                                                    .timestamp(parseLocalDateTime(submittedAtObj))
                                                    .createdBy(bidderName != null ? bidderName : "Bidder")
                                                    .creatorRole("Bidder")
                                                    .build());
                                        }
                                    }
                                }
                            }
                        } catch (Exception e) {
                            // ignore
                        }
                    });

            java.util.concurrent.CompletableFuture<Void> evalTask = java.util.concurrent.CompletableFuture
                    .runAsync(() -> {
                        try {
                            String tenderNo = tender.getTenderNumber() != null ? tender.getTenderNumber()
                                    : tenderId.toString();
                            String evalUrl = "http://localhost:8084/api/evaluations/mock/" + tenderNo + "/data";
                            java.util.Map<?, ?> evalResponse = restTemplate.getForObject(evalUrl, java.util.Map.class);
                            if (evalResponse != null && evalResponse.get("data") != null) {
                                java.util.Map<?, ?> evalData = (java.util.Map<?, ?>) evalResponse.get("data");
                                java.util.List<?> biddersList = (java.util.List<?>) evalData.get("bidders");
                                if (biddersList != null) {
                                    synchronized (dtos) {
                                        for (Object bidderObj : biddersList) {
                                            java.util.Map<?, ?> bidder = (java.util.Map<?, ?>) bidderObj;
                                            String bidderName = (String) bidder.get("bidderName");
                                            String complianceStatus = (String) bidder.get("complianceStatus");
                                            String status = (String) bidder.get("status");
                                            String evaluatorName = (String) bidder.get("evaluatorName");
                                            String evaluatorRole = (String) bidder.get("evaluatorRole");
                                            Object lastSavedObj = bidder.get("lastSaved");

                                            if (bidderName != null) {
                                                if ("FAIL".equalsIgnoreCase(complianceStatus)) {
                                                    dtos.add(TimelineDTO.builder()
                                                            .eventType(TimelineEventType.COMPLIANCE_MARKED)
                                                            .description("Compliance Status Marked: " + bidderName
                                                                    + " failed compliance review.")
                                                            .timestamp(parseLocalDateTime(lastSavedObj))
                                                            .createdBy(evaluatorName != null ? evaluatorName
                                                                    : "Procurement Officer")
                                                            .creatorRole(evaluatorRole != null ? evaluatorRole
                                                                    : "Procuring Entity")
                                                            .build());
                                                }

                                                if ("COMPLETED".equalsIgnoreCase(status)
                                                        || "Submitted".equalsIgnoreCase(status)) {
                                                    dtos.add(TimelineDTO.builder()
                                                            .eventType(TimelineEventType.SCORES_FINALIZED)
                                                            .description(
                                                                    "Scores Finalized: Consensus scoring submitted for "
                                                                            + bidderName + ".")
                                                            .timestamp(parseLocalDateTime(lastSavedObj))
                                                            .createdBy(evaluatorName != null ? evaluatorName
                                                                    : "Procurement Officer")
                                                            .creatorRole(evaluatorRole != null ? evaluatorRole
                                                                    : "Procuring Entity")
                                                            .build());
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (Exception e) {
                            // ignore
                        }
                    });

            // Wait for all async tasks to complete with a safety timeout of 3 seconds
            try {
                java.util.concurrent.CompletableFuture.allOf(openingTask, bidsTask, evalTask)
                        .get(3, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                log.warn("Timeline parallel tasks execution timed out or interrupted: {}", e.getMessage());
            }
        }

        boolean hasCreated = databaseEvents.stream()
                .anyMatch(event -> event.getEventType() == TimelineEventType.CREATED);

        if (!hasCreated && tender != null && tender.getCreatedAt() != null) {
            TimelineDTO synthesizedCreated = TimelineDTO.builder()
                    .eventType(TimelineEventType.CREATED)
                    .description("Tender created in system")
                    .timestamp(tender.getCreatedAt())
                    .createdBy(creatorInfo.get("name"))
                    .creatorRole(creatorInfo.get("role"))
                    .build();
            dtos.add(synthesizedCreated);
        }

        // Re-sort list by timestamp descending
        dtos.sort((a, b) -> {
            if (a.getTimestamp() == null)
                return 1;
            if (b.getTimestamp() == null)
                return -1;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        // Filter out unnecessary events to only show key milestones
        java.util.List<TimelineEventType> allowedEvents = java.util.List.of(
                TimelineEventType.CREATED,
                TimelineEventType.APPROVED,
                TimelineEventType.EVALUATION_STARTED,
                TimelineEventType.AWARDED,
                TimelineEventType.CLOSED,
                TimelineEventType.AMENDED
        );

        return dtos.stream()
                .filter(dto -> allowedEvents.contains(dto.getEventType()))
                .collect(java.util.stream.Collectors.toList());
    }

    private LocalDateTime parseLocalDateTime(Object obj) {
        if (obj == null) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(obj.toString());
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    @Override
    public void addTimelineEvent(UUID tenderId, TimelineEventType eventType, String description, String createdBy, String creatorRole) {
        Tender tender = tenderRepository.findById(tenderId).orElse(null);
        if (tender != null) {
            TenderTimeline timeline = TenderTimeline.builder()
                    .tender(tender)
                    .eventType(eventType)
                    .description(description)
                    .timestamp(LocalDateTime.now())
                    .createdBy(createdBy != null ? createdBy : "System")
                    .build();
            timelineRepository.save(timeline);
        }
    }

    @Override
    public List<ContactDTO> getContacts(UUID tenderId) {
        List<lk.tenderease.tender.entity.TenderContact> contacts = contactRepository.findByTenderId(tenderId);

        if (contacts.isEmpty()) {
            Tender tender = tenderRepository.findById(tenderId).orElse(null);
            if (tender != null && tender.getCreatedBy() != null && !tender.getCreatedBy().trim().isEmpty()
                    && !tender.getCreatedBy().equalsIgnoreCase("dev-user")) {
                try {
                    org.springframework.web.client.RestTemplate localRestTemplate = new org.springframework.web.client.RestTemplate();
                    String createdBy = tender.getCreatedBy();
                    String url = "http://localhost:8081/api/officers";
                    if (createdBy.contains("@")) {
                        url += "/email/" + createdBy;
                    } else {
                        url += "/keycloak/" + createdBy;
                    }
                    java.util.Map<?, ?> response = localRestTemplate.getForObject(url, java.util.Map.class);
                    if (response != null) {
                        java.util.Map<?, ?> liaison = (java.util.Map<?, ?>) response.get("liaisonOfficer");
                        String officerName = liaison != null ? (String) liaison.get("name")
                                : (String) response.get("organizationName");
                        String designation = liaison != null ? (String) liaison.get("designation")
                                : (String) response.get("headDesignation");
                        String email = liaison != null ? (String) liaison.get("email")
                                : (String) response.get("officialEmail");
                        String phone = liaison != null ? (String) liaison.get("mobileNumber")
                                : (String) response.get("personalLandPhone");
                        String department = tender.getDepartment() != null ? tender.getDepartment().getName()
                                : (String) response.get("organizationName");

                        return java.util.List.of(ContactDTO.builder()
                                .officerName(officerName != null ? officerName : "Procurement Officer")
                                .designation(designation != null ? designation : "Officer")
                                .email(email != null ? email : "Not Provided")
                                .phone(phone != null ? phone : "Not Provided")
                                .department(department)
                                .build());
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch creator contact info from user-service for key: {}",
                            tender.getCreatedBy(), e);
                    // Fallthrough to fallback below
                }
            }
            
            // Fallback basic contact using tender details
            String department = (tender != null && tender.getDepartment() != null) ? tender.getDepartment().getName()
                    : "Procurement Office";
            return java.util.List.of(ContactDTO.builder()
                    .officerName("Procurement Officer")
                    .designation("Contact Person")
                    .email("contact@" + department.toLowerCase().replace(" ", "") + ".gov.lk")
                    .phone("Not Provided")
                    .department(department)
                    .build());
        }

        return contacts.stream()
                .map(contact -> ContactDTO.builder()
                        .officerName(contact.getOfficerName())
                        .designation(contact.getDesignation())
                        .email(contact.getEmail())
                        .phone(contact.getPhone())
                        .department("Procurement Office")
                        .build())
                .collect(Collectors.toList());

    }

    @Override
    @Transactional
    public void submitClarification(UUID tenderId, ClarificationRequestDTO request, String bidderEmail) {
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + tenderId));

        TenderClarification clarification = TenderClarification.builder()
                .tender(tender)
                .question(request.getQuestion())
                .bidderEmail(bidderEmail)
                .askedAt(LocalDateTime.now())
                .isPublic(false)
                .askedBy(1L)
                .build();

        clarificationRepository.save(clarification);

        try {
            notificationProducer.sendNotification(NotificationEvent.builder()
                    .recipientUserId("OFFICER")
                    .type("IN_APP")
                    .subject("New clarification request: " + tender.getTenderNumber())
                    .message("A vendor asked a clarification question for " + tender.getTitle())
                    .tenderId(tender.getId())
                    .tenderNumber(tender.getTenderNumber())
                    .tenderTitle(tender.getTitle())
                    .clarificationId(clarification.getId())
                    .questionPreview(clarification.getQuestion())
                    .actionUrl("/officer-dashboard/clarifications/" + tender.getId() + "/" + clarification.getId())
                    .createdAt(clarification.getAskedAt())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to publish clarification notification: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public ClarificationDTO answerClarification(UUID tenderId, Long clarificationId,
            ClarificationAnswerRequestDTO request) {
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + tenderId));
        TenderClarification clarification = clarificationRepository.findByIdAndTenderId(clarificationId, tenderId)
                .orElseThrow(() -> new RuntimeException("Clarification not found"));

        ClarificationResponse response = responseRepository.findByClarificationId(clarificationId)
                .orElseGet(() -> ClarificationResponse.builder()
                        .clarification(clarification)
                        .build());

        response.setResponse(request.getResponse());
        response.setRespondedBy(request.getRespondedBy() != null ? request.getRespondedBy() : 1L);
        response.setRespondedAt(LocalDateTime.now());
        ClarificationResponse savedResponse = responseRepository.save(response);

        clarification.setIsPublic(true);
        clarificationRepository.save(clarification);

        if (clarification.getBidderEmail() != null && !clarification.getBidderEmail().isBlank()) {
            try {
                notificationProducer.sendNotification(NotificationEvent.builder()
                        .recipient(clarification.getBidderEmail())
                        .type("EMAIL")
                        .subject("Tender clarification answered: " + tender.getTenderNumber())
                        .message(buildNotificationMessage(tender, clarification, savedResponse))
                        .build());
            } catch (Exception e) {
                log.warn("Failed to send notification to RabbitMQ for clarification {}: {}", clarification.getId(),
                        e.getMessage());
            }
        }

        return ClarificationDTO.builder()
                .id(clarification.getId())
                .tenderId(tender.getId().toString())
                .tenderTitle(tender.getTitle())
                .tenderNumber(tender.getTenderNumber())
                .question(clarification.getQuestion())
                .answer(savedResponse.getResponse())
                .askedAt(clarification.getAskedAt())
                .answeredAt(savedResponse.getRespondedAt())
                .bidderEmail(clarification.getBidderEmail())
                .category(tender.getProcurementType() != null ? tender.getProcurementType().name() : null)
                .department(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .closingDate(tender.getClosingDate())
                .build();
    }

    private TenderSummaryDTO mapToSummaryDTO(Tender tender) {
        // Compute effective status: if deadline has passed, override to CLOSED
        TenderStatus effectiveStatus = tender.getStatus();
        if (tender.getClosingDate() != null && LocalDateTime.now().isAfter(tender.getClosingDate())) {
            effectiveStatus = TenderStatus.CLOSED;
        }

        return TenderSummaryDTO.builder()
                .id(tender.getId())
                .tenderNumber(tender.getTenderNumber())
                .title(tender.getTitle())
                .departmentName(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .estimatedBudget(tender.getEstimatedBudget())
                .closingDate(tender.getClosingDate())
                .status(effectiveStatus)
                .procurementType(tender.getProcurementType())
                .createdAt(tender.getCreatedAt())
                .timeRemaining(calculateTimeRemaining(tender.getClosingDate()))
                .build();
    }

    private TenderDetailsDTO mapToDetailsDTO(Tender tender) {
        return TenderDetailsDTO.builder()
                .id(tender.getId())
                .tenderNumber(tender.getTenderNumber())
                .title(tender.getTitle())
                .description(tender.getDescription())
                .specialRequirements(tender.getSpecialRequirements())
                .projectOverview(tender.getProjectOverview())
                .scopeOfWork(tender.getScopeOfWork())
                .estimatedBudget(tender.getEstimatedBudget())
                .status(tender.getStatus())
                .procurementType(tender.getProcurementType() != null ? tender.getProcurementType().name() : null)
                .biddingMethod(tender.getBiddingMethod())
                .tenderType(tender.getTenderType())
                .ministryId(tender.getMinistry() != null ? tender.getMinistry().getId() : null)
                .ministryName(tender.getMinistry() != null ? tender.getMinistry().getName() : null)
                .departmentId(tender.getDepartment() != null ? tender.getDepartment().getId() : null)
                .departmentName(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .openingDate(tender.getOpeningDate())
                .closingDate(tender.getClosingDate())
                .createdAt(tender.getCreatedAt())
                .updatedAt(tender.getUpdatedAt())
                .timeRemaining(calculateTimeRemaining(tender.getClosingDate()))
                .documents(getDocuments(tender.getId()))
                .addenda(getAddenda(tender.getId()))
                .clarifications(getClarifications(tender.getId()))
                .timeline(getTimeline(tender.getId()))
                .contacts(getContacts(tender.getId()))
                .build();
    }

    private TenderDocumentDTO mapDocument(TenderDocument document) {
        return TenderDocumentDTO.builder()
                .id(document.getId())
                .documentName(document.getDocumentName())
                .documentType(document.getDocumentType())
                .mimeType(document.getMimeType())
                .fileSizeBytes(document.getFileSizeBytes())
                .version(document.getVersion())
                .uploadedAt(document.getUploadedAt())
                .downloadUrl("http://localhost:8082/api/tenders/files/" + document.getS3Key())
                .build();
    }

    private TenderAmendmentDTO mapAmendment(TenderAmendment amendment) {
        TenderAmendmentDTO.TenderAmendmentDTOBuilder builder = TenderAmendmentDTO.builder()
                .id(amendment.getId())
                .amendmentNumber(amendment.getAmendmentNumber())
                .title(amendment.getTitle())
                .description(amendment.getDescription())
                .changeNote(amendment.getChangeNote())
                .newClosingDate(amendment.getNewClosingDate())
                .createdAt(amendment.getCreatedAt())
                .version(amendment.getVersion());

        // If linked to a document, resolve its download URL
        if (amendment.getDocumentId() != null) {
            documentRepository.findById(amendment.getDocumentId()).ifPresent(doc -> {
                builder.documentName(doc.getDocumentName());
                builder.version(doc.getVersion());
                builder.downloadUrl("http://localhost:8082/api/tenders/files/" + doc.getS3Key());
            });
        }

        return builder.build();
    }

    private long calculateTimeRemaining(LocalDateTime closingDate) {
        if (closingDate == null) {
            return 0;
        }
        return Duration.between(LocalDateTime.now(), closingDate).toSeconds();
    }

    private String buildNotificationMessage(Tender tender, TenderClarification clarification,
            ClarificationResponse response) {
        return """
                Hello,

                Your clarification question for the following tender has been answered.

                Tender: %s
                Tender number: %s

                Your question:
                %s

                Official response:
                %s

                Regards,
                TenderEase.lk
                """.formatted(
                tender.getTitle(),
                tender.getTenderNumber(),
                clarification.getQuestion(),
                response.getResponse());
    }

    // ── Reference Data ──────────────────────────────────────────────────────

    @Override
    public List<MinistryResponse> listMinistries() {
        log.debug("Fetching all ministries");
        return ministryRepository.findAll().stream()
                .map(m -> MinistryResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .code(m.getCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<DepartmentResponse> listDepartmentsByMinistry(Long ministryId) {
        log.debug("Fetching departments for ministry ID: {}", ministryId);
        return departmentRepository.findByMinistryId(ministryId).stream()
                .map(d -> DepartmentResponse.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .ministryId(d.getMinistry().getId())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<FundingSourceResponse> listFundingSources() {
        log.debug("Fetching all funding sources");
        return fundingSourceRepository.findAll().stream()
                .map(f -> FundingSourceResponse.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .sourceType(f.getSourceType())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SbdTemplateResponse> listSbdTemplates(ProcurementType procurementType) {
        log.debug("Fetching SBD templates for procurement type: {}", procurementType);
        if (procurementType != null) {
            return sbdTemplateRepository.findByProcurementTypeAndIsActiveTrue(procurementType).stream()
                    .map(t -> SbdTemplateResponse.builder()
                            .id(t.getId())
                            .name(t.getName())
                            .procurementType(t.getProcurementType())
                            .version(t.getVersion())
                            .build())
                    .collect(Collectors.toList());
        }
        return sbdTemplateRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsActive()))
                .map(t -> SbdTemplateResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .procurementType(t.getProcurementType())
                        .version(t.getVersion())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listProcurementTypes() {
        return Arrays.stream(ProcurementType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listBiddingMethods() {
        return Arrays.stream(BiddingMethod.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listTenderTypes() {
        return Arrays.stream(TenderType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public java.util.Map<String, Long> getKPIs(String department, String category, String month) {
        log.debug("Fetching KPIs - department: {}, category: {}, month: {}", department, category, month);
        java.util.Map<String, Long> kpis = new java.util.LinkedHashMap<>();
        kpis.put("totalTenders", tenderRepository.count());
        kpis.put("activeTenders",
                (long) tenderRepository.findByStatus(TenderStatus.PUBLISHED, Pageable.unpaged()).getContent().size());
        kpis.put("closedTenders",
                (long) tenderRepository.findByStatus(TenderStatus.CLOSED, Pageable.unpaged()).getContent().size());
        kpis.put("draftTenders",
                (long) tenderRepository.findByStatus(TenderStatus.DRAFT, Pageable.unpaged()).getContent().size());
        return kpis;
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getKPITrend(String department, String category) {
        log.debug("Fetching KPI trend - department: {}, category: {}", department, category);
        java.util.List<java.util.Map<String, Object>> trend = new java.util.ArrayList<>();

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0)
                    .withSecond(0);
            java.time.LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

            // Count PUBLISHED tenders created in this month with filters
            long count = tenderRepository.count((root, query, cb) -> {
                java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
                predicates.add(cb.between(root.get("createdAt"), monthStart, monthEnd));
                predicates.add(cb.equal(root.get("status"), TenderStatus.PUBLISHED));

                if (department != null && !department.isEmpty() && !"All Departments".equalsIgnoreCase(department)) {
                    predicates.add(cb.equal(root.get("department").get("name"), department));
                }

                if (category != null && !category.isEmpty() && !"All Categories".equalsIgnoreCase(category)) {
                    try {
                        // Try to match with ProcurementType enum
                        String typeStr = category.toUpperCase().replace(" ", "_");
                        lk.tenderease.tender.enums.ProcurementType type = lk.tenderease.tender.enums.ProcurementType
                                .valueOf(typeStr);
                        predicates.add(cb.equal(root.get("procurementType"), type));
                    } catch (IllegalArgumentException e) {
                        // Fallback to title/description search
                        predicates.add(cb.or(
                                cb.like(cb.lower(root.get("title")), "%" + category.toLowerCase() + "%"),
                                cb.like(cb.lower(root.get("description")), "%" + category.toLowerCase() + "%")));
                    }
                }

                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            });

            java.util.Map<String, Object> dataPoint = new java.util.HashMap<>();
            dataPoint.put("label", monthStart.getMonth().name().substring(0, 3));
            dataPoint.put("value", count);
            trend.add(dataPoint);
        }

        return trend;
    }

    @Override
    @Transactional
    public TenderResponse updateTenderStatus(UUID id, TenderStatus status, String reason, String callerUserId) {
        log.info("Updating tender {} status to {} by user {}", id, status, callerUserId);
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));

        tender.setStatus(status);
        if (status == TenderStatus.OPEN && tender.getOpeningDate() == null) {
            tender.setOpeningDate(LocalDateTime.now());
        }
        if (reason != null && !reason.isBlank()) {
            tender.setRejectionReason(reason);
        }
        tender.setUpdatedAt(LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

        // Auto-record timeline event matching the new status
        TimelineEventType eventType = statusToTimelineEvent(status);
        if (eventType != null) {
            String desc = buildStatusDescription(status, reason, callerUserId);
            recordTimelineEvent(saved, eventType, desc);
        }

        log.info("Tender {} status updated to {}", id, status);
        return mapToResponse(saved);
    }

    // ── Timeline helpers ─────────────────────────────────────────────────────

    private void recordTimelineEvent(Tender tender, TimelineEventType eventType, String description) {
        try {
            if (timelineRepository.existsByTenderIdAndEventTypeAndDescription(tender.getId(), eventType, description)) {
                log.debug("Timeline event '{}' already exists for tender {}, skipping duplicate", eventType,
                        tender.getId());
                return;
            }
            TenderTimeline event = TenderTimeline.builder()
                    .tender(tender)
                    .eventType(eventType)
                    .description(description)
                    .timestamp(LocalDateTime.now())
                    .build();
            timelineRepository.save(event);
            log.debug("Timeline event '{}' recorded for tender {}", eventType, tender.getId());
        } catch (Exception e) {
            log.warn("Failed to record timeline event '{}' for tender {}: {}", eventType, tender.getId(),
                    e.getMessage());
        }
    }

    private TimelineEventType statusToTimelineEvent(TenderStatus status) {
        return switch (status) {
            case APPROVED -> TimelineEventType.APPROVED;
            case REJECTED -> TimelineEventType.REJECTED;
            case PUBLISHED -> TimelineEventType.PUBLISHED;
            case OPEN -> TimelineEventType.OPENED;
            case EVALUATION -> TimelineEventType.EVALUATION_STARTED;
            case AWARDED -> TimelineEventType.AWARDED;
            case NO_BID -> TimelineEventType.NO_BID;
            case CLOSED -> TimelineEventType.CLOSED;
            case CANCELLED -> TimelineEventType.CANCELLED;
            default -> null; // DRAFT, PENDING_APPROVAL handled separately
        };
    }

    private String buildStatusDescription(TenderStatus status, String reason, String callerUserId) {
        String actor = callerUserId != null ? callerUserId : "system";
        return switch (status) {
            case APPROVED -> "Tender approved by " + actor + ".";
            case REJECTED -> "Tender rejected by " + actor + (reason != null ? ": " + reason : ".");
            case PUBLISHED -> "Tender published and visible to vendors.";
            case OPEN -> "Bid opening session started.";
            case EVALUATION -> "Bid evaluation phase has commenced.";
            case AWARDED -> "Contract has been awarded.";
            case NO_BID -> "No bids were received; tender closed without award.";
            case CLOSED -> "Tender officially closed.";
            case CANCELLED -> "Tender was cancelled" + (reason != null ? ": " + reason : ".");
            default -> status.name();
        };
    }

    // ── Addenda / Document Versioning ─────────────────────────────────────────

    @Override
    @Transactional
    public TenderAmendmentDTO replaceDocument(UUID tenderId, UUID docId,
            org.springframework.web.multipart.MultipartFile newFile,
            String changeNote, String callerUserId) {
        log.info("Replacing document {} for tender {} by {}", docId, tenderId, callerUserId);

        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + tenderId));

        TenderDocument oldDoc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + docId));

        if (!oldDoc.getTender().getId().equals(tenderId)) {
            throw new RuntimeException("Document does not belong to this tender");
        }

        if (newFile == null || newFile.isEmpty()) {
            throw new RuntimeException("Replacement file is empty or missing.");
        }

        // Determine next version number
        int nextVersion = (oldDoc.getVersion() != null ? oldDoc.getVersion() : 1) + 1;

        // Save new file to local storage with a distinct name
        String originalName = newFile.getOriginalFilename() != null ? newFile.getOriginalFilename()
                : oldDoc.getDocumentName();
        String newFileName = java.util.UUID.randomUUID().toString() + "_v" + nextVersion + "_" + originalName;
        Path targetPath = Paths.get(uploadDir).resolve(newFileName).toAbsolutePath();

        try {
            Files.createDirectories(targetPath.getParent());
            Files.copy(newFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store replacement file", e);
        }

        // Create new TenderDocument record for the new version
        TenderDocument newDoc = TenderDocument.builder()
                .tender(tender)
                .documentName(originalName)
                .documentType(oldDoc.getDocumentType())
                .s3Key(newFileName)
                .version(nextVersion)
                .fileSizeBytes(newFile.getSize())
                .mimeType(newFile.getContentType() != null ? newFile.getContentType() : oldDoc.getMimeType())
                .uploadedAt(LocalDateTime.now())
                .build();
        TenderDocument savedNewDoc = documentRepository.save(newDoc);

        // Count existing amendments to generate amendment number
        int amendmentNumber = (int) amendmentRepository.findByTenderIdOrderByCreatedAtDesc(tenderId).size() + 1;

        // Create amendment record
        TenderAmendment amendment = TenderAmendment.builder()
                .tender(tender)
                .amendmentNumber(amendmentNumber)
                .title("Amendment " + amendmentNumber + " – Document Updated")
                .description("Document '" + originalName + "' was updated to version " + nextVersion + ".")
                .changeNote(changeNote != null ? changeNote : "Document replacement")
                .version(nextVersion)
                .documentId(savedNewDoc.getId())
                .createdAt(LocalDateTime.now())
                .build();
        TenderAmendment savedAmendment = amendmentRepository.save(amendment);

        // Record AMENDED timeline event
        recordTimelineEvent(tender, TimelineEventType.AMENDED,
                "Addendum " + amendmentNumber + ": '" + originalName + "' updated to version " + nextVersion
                        + (changeNote != null ? " – " + changeNote : "."));

        log.info("Document replacement complete. New doc ID: {}, Amendment ID: {}", savedNewDoc.getId(),
                savedAmendment.getId());
        return mapAmendment(savedAmendment);
    }
}
