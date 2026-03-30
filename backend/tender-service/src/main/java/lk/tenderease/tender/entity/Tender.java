package lk.tenderease.tender.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "procurement_type", nullable = false, length = 30)
    private ProcurementType procurementType;

    @Enumerated(EnumType.STRING)
    @Column(name = "bidding_method", nullable = false, length = 10)
    private BiddingMethod biddingMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type", nullable = false, length = 30)
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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TenderStatus status = TenderStatus.DRAFT;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TenderDocument> documents = new ArrayList<>();

    @OneToOne(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TenderSchedule schedule;

    @OneToOne(mappedBy = "tender", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TenderComplianceChecklist complianceChecklist;
}
