package lk.tenderease.reporting.service;

import lk.tenderease.reporting.entity.DashboardKPI;
import lk.tenderease.reporting.repository.DashboardKPIRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class KPIService {

    private final DashboardKPIRepository kpiRepository;
    private static final String SUMMARY_ID = "GLOBAL_SUMMARY";

    @Transactional
    public void handleTenderEvent(String eventType, String status) {
        log.info("Processing tender event: {} with status: {}", eventType, status);
        DashboardKPI kpi = getOrCreateSummary();
        
        if ("CREATED".equals(eventType)) {
            kpi.setTotalTenders(kpi.getTotalTenders() + 1);
        }
        
        // Simple logic for counts (In a real app, you might want to query the DB for exact counts periodically)
        if ("STATUS_CHANGED".equals(eventType) || "CREATED".equals(eventType)) {
            if ("PENDING_APPROVAL".equals(status)) {
                kpi.setPendingTenders(kpi.getPendingTenders() + 1);
            } else if ("APPROVED".equals(status) || "PUBLISHED".equals(status)) {
                // If it was pending, decrement pending
                kpi.setPendingTenders(Math.max(0, kpi.getPendingTenders() - 1));
                kpi.setApprovedTenders(kpi.getApprovedTenders() + 1);
            }
        }
        
        kpi.setUpdatedAt(LocalDateTime.now());
        kpiRepository.save(kpi);
    }

    @Transactional
    public void handleUserEvent(String eventType, String status) {
        log.info("Processing user event: {} with status: {}", eventType, status);
        DashboardKPI kpi = getOrCreateSummary();

        if ("REGISTERED".equals(eventType)) {
            kpi.setPendingRegistrations(kpi.getPendingRegistrations() + 1);
        } else if ("APPROVED".equals(status) || "ACCEPTED".equals(eventType)) {
            kpi.setPendingRegistrations(Math.max(0, kpi.getPendingRegistrations() - 1));
            kpi.setActiveOfficers(kpi.getActiveOfficers() + 1);
        }

        kpi.setUpdatedAt(LocalDateTime.now());
        kpiRepository.save(kpi);
    }

    public DashboardKPI getSummary() {
        return getOrCreateSummary();
    }

    private DashboardKPI getOrCreateSummary() {
        return kpiRepository.findById(SUMMARY_ID)
                .orElse(DashboardKPI.builder()
                        .id(SUMMARY_ID)
                        .totalTenders(0)
                        .pendingTenders(0)
                        .approvedTenders(0)
                        .activeOfficers(0)
                        .pendingRegistrations(0)
                        .updatedAt(LocalDateTime.now())
                        .build());
    }

    public java.util.Map<String, Object> getReportData(String period, String type) {
        DashboardKPI kpi = getOrCreateSummary();
        
        // Fetch accurate count from tender-service
        long exactActiveTenders = kpi.getApprovedTenders();
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, Integer> response = restTemplate.getForObject("http://localhost:8082/api/cao/tenders/kpi", java.util.Map.class);
            if (response != null && response.containsKey("activeTenders")) {
                exactActiveTenders = response.get("activeTenders");
                // Update local KPI to keep it in sync
                kpi.setApprovedTenders((int) exactActiveTenders);
                kpiRepository.save(kpi);
            }
        } catch (Exception e) {
            log.error("Failed to fetch accurate KPIs from tender-service", e);
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        java.util.List<java.util.Map<String, Object>> cycleTimeTrend = new java.util.ArrayList<>();
        response.put("cycleTimeTrend", cycleTimeTrend);
        
        response.put("smeParticipationPercent", null);
        
        java.util.List<java.util.Map<String, Object>> awardValueTrend = new java.util.ArrayList<>();
        response.put("awardValueTrend", awardValueTrend);
        
        java.util.List<java.util.Map<String, Object>> activeTendersTrend = new java.util.ArrayList<>();
        String currentMonth = java.time.LocalDate.now().getMonth().name().substring(0, 1) + 
                              java.time.LocalDate.now().getMonth().name().substring(1, 3).toLowerCase();
        activeTendersTrend.add(java.util.Map.of("label", currentMonth, "value", exactActiveTenders));
        response.put("activeTendersTrend", activeTendersTrend);
        
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("avgCycleTime", "—");
        summary.put("smeParticipation", "—");
        summary.put("totalAwardValue", "—");
        summary.put("totalAwards", 0); // No awards yet
        summary.put("activeTenders", exactActiveTenders);
        response.put("summary", summary);
        
        return response;
    }
}
