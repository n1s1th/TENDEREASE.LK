package lk.tenderease.reporting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dashboard_kpi")
public class DashboardKPI {

    @Id
    private String id; // e.g. "GLOBAL_SUMMARY"

    private long totalTenders;
    private long pendingTenders;
    private long approvedTenders;
    private long activeOfficers;
    private long pendingRegistrations;

    private LocalDateTime updatedAt;
}
