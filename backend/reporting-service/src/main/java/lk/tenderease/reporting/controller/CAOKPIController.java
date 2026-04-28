package lk.tenderease.reporting.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.reporting.entity.DashboardKPI;
import lk.tenderease.reporting.service.KPIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/cao/kpi")
@RequiredArgsConstructor
@Tag(name = "CAO Analytics", description = "Dashboard APIs for CAO to view system KPIs")
public class CAOKPIController {

    private final KPIService kpiService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "Get dashboard summary", description = "Returns aggregated counts for tenders and officers.")
    public ResponseEntity<DashboardKPI> getSummary() {
        log.info("CAO request for KPI summary");
        return ResponseEntity.ok(kpiService.getSummary());
    }
}
