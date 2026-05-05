package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.tender.enums.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tender", indexes = {
        @Index(name = "idx_tender_status", columnList = "status"),
        @Index(name = "idx_tender_ministry_id", columnList = "ministry_id"),
        @Index(name = "idx_tender_department_id", columnList = "department_id"),
        @Index(name = "idx_tender_number", columnList = "tender_number", unique = true),
        @Index(name = "idx_tender_created_by", columnList = "created_by")
})
public class Tender extends BaseEntity {

    @Column(name = "tender_number", nullable = false, unique = true, length = 50)
    private String tenderNumber;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_overview", columnDefinition = "TEXT")
    private String projectOverview;

    @Column(name = "scope_of_work", columnDefinition = "TEXT")
    private String scopeOfWork;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    @Column(name = "procurement_type", nullable = false)
    private ProcurementType procurementType;

    @Enumerated(EnumType.STRING)
    @Column(name = "bidding_method", nullable = false)
    private BiddingMethod biddingMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type", nullable = false)
    private TenderType tenderType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ministry_id", nullable = false)
    private Ministry ministry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "estimated_budget", nullable = false, precision = 18, scale = 2)
    private BigDecimal estimatedBudget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funding_source_id")
    private FundingSource fundingSource;

    @Column(name = "sme_indicator")
    @Builder.Default
    private boolean smeIndicator = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TenderStatus status = TenderStatus.DRAFT;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "template_id")
    private UUID templateId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dynamic_data", columnDefinition = "jsonb")
    private Map<String, Object> dynamicData;

    // ✅ Dates from LEFT
    @Column(name = "opening_date")
    private LocalDateTime openingDate;

    @Column(name = "closing_date")
    private LocalDateTime closingDate;

    // ✅ Relationships from BOTH
    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TenderDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderAmendment> amendments;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderClarification> clarifications;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderTimeline> timelineEvents;

    @OneToOne(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true)
    private TenderSchedule schedule;

    @OneToOne(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true)
    private TenderComplianceChecklist complianceChecklist;
}