package lk.tenderease.evaluation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lk.tenderease.common.constant.ComplianceStatus;
import lk.tenderease.common.constant.EvaluationStatus;
import lk.tenderease.common.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evaluation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation extends BaseEntity {

    @Column(nullable = false)
    private UUID tenderId;

    @Column(nullable = false)
    private UUID bidId;

    @Column(nullable = false)
    private UUID evaluatorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status;

    @Column(nullable = false)
    private Boolean isFlagged = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplianceStatus complianceStatus = ComplianceStatus.PENDING;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalScore;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDateTime evaluatedAt;

    @Column(name = "evaluator_name")
    private String evaluatorName;

    @Column(name = "evaluator_role")
    private String evaluatorRole;
}
