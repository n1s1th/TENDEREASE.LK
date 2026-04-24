package lk.tenderease.tender.service.impl;

import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.entity.*;
import lk.tenderease.tender.producer.NotificationProducer;
import lk.tenderease.common.event.NotificationEvent;
import lk.tenderease.tender.repository.*;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TenderServiceImpl implements TenderService {

    private final TenderRepository tenderRepository;
    private final TenderDocumentRepository documentRepository;
    private final TenderAmendmentRepository amendmentRepository;
    private final TenderClarificationRepository clarificationRepository;
    private final ClarificationResponseRepository responseRepository;
    private final TenderTimelineRepository timelineRepository;
    private final TenderContactRepository contactRepository;
    private final NotificationProducer notificationProducer;

    // 🔥 GET ALL PUBLISHED TENDERS (LIST PAGE)
    @Override
    public Page<TenderSummaryDTO> getAllPublishedTenders(String search, lk.tenderease.tender.enums.TenderStatus status,
            Pageable pageable) {

        // ✅ Fix null keyword
        if (search == null) {
            search = "";
        }

        // ✅ Fix null status issue (THIS IS THE REAL FIX)
        if (status != null) {
            return tenderRepository.searchWithStatus(search, status, pageable)
                    .map(this::mapToSummaryDTO);
        } else {
            return tenderRepository.searchWithoutStatus(search, pageable)
                    .map(this::mapToSummaryDTO);
        }
    }

    // 🔥 GET FULL TENDER DETAILS (MAIN PAGE)
    @Override
    public TenderDetailsDTO getTenderById(UUID id) {

        Tender tender = getTenderOrThrow(id);

        return mapToDetailsDTO(tender);
    }

    // 🔥 DOCUMENTS TAB
    @Override
    public List<TenderDocumentDTO> getDocuments(UUID tenderId) {
        return documentRepository.findByTenderId(tenderId)
                .stream()
                .map(this::mapDocument)
                .collect(Collectors.toList());
    }

    // 🔥 ADDENDA TAB
    @Override
    public List<TenderAmendmentDTO> getAddenda(UUID tenderId) {
        return amendmentRepository.findByTenderIdOrderByCreatedAtDesc(tenderId)
                .stream()
                .map(this::mapAmendment)
                .collect(Collectors.toList());
    }

    // 🔥 CLARIFICATIONS TAB
    @Override
    public List<ClarificationDTO> getClarifications(UUID tenderId) {

        return clarificationRepository.findByTenderIdOrderByAskedAtDesc(tenderId)
                .stream()
                .map((TenderClarification c) -> {
                    var response = responseRepository.findByClarificationId(c.getId());

                    return ClarificationDTO.builder()
                            .id(c.getId())
                            .question(c.getQuestion())
                            .answer(response.map(ClarificationResponse::getResponse).orElse(null))
                            .askedAt(c.getAskedAt())
                            .answeredAt(response.map(ClarificationResponse::getRespondedAt).orElse(null))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 🔥 TIMELINE TAB
    @Override
    public List<TimelineDTO> getTimeline(UUID tenderId) {
        return timelineRepository.findByTenderIdOrderByTimestampDesc(tenderId)
                .stream()
                .map(t -> TimelineDTO.builder()
                        .eventType(t.getEventType())
                        .description(t.getDescription())
                        .timestamp(t.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    // 🔥 CONTACT TAB
    @Override
    public List<ContactDTO> getContacts(UUID tenderId) {
        return contactRepository.findByTenderId(tenderId)
                .stream()
                .map(c -> ContactDTO.builder()
                        .officerName(c.getOfficerName())
                        .designation(c.getDesignation())
                        .email(c.getEmail())
                        .phone(c.getPhone())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void submitClarification(UUID tenderId, ClarificationRequestDTO request, String bidderEmail) {
        log.info("Submitting clarification for tender {}: {}", tenderId, request.getQuestion());
        Tender tender = getTenderOrThrow(tenderId);

        TenderClarification clarification = TenderClarification.builder()
                .tender(tender)
                .question(request.getQuestion())
                .bidderEmail(bidderEmail)
                .askedAt(LocalDateTime.now())
                .isPublic(false) // Private by default until reviewed
                .askedBy(1L) // Mocked user ID for now
                .build();

        clarificationRepository.save(clarification);
    }

    @Override
    @Transactional
    public ClarificationDTO answerClarification(UUID tenderId, Long clarificationId, ClarificationAnswerRequestDTO request) {
        Tender tender = getTenderOrThrow(tenderId);
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

        // Notify bidder via Notification Service (RabbitMQ)
        if (clarification.getBidderEmail() != null && !clarification.getBidderEmail().isEmpty()) {
            NotificationEvent event = NotificationEvent.builder()
                    .recipient(clarification.getBidderEmail())
                    .type("EMAIL")
                    .subject("Tender clarification answered: " + tender.getTenderNumber())
                    .message(buildNotificationMessage(tender, clarification, savedResponse))
                    .build();
            notificationProducer.sendNotification(event);
        }

        return ClarificationDTO.builder()
                .id(clarification.getId())
                .question(clarification.getQuestion())
                .answer(savedResponse.getResponse())
                .askedAt(clarification.getAskedAt())
                .answeredAt(savedResponse.getRespondedAt())
                .build();
    }

    // ======================
    // 🔧 HELPER METHODS
    // ======================

    private Tender getTenderOrThrow(UUID id) {
        return tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found"));
    }

    private long calculateTimeRemaining(LocalDateTime closingDate) {
        if (closingDate == null) {
            return 0;
        }
        return Duration.between(LocalDateTime.now(), closingDate).toSeconds();
    }
    // 🔁 MAPPERS

    private TenderSummaryDTO mapToSummaryDTO(Tender t) {
        return TenderSummaryDTO.builder()
                .id(t.getId())
                .title(t.getTitle())
                .departmentName(t.getDepartmentName())
                .estimatedBudget(t.getEstimatedBudget())
                .closingDate(t.getClosingDate())
                .status(t.getStatus())
                .timeRemaining(calculateTimeRemaining(t.getClosingDate()))
                .build();
    }

    private TenderDetailsDTO mapToDetailsDTO(Tender t) {
        return TenderDetailsDTO.builder()
                .id(t.getId())
                .tenderNumber(t.getTenderNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .specialRequirements(t.getSpecialRequirements())
                .projectOverview(t.getProjectOverview())
                .scopeOfWork(t.getScopeOfWork())
                .estimatedBudget(t.getEstimatedBudget())
                .departmentName(t.getDepartmentName())
                .openingDate(t.getOpeningDate())
                .closingDate(t.getClosingDate())
                .timeRemaining(calculateTimeRemaining(t.getClosingDate()))
                .documents(getDocuments(t.getId()))
                .addenda(getAddenda(t.getId()))
                .clarifications(getClarifications(t.getId()))
                .timeline(getTimeline(t.getId()))
                .contacts(getContacts(t.getId()))
                .build();
    }

    private TenderDocumentDTO mapDocument(TenderDocument d) {
        return TenderDocumentDTO.builder()
                .id(d.getId())
                .documentName(d.getDocumentName())
                .documentType(d.getDocumentType())
                .version(d.getVersion())
                .downloadUrl("http://localhost:8082/api/tenders/files/" + d.getS3Key())
                .build();
    }

    private TenderAmendmentDTO mapAmendment(TenderAmendment a) {
        return TenderAmendmentDTO.builder()
                .id(a.getId())
                .amendmentNumber(a.getAmendmentNumber())
                .title(a.getTitle())
                .description(a.getDescription())
                .newClosingDate(a.getNewClosingDate())
                .createdAt(a.getCreatedAt())
                .build();
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

}
