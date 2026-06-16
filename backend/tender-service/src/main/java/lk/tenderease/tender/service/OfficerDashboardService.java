package lk.tenderease.tender.service;

import lk.tenderease.tender.dto.response.DashboardMetricsResponse;
import lk.tenderease.tender.dto.response.OfficerTenderResponse;
import lk.tenderease.tender.dto.response.OpeningLogResponse;
import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.repository.TenderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for the Officer Dashboard.
 * Aggregates tender data into KPI metrics and builds the assigned tender list.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OfficerDashboardService {

    private final TenderRepository tenderRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * Builds the KPI metrics for the dashboard cards.
     * - active: tenders in PUBLISHED, PENDING_OPENING, or OPEN status
     * - evaluating: tenders in EVALUATION status
     * - awarded: tenders in AWARDED status
     * - noBids: tenders in NO_BID status
     * - bids: placeholder (will be enriched from bid-service by the frontend)
     */
    public DashboardMetricsResponse getMetrics() {
        long active = tenderRepository.countByStatusIn(
                Arrays.asList(TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING, TenderStatus.OPEN)
        );
        long evaluating = tenderRepository.countByStatus(TenderStatus.EVALUATION);
        long awarded = tenderRepository.countByStatus(TenderStatus.AWARDED);
        long noBids = tenderRepository.countByStatus(TenderStatus.NO_BID);

        log.info("Dashboard metrics — active: {}, evaluating: {}, awarded: {}, noBids: {}",
                active, evaluating, awarded, noBids);

        return DashboardMetricsResponse.builder()
                .active(active)
                .bids(0) // Will be enriched by frontend from bid-service
                .evaluating(evaluating)
                .awarded(awarded)
                .noBids(noBids)
                .build();
    }

    /**
     * Returns a paginated list of tenders that are past the APPROVED stage (i.e., visible to the officer).
     * These are tenders that the CAO has approved and are now in the officer's workflow.
     */
    public org.springframework.data.domain.Page<OfficerTenderResponse> getAssignedTenders(String keyword, String status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        org.springframework.data.domain.Page<Tender> tenderPage;

        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            List<TenderStatus> statuses = switch (status.toUpperCase()) {
                case "PENDING_OPENING" -> Arrays.asList(TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING);
                case "OPEN" -> Arrays.asList(TenderStatus.OPEN);
                case "EVALUATION" -> Arrays.asList(TenderStatus.EVALUATION);
                case "COMPLETED" -> Arrays.asList(TenderStatus.AWARDED, TenderStatus.NO_BID, TenderStatus.CLOSED);
                default -> Arrays.asList(TenderStatus.valueOf(status.toUpperCase()));
            };
            tenderPage = tenderRepository.searchWithStatuses(keyword == null ? "" : keyword, statuses, pageable);
        } else {
            tenderPage = tenderRepository.searchWithoutStatus(keyword == null ? "" : keyword, pageable);
        }

        log.info("Found {} assigned tenders matching criteria", tenderPage.getTotalElements());

        return tenderPage.map(this::mapToOfficerResponse);
    }

    /**
     * Returns a list of tenders that are ready for bid opening.
     * These are tenders currently in PUBLISHED or PENDING_OPENING status.
     */
    public List<OfficerTenderResponse> getTendersForOpening() {
        List<Tender> tenders = tenderRepository.findAllByStatusIn(
                Arrays.asList(TenderStatus.PUBLISHED, TenderStatus.PENDING_OPENING)
        );
        log.info("Found {} tenders ready for bid opening", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a list of tenders that have already had their bids opened.
     * These are historical records for the "Opening Logs" quick action.
     */
    public List<OpeningLogResponse> getOpeningLogs() {
        List<TenderStatus> openedStatuses = Arrays.asList(
                TenderStatus.OPEN, TenderStatus.EVALUATION,
                TenderStatus.AWARDED, TenderStatus.NO_BID, TenderStatus.CLOSED
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(openedStatuses);
        log.info("Found {} historical opening logs", tenders.size());
        return tenders.stream()
                .map(this::mapToOpeningLogResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a list of tenders that have bids available for document export.
     * These are tenders currently in OPEN, EVALUATION, or later stages.
     */
    public List<OfficerTenderResponse> getTendersWithBids() {
        List<TenderStatus> withBidsStatuses = Arrays.asList(
                TenderStatus.OPEN, TenderStatus.EVALUATION,
                TenderStatus.AWARDED, TenderStatus.NO_BID, TenderStatus.CLOSED
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(withBidsStatuses);
        log.info("Found {} tenders with potential bid documents", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    private OpeningLogResponse mapToOpeningLogResponse(Tender tender) {
        String openingDate = tender.getOpeningDate() != null
                ? tender.getOpeningDate().format(DATE_FMT)
                : "N/A";

        return OpeningLogResponse.builder()
                .id(tender.getId().toString())
                .tenderNo(tender.getTenderNumber())
                .title(tender.getTitle())
                .openingDate(openingDate)
                .status(mapToFrontendStatus(tender.getStatus()))
                .category(tender.getProcurementType() != null ? tender.getProcurementType().name() : "General")
                .build();
    }


    /**
     * Returns a list of tenders that are in the final stages of evaluation and pending award finalization.
     */
    public List<OfficerTenderResponse> getTendersPendingAward() {
        List<TenderStatus> pendingAwardStatuses = Arrays.asList(
                TenderStatus.EVALUATION, TenderStatus.OPEN
        );
        List<Tender> tenders = tenderRepository.findAllByStatusIn(pendingAwardStatuses);
        log.info("Found {} tenders pending award finalization", tenders.size());
        return tenders.stream()
                .map(this::mapToOfficerResponse)
                .collect(Collectors.toList());
    }

    private OfficerTenderResponse mapToOfficerResponse(Tender tender) {
        String closingDate = tender.getClosingDate() != null
                ? tender.getClosingDate().format(DATE_FMT)
                : "N/A";

        // Map the procurementType to a human-readable category
        String category = tender.getProcurementType() != null
                ? tender.getProcurementType().name()
                : "General";

        // Map the internal status to what the frontend filter expects
        String frontendStatus = mapToFrontendStatus(tender.getStatus());

        return OfficerTenderResponse.builder()
                .id(tender.getId().toString())
                .tenderNo(tender.getTenderNumber())
                .title(tender.getTitle())
                .category(category)
                .status(frontendStatus)
                .closingDate(closingDate)
                .role("Officer")
                .build();
    }

    /**
     * Maps internal TenderStatus to the status strings the frontend filter expects:
     * PENDING_OPENING, OPEN, EVALUATION, COMPLETED
     */
    private String mapToFrontendStatus(TenderStatus status) {
        return switch (status) {
            case PUBLISHED, PENDING_OPENING -> "PENDING_OPENING";
            case OPEN -> "OPEN";
            case EVALUATION -> "EVALUATION";
            case AWARDED, NO_BID, CLOSED -> "COMPLETED";
            default -> status.name();
        };
    }
}
