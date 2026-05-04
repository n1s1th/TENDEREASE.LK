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
        
        // Update global summary
        updateKpiRecord(SUMMARY_ID, eventType, status, "TENDER");
        
        // Update daily snapshot
        String dailyId = "DAILY_" + java.time.LocalDate.now().toString();
        updateKpiRecord(dailyId, eventType, status, "TENDER");
    }

    private void updateKpiRecord(String id, String eventType, String status, String domain) {
        DashboardKPI kpi = getOrCreateRecord(id);
        
        if ("TENDER".equals(domain)) {
            if ("CREATED".equals(eventType)) {
                kpi.setTotalTenders(kpi.getTotalTenders() + 1);
            }
            if ("STATUS_CHANGED".equals(eventType) || "CREATED".equals(eventType)) {
                if ("PENDING_APPROVAL".equals(status)) {
                    kpi.setPendingTenders(kpi.getPendingTenders() + 1);
                } else if ("APPROVED".equals(status) || "PUBLISHED".equals(status)) {
                    kpi.setPendingTenders(Math.max(0, kpi.getPendingTenders() - 1));
                    kpi.setApprovedTenders(kpi.getApprovedTenders() + 1);
                } else if ("REJECTED".equals(status)) {
                    kpi.setPendingTenders(Math.max(0, kpi.getPendingTenders() - 1));
                }
            }
        } else if ("USER".equals(domain)) {
            if ("REGISTERED".equals(eventType)) {
                kpi.setPendingRegistrations(kpi.getPendingRegistrations() + 1);
            } else if ("APPROVED".equals(status) || "ACCEPTED".equals(eventType)) {
                kpi.setPendingRegistrations(Math.max(0, kpi.getPendingRegistrations() - 1));
                kpi.setActiveOfficers(kpi.getActiveOfficers() + 1);
            } else if ("REJECTED".equals(status)) {
                kpi.setPendingRegistrations(Math.max(0, kpi.getPendingRegistrations() - 1));
            }
        }
        
        kpi.setUpdatedAt(LocalDateTime.now());
        kpiRepository.save(kpi);
    }

    @Transactional
    public void handleUserEvent(String eventType, String status) {
        log.info("Processing user event: {} with status: {}", eventType, status);
        
        // Update global summary
        updateKpiRecord(SUMMARY_ID, eventType, status, "USER");
        
        // Update daily snapshot
        String dailyId = "DAILY_" + java.time.LocalDate.now().toString();
        updateKpiRecord(dailyId, eventType, status, "USER");
    }

    public DashboardKPI getSummary() {
        return getOrCreateRecord(SUMMARY_ID);
    }

    private DashboardKPI getOrCreateRecord(String id) {
        return kpiRepository.findById(id)
                .orElseGet(() -> {
                    // For daily records, we might want to initialize with the previous record's data
                    // But for now, let's just start from current summary if it's a new day
                    DashboardKPI summary = kpiRepository.findById(SUMMARY_ID).orElse(null);
                    
                    return DashboardKPI.builder()
                            .id(id)
                            .totalTenders(summary != null ? summary.getTotalTenders() : 0)
                            .pendingTenders(summary != null ? summary.getPendingTenders() : 0)
                            .approvedTenders(summary != null ? summary.getApprovedTenders() : 0)
                            .activeOfficers(summary != null ? summary.getActiveOfficers() : 0)
                            .pendingRegistrations(summary != null ? summary.getPendingRegistrations() : 0)
                            .smeParticipation(summary != null ? summary.getSmeParticipation() : 0.0)
                            .awardedTenders(summary != null ? summary.getAwardedTenders() : 0)
                            .averageCycleTime(summary != null ? summary.getAverageCycleTime() : 0.0)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                });
    }

    public java.util.Map<String, Object> getReportData(String period, String type, String department, String category) {
        DashboardKPI kpi = getOrCreateRecord(SUMMARY_ID);
        
        // Fetch accurate count from tender-service
        long exactActiveTenders = kpi.getApprovedTenders();
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        try {
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl("http://localhost:8082/api/cao/tenders/kpi");
            if (department != null && !department.isEmpty()) builder.queryParam("department", department);
            if (category != null && !category.isEmpty()) builder.queryParam("category", category);
            if (period != null && period.startsWith("month_")) builder.queryParam("month", period);

            String finalUrl = builder.toUriString();
            log.info("Calling tender-service KPI: {}", finalUrl);
            
            java.util.Map<String, Object> tenderKpi = restTemplate.getForObject(finalUrl, java.util.Map.class);
            if (tenderKpi != null && tenderKpi.containsKey("activeTenders")) {
                Object val = tenderKpi.get("activeTenders");
                exactActiveTenders = val instanceof Number ? ((Number) val).longValue() : 0;
                
                // Only update local KPI if no filters are applied (the GLOBAL state)
                if (department == null && category == null && (period == null || "all_time".equals(period))) {
                    kpi.setApprovedTenders((int) exactActiveTenders);
                    kpiRepository.save(kpi);
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch accurate KPIs from tender-service", e);
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        java.util.List<java.util.Map<String, Object>> cycleTimeTrend = new java.util.ArrayList<>();
        response.put("cycleTimeTrend", cycleTimeTrend);
        
        // 2. SME Participation (Disabled for now as per user request)
        response.put("smeParticipationPercent", -1);
        
        java.util.List<java.util.Map<String, Object>> awardValueTrend = new java.util.ArrayList<>();
        response.put("awardValueTrend", awardValueTrend);
        
        // 3. Active Tenders Growth (Real trend from tender-service)
        java.util.List<java.util.Map<String, Object>> activeTendersTrend = new java.util.ArrayList<>();
        try {
            org.springframework.web.util.UriComponentsBuilder trendBuilder = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl("http://localhost:8082/api/cao/tenders/kpi/trend");
            if (department != null && !department.isEmpty()) trendBuilder.queryParam("department", department);
            if (category != null && !category.isEmpty()) trendBuilder.queryParam("category", category);
            
            java.util.List<java.util.Map<String, Object>> trendData = restTemplate.getForObject(trendBuilder.toUriString(), java.util.List.class);
            if (trendData != null) {
                activeTendersTrend = trendData;
            }
        } catch (Exception e) {
            log.error("Failed to fetch real KPI trend", e);
            // Fallback: show at least current month
            String currentMonth = java.time.LocalDate.now().getMonth().name().substring(0, 3);
            activeTendersTrend.add(java.util.Map.of("label", currentMonth, "value", exactActiveTenders));
        }
        
        // If specific month is selected, we show the trend leading up to that month
        if (period != null && period.startsWith("month_")) {
            int targetMonth = Integer.parseInt(period.substring(6));
            activeTendersTrend = activeTendersTrend.stream()
                .filter(m -> {
                    try {
                        // Trend labels are like "Jan", "Feb", etc.
                        java.time.Month mEnum = java.time.Month.valueOf(m.get("label").toString().toUpperCase().replace("JAN", "JANUARY").replace("FEB", "FEBRUARY").replace("MAR", "MARCH").replace("APR", "APRIL").replace("MAY", "MAY").replace("JUN", "JUNE").replace("JUL", "JULY").replace("AUG", "AUGUST").replace("SEP", "SEPTEMBER").replace("OCT", "OCTOBER").replace("NOV", "NOVEMBER").replace("DEC", "DECEMBER"));
                        return mEnum.getValue() <= targetMonth;
                    } catch (Exception e) { return true; }
                })
                .collect(java.util.stream.Collectors.toList());
        }
        
        response.put("activeTendersTrend", activeTendersTrend);
        
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("avgCycleTime", kpi.getAverageCycleTime() > 0 ? kpi.getAverageCycleTime() + " days" : "—");
        summary.put("smeParticipation", kpi.getSmeParticipation() > 0 ? kpi.getSmeParticipation() + "%" : "—");
        summary.put("totalAwardValue", "—");
        summary.put("totalAwards", kpi.getAwardedTenders()); 
        summary.put("activeTenders", exactActiveTenders);
        response.put("summary", summary);
        
        return response;
    }
}
