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
import lk.tenderease.tender.repository.TenderAmendmentRepository;
import lk.tenderease.tender.repository.TenderClarificationRepository;
import lk.tenderease.tender.repository.TenderContactRepository;
import lk.tenderease.tender.repository.TenderDocumentRepository;
import lk.tenderease.tender.repository.TenderRepository;
import lk.tenderease.tender.repository.TenderTimelineRepository;
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
    private final NotificationProducer notificationProducer;
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
                .status(TenderStatus.DRAFT)
                .build();

        // Set audit fields manually (since AuditorAware is not configured for dev)
        tender.setCreatedBy(createdByUserId != null ? createdByUserId : "dev-user");
        tender.setCreatedAt(LocalDateTime.now());
        tender.setUpdatedAt(LocalDateTime.now());

        Tender saved = tenderRepository.save(tender);
        log.info("Tender created with ID: {}", saved.getId());

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
                .createdBy(tender.getCreatedBy());

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
        // Map from base TenderResponse (reusing the logic from mapToResponse if needed, but let's be explicit)
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
        response.setEstimatedBudget(base.getEstimatedBudget());
        response.setFundingSourceId(base.getFundingSourceId());
        response.setFundingSourceName(base.getFundingSourceName());
        response.setStatus(base.getStatus());
        response.setCreatedAt(base.getCreatedAt());
        response.setUpdatedAt(base.getUpdatedAt());
        response.setCreatedBy(base.getCreatedBy());

        // Map specific details (documents, schedule, checklist)
        // These might need real implementation if they are separate tables
        // For now, returning empty/default if not fully implemented
        return response;
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
        return null; // TODO: implement
    }

    @Override
    public TenderDocumentResponse uploadDocument(UUID tenderId, DocumentUploadRequest request, String callerUserId) {
        return null; // TODO: implement
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

        // 1. Update status to PENDING_APPROVAL
        tender.setStatus(TenderStatus.PENDING_APPROVAL);
        tender.setUpdatedAt(LocalDateTime.now());
        Tender saved = tenderRepository.save(tender);

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

        clarificationRepository.save(clarification);
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
                    .type("EMAIL")
                    .subject("Tender clarification answered: " + tender.getTenderNumber())
                    .message(buildNotificationMessage(tender, clarification, savedResponse))
                    .build());
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
        return TenderSummaryDTO.builder()
                .id(tender.getId())
                .title(tender.getTitle())
                .departmentName(tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .estimatedBudget(tender.getEstimatedBudget())
                .closingDate(tender.getClosingDate())
                .status(tender.getStatus())
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
                .downloadUrl("http://localhost:8082/api/tenders/files/" + document.getS3Key())
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
}
