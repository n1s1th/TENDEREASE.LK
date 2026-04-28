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
}
