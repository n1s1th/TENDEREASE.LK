package lk.tenderease.tender.service;

import lk.tenderease.tender.dto.response.DashboardMetricsResponse;
import lk.tenderease.tender.dto.response.ClarificationDTO;
import lk.tenderease.tender.dto.response.OfficerTenderResponse;
import lk.tenderease.tender.dto.response.OpeningLogResponse;
import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.repository.TenderRepository;
import lk.tenderease.tender.service.TenderService;
import lk.tenderease.tender.repository.ClarificationResponseRepository;
import lk.tenderease.tender.repository.TenderClarificationRepository;
import lk.tenderease.tender.entity.ClarificationResponse;
import lk.tenderease.tender.entity.TenderClarification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for the Officer Dashboard.
 *
 * Data source: only PUBLISHED tenders are shown to officers.
 * PUBLISHED = CAO has approved the tender and it is active for bid operations.
 *
 * Lifecycle:
 *   PENDING_APPROVAL -> (CAO approves) -> PUBLISHED -> (bid session opened) -> OPEN -> ...
 *
 * When a bid opening session is started, the status is updated to OPEN in the database.
 * Because both the Approved Tenders table and the Secure Bid Opening popup query only
 * PUBLISHED tenders, the entry disappears from both lists automatically on next fetch.
 * This is DB-persisted and refresh-safe — no in-memory state is needed.
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OfficerDashboardService {

    private final TenderRepository tenderRepository;
    private final TenderClarificationRepository clarificationRepository;
    private final ClarificationResponseRepository responseRepository;
    private final TenderService tenderService;



    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * The only status that represents a CAO-approved tender visible to officers.
     * Once a bid session opens, the status changes to OPEN and the tender leaves this set.
     */
    private static final List<TenderStatus> APPROVED_STATUSES = Arrays.asList(
            TenderStatus.PUBLISHED,
            TenderStatus.PENDING_OPENING,
            TenderStatus.OPEN,
            TenderStatus.EVALUATION,
            TenderStatus.CLOSED,
            TenderStatus.AWARDED
    );

    /**
     * Builds the KPI metrics for the dashboard cards.
     * - active: tenders currently in PUBLISHED status (CAO approved, bid session not yet opened)
     * - evaluating: tenders in EVALUATION status
     * - awarded: tenders in AWARDED status
     * - noBids: tenders in NO_BID status
     * - bids: enriched by the frontend from bid-service
     */
    public DashboardMetricsResponse getMetrics() {
        List<TenderStatus> activeStatuses = Arrays.asList(
                TenderStatus.PUBLISHED,
                TenderStatus.PENDING_OPENING,
                TenderStatus.OPEN,
                TenderStatus.EVALUATION
        );
        long active     = tenderRepository.countByStatusIn(activeStatuses);
        long evaluating = tenderRepository.countByStatus(TenderStatus.EVALUATION);
        long awarded    = tenderRepository.countByStatus(TenderStatus.AWARDED);
        long completed  = tenderRepository.countByStatusIn(Arrays.asList(TenderStatus.CLOSED, TenderStatus.AWARDED));
        long noBids     = tenderRepository.countByStatus(TenderStatus.NO_BID);
        // RestTemplate call disabled to optimize dashboard loading times
        /*
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            List<Tender> activeTenders = tenderRepository.findAllByStatusIn(APPROVED_STATUSES);
            String bidsUrl = "http://localhost:8083/api/bids";
            java.util.Map<?, ?> bidsResponse = restTemplate.getForObject(bidsUrl, java.util.Map.class);
            if (bidsResponse != null && bidsResponse.get("data") != null) {
                List<?> bidsList = (List<?>) bidsResponse.get("data");
                java.util.Set<UUID> tendersWithBids = new java.util.HashSet<>();
                for (Object bidObj : bidsList) {
                    if (bidObj instanceof java.util.Map) {
                        java.util.Map<?, ?> bidMap = (java.util.Map<?, ?>) bidObj;
                        if (bidMap.get("tenderId") != null) {
                            tendersWithBids.add(UUID.fromString(bidMap.get("tenderId").toString()));
                        }
                    }
                }
                for (Tender tender : activeTenders) {
                    if (!tendersWithBids.contains(tender.getId())) {
                        noBids++;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to calculate zero-bid tenders count: {}", e.getMessage());
        }
        */

        log.info("Dashboard metrics — active(in progress): {}, evaluating: {}, awarded: {}, noBids: {}, completed: {}",
                active, evaluating, awarded, noBids, completed);

        return DashboardMetricsResponse.builder()
                .active(active)
                .bids(0) // Enriched by frontend from bid-service
                .evaluating(evaluating)
                .awarded(awarded)
                .noBids(noBids)
                .completed(completed)
                .build();
    }

    /**
     * Returns the paginated list of CAO-approved tenders for the Approved Tenders table.
     *
     * Only PUBLISHED tenders are returned — these are tenders the CAO has approved and
     * whose bid opening session has not yet started. Supports keyword search.
     */
    public org.springframework.data.domain.Page<OfficerTenderResponse> getAssignedTenders(
            String keyword, String status, int page, int size) {

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(
                        page, size,
                        org.springframework.data.domain.Sort.by("createdAt").descending());

        List<TenderStatus> filterStatuses = APPROVED_STATUSES;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            if (status.equalsIgnoreCase("PENDING_OPENING")) {
                filterStatuses = Arrays.asList(TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING);
            } else if (status.equalsIgnoreCase("OPEN")) {
                filterStatuses = Collections.singletonList(TenderStatus.OPEN);
            } else if (status.equalsIgnoreCase("EVALUATION")) {
                filterStatuses = Collections.singletonList(TenderStatus.EVALUATION);
            } else if (status.equalsIgnoreCase("COMPLETED")) {
                filterStatuses = Arrays.asList(TenderStatus.CLOSED, TenderStatus.AWARDED);
            }
        }

        org.springframework.data.domain.Page<Tender> tenderPage =
                tenderRepository.searchWithStatuses(
                        keyword == null ? "" : keyword, filterStatuses, pageable);

        log.info("Approved Tenders table: found {} tenders matching filter", tenderPage.getTotalElements());
        return tenderPage.map(this::mapToOfficerResponse);
    }

    /**
     * Returns all CAO-approved tenders available for bid opening in the Secure Bid Opening popup.
     *
     * Only PUBLISHED tenders are returned. Once an officer starts a bid opening session
     * (which updates status to OPEN in the DB), the tender auto-disappears from this list
     * on the next fetch — no extra table or flag needed. Refresh-safe and DB-persisted.
     */
    public List<OfficerTenderResponse> getTendersForOpening() {
        List<TenderStatus> openingStatuses = Arrays.asList(
                TenderStatus.PUBLISHED,
                TenderStatus.PENDING_OPENING
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(openingStatuses);
        log.info("Secure Bid Opening popup: found {} PENDING_OPENING tenders available", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns historical bid opening records for the Opening Logs quick action.
     * These are tenders that have moved past PUBLISHED (bid session already opened).
     */
    public List<OpeningLogResponse> getOpeningLogs() {
        List<TenderStatus> openedStatuses = Arrays.asList(
                TenderStatus.OPEN, TenderStatus.EVALUATION,
                TenderStatus.AWARDED, TenderStatus.NO_BID, TenderStatus.CLOSED
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(openedStatuses);
        log.info("Opening Logs: found {} historical records", tenders.size());
        return tenders.stream()
                .map(this::mapToOpeningLogResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns tenders with bids available for document export.
     */
    public List<OfficerTenderResponse> getTendersWithBids() {
        List<TenderStatus> withBidsStatuses = Arrays.asList(
                TenderStatus.OPEN, TenderStatus.EVALUATION,
                TenderStatus.AWARDED, TenderStatus.NO_BID, TenderStatus.CLOSED
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(withBidsStatuses);
        log.info("Document Export: found {} tenders with bid documents", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns tenders pending award finalization.
     */
    public List<OfficerTenderResponse> getTendersPendingAward() {
        List<TenderStatus> pendingAwardStatuses = Arrays.asList(
                TenderStatus.CLOSED, TenderStatus.AWARDED
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(pendingAwardStatuses);
        log.info("Pending Award: found {} tenders", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private OfficerTenderResponse mapToOfficerResponse(Tender tender) {
        String closingDate = tender.getClosingDate() != null
                ? tender.getClosingDate().format(DATE_FMT)
                : "N/A";

        String category = tender.getProcurementType() != null
                ? tender.getProcurementType().name()
                : "General";

        String status = "PENDING_OPENING";
        if (tender.getStatus() == TenderStatus.OPEN) {
            status = "OPEN";
        } else if (tender.getStatus() == TenderStatus.EVALUATION) {
            status = "EVALUATION";
        } else if (tender.getStatus() == TenderStatus.CLOSED || tender.getStatus() == TenderStatus.AWARDED) {
            status = "COMPLETED";
        }

        return OfficerTenderResponse.builder()
                .id(tender.getId().toString())
                .tenderNo(tender.getTenderNumber())
                .title(tender.getTitle())
                .category(category)
                .status(status)
                .closingDate(closingDate)
                .role("Officer")
                .createdAt(tender.getCreatedAt() != null ? tender.getCreatedAt().toString() : null)
                .build();
    }

    private OpeningLogResponse mapToOpeningLogResponse(Tender tender) {
        LocalDateTime openDateTime = tender.getOpeningDate();
        if (openDateTime == null) {
            openDateTime = tender.getUpdatedAt();
        }
        if (openDateTime == null) {
            openDateTime = tender.getCreatedAt();
        }

        String openingDate = openDateTime != null
                ? openDateTime.format(DATE_FMT)
                : "N/A";

        return OpeningLogResponse.builder()
                .id(tender.getId().toString())
                .tenderNo(tender.getTenderNumber())
                .title(tender.getTitle())
                .openingDate(openingDate)
                .status(mapToFrontendStatus(tender.getStatus()))
                .category(tender.getProcurementType() != null
                        ? tender.getProcurementType().name() : "General")
                .build();
    }

    public List<ClarificationDTO> getAllClarifications(String officerEmail) {
        return clarificationRepository.findAllByOrderByAskedAtDesc().stream()
                .filter(c -> {
                    if (officerEmail == null || officerEmail.isEmpty()) return true;
                    Tender tender = c.getTender();
                    return tender != null && officerEmail.equals(tender.getCreatedBy());
                })
                .map(this::mapToClarificationDTO)
                .collect(Collectors.toList());
    }

    public List<ClarificationDTO> getClarifications(UUID tenderId) {
        return clarificationRepository.findByTenderIdOrderByAskedAtDesc(tenderId).stream()
                .map(this::mapToClarificationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClarificationDTO answerClarification(UUID tenderId, Long clarificationId, String answer) {
        ClarificationAnswerRequestDTO request = new ClarificationAnswerRequestDTO();
        request.setResponse(answer);
        request.setRespondedBy(1L);
        return tenderService.answerClarification(tenderId, clarificationId, request);
    }

    private ClarificationDTO mapToClarificationDTO(TenderClarification clarification) {
        Tender tender = clarification.getTender();
        var response = responseRepository.findByClarificationId(clarification.getId());

        return ClarificationDTO.builder()
                .id(clarification.getId())
                .tenderId(tender != null ? tender.getId().toString() : null)
                .tenderTitle(tender != null ? tender.getTitle() : null)
                .tenderNumber(tender != null ? tender.getTenderNumber() : null)
                .question(clarification.getQuestion())
                .answer(response.map(ClarificationResponse::getResponse).orElse(null))
                .askedAt(clarification.getAskedAt())
                .answeredAt(response.map(ClarificationResponse::getRespondedAt).orElse(null))
                .bidderEmail(clarification.getBidderEmail())
                .category(tender != null && tender.getProcurementType() != null ? tender.getProcurementType().name() : null)
                .department(tender != null && tender.getDepartment() != null ? tender.getDepartment().getName() : null)
                .closingDate(tender != null ? tender.getClosingDate() : null)
                .build();
    }
    private String mapToFrontendStatus(TenderStatus status) {
        return switch (status) {
            case PUBLISHED          -> "APPROVED";
            case PENDING_OPENING    -> "PENDING_OPENING";
            case OPEN               -> "OPEN";
            case EVALUATION         -> "EVALUATION";
            case AWARDED, NO_BID, CLOSED -> "COMPLETED";
            default                 -> status.name();
        };
    }
}
