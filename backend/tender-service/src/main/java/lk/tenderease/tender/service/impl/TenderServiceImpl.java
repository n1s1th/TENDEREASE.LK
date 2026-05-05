package lk.tenderease.tender.service.impl;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.common.constant.AMQPConstants;
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
import lk.tenderease.tender.entity.TenderComplianceChecklist;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.DocumentType;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lk.tenderease.tender.producer.NotificationProducer;
import lk.tenderease.tender.producer.TenderEventProducer;
import lk.tenderease.tender.repository.ClarificationResponseRepository;
import lk.tenderease.tender.repository.DepartmentRepository;
import lk.tenderease.tender.repository.FundingSourceRepository;
import lk.tenderease.tender.repository.MinistryRepository;
import lk.tenderease.tender.repository.SbdTemplateRepository;
import lk.tenderease.tender.dto.event.TenderSubmittedEvent;
import lk.tenderease.tender.repository.TenderAmendmentRepository;
import lk.tenderease.tender.repository.TenderClarificationRepository;
import lk.tenderease.tender.repository.TenderContactRepository;
import lk.tenderease.tender.repository.TenderDocumentRepository;
import lk.tenderease.tender.repository.TenderRepository;
import lk.tenderease.tender.repository.TenderScheduleRepository;
import lk.tenderease.tender.repository.TenderTimelineRepository;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lk.tenderease.common.exception.BusinessException;

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
    private final TenderClarificationRepository clarificationRepository;
    private final ClarificationResponseRepository responseRepository;
    private final TenderTimelineRepository timelineRepository;
    private final TenderContactRepository contactRepository;
    private final TenderScheduleRepository scheduleRepository;
    private final NotificationProducer notificationProducer;
    private final TenderEventProducer tenderEventProducer;
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
                    .orElseThrow(() -> new RuntimeException("Funding source not found with ID: " + request.getFundingSourceId()));
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
        tender.setUpdatedAt(LocalDateTime.now());

        Tender saved = tenderRepository.save(tender);
        log.info("Tender created with ID: {}", saved.getId());

        // Emit KPI Event
        tenderEventProducer.sendTenderStatusEvent(lk.tenderease.common.event.TenderEvent.builder()
                .tenderId(saved.getId().toString())
                .eventType("CREATED")
                .status(saved.getStatus().name())
                .triggerBy(createdByUserId)
                .build());

        return mapToResponse(saved);
    }

    private TenderResponse mapToResponse(Tender tender) {
        if (tender == null) return null;
        
        log.debug("Mapping tender {} to response", tender.getId());
        
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
                .closingDate(tender.getSchedule() != null && tender.getSchedule().getBidSubmissionDeadline() != null 
                    ? tender.getSchedule().getBidSubmissionDeadline().atStartOfDay() 
                    : tender.getClosingDate())
                .dynamicData(tender.getDynamicData())
                .rejectionReason(tender.getRejectionReason());

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
                    .orElseThrow(() -> new RuntimeException("Funding source not found with ID: " + request.getFundingSourceId()));
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
        // TODO: implement
    }

    @Override
    public PageResponse<TenderResponse> listMyTenders(TenderStatus status, Pageable pageable, String callerUserId) {
        return null; // TODO: implement
    }

    @Override
    public PageResponse<TenderResponse> listAllTenders(TenderStatus status, Pageable pageable) {
        log.debug("Listing all tenders with status filter: {}", status);
        Page<Tender> page;
        
        if (status == TenderStatus.APPROVED) {
            // Dashboard "Approved" tab should show both APPROVED and PUBLISHED tenders
            page = tenderRepository.searchWithStatus("", status, pageable); // Need a custom query for multiple statuses ideally
            // But for now, let's just fetch all and filter or use the repository search with status logic
            // Actually, I'll update the repository to support list of statuses or just handle it here
            page = tenderRepository.findByStatusIn(Arrays.asList(TenderStatus.APPROVED, TenderStatus.PUBLISHED), pageable);
        } else if (status != null) {
            page = tenderRepository.findByStatus(status, pageable);
        } else {
            page = tenderRepository.findAll(pageable);
        }
        
        return PageResponse.<TenderResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
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

        // Save metadata to TenderDocument
        lk.tenderease.tender.entity.TenderDocument doc = lk.tenderease.tender.entity.TenderDocument.builder()
                .tender(tender)
                .documentName(docName)
                .documentType(request.getDocumentType() != null ? request.getDocumentType() : DocumentType.OTHER)
                .s3Key("dummy-s3-key/" + java.util.UUID.randomUUID().toString())
                .fileSizeBytes(request.getFile().getSize())
                .mimeType(request.getFile().getContentType() != null ? request.getFile().getContentType() : "application/octet-stream")
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
    public void deleteDocument(UUID tenderId, UUID docId, String callerUserId) {
        // TODO: implement
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
    public ComplianceChecklistResponse saveComplianceChecklist(UUID tenderId, ComplianceChecklistRequest request, String callerUserId) {
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
            throw new RuntimeException("Only DRAFT tenders can be submitted for approval. Current status: " + tender.getStatus());
        }

        // 1. Move to PENDING_APPROVAL (CAO will approve later)
        tender.setStatus(TenderStatus.PENDING_APPROVAL);

        tender.setUpdatedAt(LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

        // 2. Publish event to RabbitMQ for Reporting Service (KPI)
        tenderEventProducer.sendTenderStatusEvent(lk.tenderease.common.event.TenderEvent.builder()
                .tenderId(saved.getId().toString())
                .eventType("STATUS_CHANGED")
                .status(saved.getStatus().name())
                .triggerBy(callerUserId)
                .build());

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
    public Page<TenderSummaryDTO> getAllPublishedTenders(String search, TenderStatus status, Pageable pageable) {
        String keyword = search == null ? "" : search;

        if (status != null) {
            return tenderRepository.searchWithStatus(keyword, status, pageable)
                    .map(this::mapToSummaryDTO);
        }

        return tenderRepository.searchWithoutStatus(keyword, pageable)
                .map(this::mapToSummaryDTO);
    }

    @Override
    public TenderDetailsDTO getPublicTenderById(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));
        return mapToDetailsDTO(tender);
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDetailResponse getTenderById(UUID id) {
        log.info("Fetching tender detail for ID: {}", id);
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with ID: " + id));

        TenderDetailResponse response = new TenderDetailResponse();
        TenderResponse base = mapToResponse(tender);
        
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
        response.setEstimatedBudget(base.getEstimatedBudget());
        response.setFundingSourceId(base.getFundingSourceId());
        response.setFundingSourceName(base.getFundingSourceName());
        response.setStatus(base.getStatus());
        response.setCreatedAt(base.getCreatedAt());
        response.setUpdatedAt(base.getUpdatedAt());
        response.setCreatedBy(base.getCreatedBy());
        response.setRejectionReason(base.getRejectionReason());

        // Map the detailed sub-entities
        response.setSchedule(getSchedule(id));
        response.setComplianceChecklist(getComplianceChecklist(id));
        
        if (tender.getDocuments() != null) {
            response.setDocuments(tender.getDocuments().stream()
                .map(doc -> TenderDocumentResponse.builder()
                    .id(doc.getId())
                    .tenderId(id)
                    .documentName(doc.getDocumentName())
                    .documentType(doc.getDocumentType())
                    .sbdTemplateId(doc.getSbdTemplate() != null ? doc.getSbdTemplate().getId() : null)
                    .templateVersion(doc.getTemplateVersion())
                    .fileSizeBytes(doc.getFileSizeBytes())
                    .mimeType(doc.getMimeType())
                    .uploadedAt(doc.getUploadedAt())
                    .build())
                .collect(Collectors.toList()));
        }
        
        try {
            response.setNoticePreview(generateNoticePreview(id).getGeneratedText());
        } catch (Exception e) {
            log.warn("Could not generate notice preview for tender {}: {}", id, e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getKPIs(String department, String category, String month) {
        log.info("Fetching KPIs with department: {}, category: {}, month: {}", department, category, month);
        
        Specification<Tender> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Active statuses
            predicates.add(root.get("status").in(TenderStatus.APPROVED, TenderStatus.PUBLISHED));
            
            if (department != null && !department.isEmpty()) {
                predicates.add(cb.equal(cb.trim(cb.lower(root.get("department").get("name"))), department.toLowerCase().trim()));
            }
            
            if (category != null && !category.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("procurementType"), ProcurementType.valueOf(category.toUpperCase())));
                } catch (Exception e) { /* ignore */ }
            }
            
            if (month != null && month.startsWith("month_")) {
                try {
                    int monthInt = Integer.parseInt(month.substring(6));
                    LocalDateTime startOfMonth = LocalDateTime.now().withMonth(monthInt).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                    LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
                    predicates.add(cb.between(root.get("createdAt"), startOfMonth, endOfMonth));
                } catch (Exception e) { /* ignore */ }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        long active = tenderRepository.count(spec);
        long smeActive = tenderRepository.count(spec.and((root, query, cb) -> cb.isTrue(root.get("smeIndicator"))));
        long awarded = 0; // Since AWARDED doesn't exist yet, we just return 0
        
        double smeParticipation = active > 0 ? (smeActive * 100.0 / active) : 0;
        
        return java.util.Map.of(
            "activeTenders", active, 
            "awardedTenders", awarded,
            "smeParticipation", (long)smeParticipation
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getKPITrend(String department, String category) {
        log.info("Calculating KPI trend for department: {}, category: {}", department, category);
        List<java.util.Map<String, Object>> trend = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            final LocalDateTime start = monthStart;
            final LocalDateTime end = monthEnd;
            
            Specification<Tender> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(root.get("status").in(TenderStatus.APPROVED, TenderStatus.PUBLISHED));
                predicates.add(cb.between(root.get("createdAt"), start, end));
                
                if (department != null && !department.isEmpty()) {
                    predicates.add(cb.equal(cb.trim(cb.lower(root.get("department").get("name"))), department.toLowerCase().trim()));
                }
                if (category != null && !category.isEmpty()) {
                    try {
                        predicates.add(cb.equal(root.get("procurementType"), ProcurementType.valueOf(category.toUpperCase())));
                    } catch (Exception e) { }
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };
            
            long count = tenderRepository.count(spec);
            String label = monthStart.getMonth().name().substring(0, 3);
            trend.add(java.util.Map.of("label", label, "value", count));
        }
        
        return trend;
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
    public List<ClarificationDTO> getClarifications(UUID tenderId) {
        return clarificationRepository.findByTenderIdOrderByAskedAtDesc(tenderId).stream()
                .map(this::mapToClarificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClarificationDTO> getClarificationsForOfficer(String officerId) {
        return clarificationRepository.findAll().stream()
                .sorted((c1, c2) -> c2.getAskedAt().compareTo(c1.getAskedAt()))
                .map(this::mapToClarificationDTO)
                .collect(Collectors.toList());
    }

    private ClarificationDTO mapToClarificationDTO(TenderClarification clarification) {
        var response = responseRepository.findByClarificationId(clarification.getId());
        Tender tender = clarification.getTender();
        return ClarificationDTO.builder()
                .id(clarification.getId())
                .question(clarification.getQuestion())
                .answer(response.map(ClarificationResponse::getResponse).orElse(null))
                .askedAt(clarification.getAskedAt())
                .answeredAt(response.map(ClarificationResponse::getRespondedAt).orElse(null))
                .tenderId(tender.getId().toString())
                .tenderTitle(tender.getTitle())
                .tenderNumber(tender.getTenderNumber())
                .department(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .category(null)
                .closingDate(tender.getClosingDate())
                .bidderEmail(clarification.getBidderEmail())
                .build();
    }

    @Override
    public List<TimelineDTO> getTimeline(UUID tenderId) {
        return timelineRepository.findByTenderIdOrderByTimestampDesc(tenderId).stream()
                .map(event -> TimelineDTO.builder()
                        .eventType(event.getEventType())
                        .description(event.getDescription())
                        .timestamp(event.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ContactDTO> getContacts(UUID tenderId) {
        return contactRepository.findByTenderId(tenderId).stream()
                .map(contact -> ContactDTO.builder()
                        .officerName(contact.getOfficerName())
                        .designation(contact.getDesignation())
                        .email(contact.getEmail())
                        .phone(contact.getPhone())
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

        TenderClarification savedClarification = clarificationRepository.save(clarification);

        try {
            notificationProducer.sendNotification(NotificationEvent.builder()
                    .recipient(resolveOfficerEmail(tender.getCreatedBy()))
                    .recipientUserId(tender.getCreatedBy())
                    .type("CLARIFICATION_CREATED")
                    .subject("New clarification question received")
                    .message(buildClarificationCreatedMessage(tender, savedClarification))
                    .tenderId(tender.getId())
                    .tenderNumber(tender.getTenderNumber())
                    .tenderTitle(tender.getTitle())
                    .clarificationId(savedClarification.getId())
                    .questionPreview(preview(savedClarification.getQuestion()))
                    .actionUrl("/tenders/" + tender.getId() + "/clarifications")
                    .createdAt(savedClarification.getAskedAt())
                    .build(), AMQPConstants.CLARIFICATION_CREATED_ROUTING_KEY);
        } catch (Exception e) {
            log.error("Failed to publish notification event: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public ClarificationDTO answerClarification(UUID tenderId, Long clarificationId, ClarificationAnswerRequestDTO request) {
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
            notificationProducer.sendNotification(NotificationEvent.builder()
                    .recipient(clarification.getBidderEmail())
                    .type("CLARIFICATION_ANSWERED")
                    .subject("Tender clarification answered: " + tender.getTenderNumber())
                    .message(buildNotificationMessage(tender, clarification, savedResponse))
                    .tenderId(tender.getId())
                    .tenderNumber(tender.getTenderNumber())
                    .tenderTitle(tender.getTitle())
                    .clarificationId(clarification.getId())
                    .questionPreview(preview(clarification.getQuestion()))
                    .actionUrl("/tenders/" + tender.getId() + "/clarifications")
                    .createdAt(savedResponse.getRespondedAt())
                    .build(), AMQPConstants.CLARIFICATION_ANSWERED_ROUTING_KEY);
        }

        return ClarificationDTO.builder()
                .id(clarification.getId())
                .question(clarification.getQuestion())
                .answer(savedResponse.getResponse())
                .askedAt(clarification.getAskedAt())
                .answeredAt(savedResponse.getRespondedAt())
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
                .departmentName(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .openingDate(tender.getOpeningDate())
                .closingDate(tender.getClosingDate())
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
                .version(document.getVersion())
                .downloadUrl("http://localhost:8182/api/tenders/files/" + document.getS3Key())
                .build();
    }

    private TenderAmendmentDTO mapAmendment(TenderAmendment amendment) {
        return TenderAmendmentDTO.builder()
                .id(amendment.getId())
                .amendmentNumber(amendment.getAmendmentNumber())
                .title(amendment.getTitle())
                .description(amendment.getDescription())
                .newClosingDate(amendment.getNewClosingDate())
                .createdAt(amendment.getCreatedAt())
                .downloadUrl("http://localhost:8182/api/tenders/files/addendum.pdf")
                .build();
    }

    private long calculateTimeRemaining(LocalDateTime closingDate) {
        if (closingDate == null) {
            return 0;
        }
        return Duration.between(LocalDateTime.now(), closingDate).toSeconds();
    }

    private String buildNotificationMessage(Tender tender, TenderClarification clarification, ClarificationResponse response) {
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
                response.getResponse()
        );
    }

    private String buildClarificationCreatedMessage(Tender tender, TenderClarification clarification) {
        return """
                New clarification question received.

                Tender: %s
                Tender ID: %s
                Tender number: %s

                Question:
                %s
                """.formatted(
                tender.getTitle(),
                tender.getId(),
                tender.getTenderNumber(),
                clarification.getQuestion()
        );
    }

    private String preview(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.strip();
        return normalized.length() <= 120 ? normalized : normalized.substring(0, 117) + "...";
    }

    private String resolveOfficerEmail(String createdBy) {
        return createdBy != null && createdBy.contains("@") ? createdBy : null;
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
    @Transactional
    public TenderResponse updateTenderStatus(UUID id, TenderStatus status, String rejectionReason, String callerUserId) {
        log.info("Updating status for tender {} to {} by {}", id, status, callerUserId);
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tender not found"));

        tender.setStatus(status);
        if (status == TenderStatus.REJECTED) {
            tender.setRejectionReason(rejectionReason);
        }
        
        // If approved, set opening date and closing date if not already set
        if (status == TenderStatus.APPROVED || status == TenderStatus.PUBLISHED) {
            tender.setStatus(TenderStatus.PUBLISHED); // Auto-publish on CAO approval for now
            if (tender.getOpeningDate() == null) {
                tender.setOpeningDate(LocalDateTime.now());
            }
            if (tender.getClosingDate() == null) {
                tender.setClosingDate(LocalDateTime.now().plusDays(14));
            }
        }

        tender.setUpdatedAt(LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

        // Emit Event for KPI
        tenderEventProducer.sendTenderStatusEvent(lk.tenderease.common.event.TenderEvent.builder()
                .tenderId(saved.getId().toString())
                .eventType("STATUS_CHANGED")
                .status(saved.getStatus().name())
                .triggerBy(callerUserId)
                .build());

        return mapToResponse(saved);
    }
}
