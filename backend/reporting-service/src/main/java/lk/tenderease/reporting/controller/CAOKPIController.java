package lk.tenderease.reporting.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.reporting.entity.DashboardKPI;
import lk.tenderease.reporting.service.KPIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/cao/kpi")
@RequiredArgsConstructor
@Tag(name = "CAO Analytics", description = "Dashboard APIs for CAO to view system KPIs")
public class CAOKPIController {

    private final KPIService kpiService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Returns aggregated counts for tenders and officers.")
    public ResponseEntity<DashboardKPI> getSummary() {
        log.info("CAO request for KPI summary");
        return ResponseEntity.ok(kpiService.getSummary());
    }

    @GetMapping("/report")
    @Operation(summary = "Get KPI report data", description = "Returns report data for charts")
    public ResponseEntity<java.util.Map<String, Object>> getReport(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        log.info("CAO request for KPI report. period: {}, dept: {}, cat: {}", period, department, category);
        return ResponseEntity.ok(kpiService.getReportData(period, type, department, category));
    }
}
