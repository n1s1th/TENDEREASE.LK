package lk.tenderease.evaluation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lk.tenderease.common.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evaluation_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResult extends BaseEntity {

    @Column(nullable = false)
    private UUID tenderId;

    private UUID winningBidId;

    @Column(precision = 10, scale = 2)
    private BigDecimal finalScore;

    private LocalDateTime approvedAt;

    @Column(nullable = false)
    private String status; // DRAFT, FINALIZED
}
