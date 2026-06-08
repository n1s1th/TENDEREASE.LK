package lk.tenderease.tender.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.tender.dto.response.DashboardMetricsResponse;
import lk.tenderease.tender.dto.response.OfficerTenderResponse;
import lk.tenderease.tender.dto.response.OpeningLogResponse;
import lk.tenderease.tender.service.OfficerDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for the Officer Dashboard.
 * Provides KPI metrics and the list of assigned tenders.
 */
@Slf4j
@RestController
@RequestMapping("/api/officer/dashboard")
@RequiredArgsConstructor
@Tag(name = "Officer Dashboard", description = "APIs for the Officer Dashboard KPIs and tender list")
public class OfficerDashboardController {

    private final OfficerDashboardService dashboardService;

    @GetMapping("/metrics")
    @Operation(summary = "Get dashboard KPI metrics",
            description = "Returns counts of active tenders, bids, evaluations, awards, and no-bid tenders")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        log.info("Officer dashboard: fetching KPI metrics");
        DashboardMetricsResponse metrics = dashboardService.getMetrics();

        // Wrap in the format the frontend expects: { data: { active, bids, ... } }
        Map<String, Object> response = Map.of(
                "success", true,
                "data", metrics
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenders")
    @Operation(summary = "Get assigned tenders with filtering and pagination",
            description = "Returns the paginated list of CAO-approved tenders assigned to officers, filtered by keyword and status")
    public ResponseEntity<Map<String, Object>> getAssignedTenders(
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "") String keyword,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "8") int size) {
        
        log.info("Officer dashboard: fetching assigned tenders. Keyword: '{}', Status: '{}', Page: {}, Size: {}", keyword, status, page, size);
        
        org.springframework.data.domain.Page<OfficerTenderResponse> tendersPage = dashboardService.getAssignedTenders(keyword, status, page, size);

        // Wrap in the format the frontend expects: { success: true, data: { content, totalElements, totalPages, number } }
        Map<String, Object> response = Map.of(
                "success", true,
                "data", Map.of(
                        "content", tendersPage.getContent(),
                        "totalElements", tendersPage.getTotalElements(),
                        "totalPages", tendersPage.getTotalPages(),
                        "number", tendersPage.getNumber()
                )
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenders-for-opening")
    @Operation(summary = "Get tenders ready for bid opening",
            description = "Returns a list of tenders in PUBLISHED or PENDING_OPENING status")
    public ResponseEntity<Map<String, Object>> getTendersForOpening() {
        log.info("Officer dashboard: fetching tenders for opening session");
        List<OfficerTenderResponse> tenders = dashboardService.getTendersForOpening();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tenders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/opening-logs")
    @Operation(summary = "Get historical bid opening logs",
            description = "Returns a list of tenders that have already had their bids opened")
    public ResponseEntity<Map<String, Object>> getOpeningLogs() {
        log.info("Officer dashboard: fetching historical bid opening logs");
        List<OpeningLogResponse> logs = dashboardService.getOpeningLogs();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenders-with-bids")
    @Operation(summary = "Get tenders with potential bids",
            description = "Returns a list of tenders in OPEN, EVALUATION, or later statuses for document export")
    public ResponseEntity<Map<String, Object>> getTendersWithBids() {
        log.info("Officer dashboard: fetching tenders for document export");
        List<OfficerTenderResponse> tenders = dashboardService.getTendersWithBids();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tenders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenders-pending-award")
    @Operation(summary = "Get tenders pending award finalization",
            description = "Returns a list of tenders in EVALUATION or OPEN status awaiting final award")
    public ResponseEntity<Map<String, Object>> getTendersPendingAward() {
        log.info("Officer dashboard: fetching tenders for award processing");
        List<OfficerTenderResponse> tenders = dashboardService.getTendersPendingAward();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tenders);
        return ResponseEntity.ok(response);
    }
}
