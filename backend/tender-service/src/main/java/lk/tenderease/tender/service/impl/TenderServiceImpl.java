package lk.tenderease.tender.service.impl;

import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.entity.*;
import lk.tenderease.tender.repository.*;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return clarificationRepository.findByTenderIdAndIsPublicTrue(tenderId)
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
    public void submitClarification(UUID tenderId, ClarificationRequestDTO request) {
        log.info("Submitting clarification for tender {}: {}", tenderId, request.getQuestion());
        Tender tender = getTenderOrThrow(tenderId);

        TenderClarification clarification = TenderClarification.builder()
                .tender(tender)
                .question(request.getQuestion())
                .askedAt(LocalDateTime.now())
                .isPublic(false) // Private by default until reviewed
                .askedBy(1L) // Mocked user ID for now
                .build();

        clarificationRepository.save(clarification);
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
                .downloadUrl("S3_URL_PLACEHOLDER")
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
}