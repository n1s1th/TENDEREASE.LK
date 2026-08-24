package lk.tenderease.evaluation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tenderId;

    @Column(nullable = false)
    private String tenderName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private BigDecimal estimatedBudget;

    @Column(nullable = false)
    private String bidderName;

    @Column(nullable = false)
    private BigDecimal recommendedValue;

    @Column(nullable = false)
    private Double finalScore;

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Column(name = "technical_score")
    private Double technicalScore;

    @Column(name = "financial_score")
    private Double financialScore;

    @Column(name = "bid_id")
    private String bidId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime actionedAt;

    public enum RecommendationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
