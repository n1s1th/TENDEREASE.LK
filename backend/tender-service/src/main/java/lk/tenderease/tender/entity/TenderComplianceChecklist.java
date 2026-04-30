package lk.tenderease.tender.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lk.tenderease.common.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tender_compliance_checklist", indexes = {
    @Index(name = "idx_tender_compliance_checklist_tender_id", columnList = "tender_id", unique = true)
})
public class TenderComplianceChecklist extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id", nullable = false, unique = true)
    private Tender tender;

    @Column(name = "procurement_plan_approved", nullable = false)
    @Builder.Default
    private Boolean procurementPlanApproved = false;

    @Column(name = "budget_availability_confirmed", nullable = false)
    @Builder.Default
    private Boolean budgetAvailabilityConfirmed = false;

    @Column(name = "sbds_compliant_with_guidelines", nullable = false)
    @Builder.Default
    private Boolean sbdsCompliantWithGuidelines = false;

    @Column(name = "evaluation_criteria_defined", nullable = false)
    @Builder.Default
    private Boolean evaluationCriteriaDefined = false;
}
