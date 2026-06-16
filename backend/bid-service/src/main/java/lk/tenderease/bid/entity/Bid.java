package lk.tenderease.bid.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a bid submitted by a bidder for a specific tender.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "bid", indexes = {
        @Index(name = "idx_bid_tender_id", columnList = "tender_id"),
        @Index(name = "idx_bid_status", columnList = "status"),
        @Index(name = "idx_bid_bidder_email", columnList = "bidder_email")
})
public class Bid extends BaseEntity {

    @Column(name = "tender_id", nullable = false)
    private UUID tenderId;

    @Column(name = "bidder_name", nullable = false, length = 255)
    private String bidderName;

    @Column(name = "bidder_email", nullable = false, length = 255)
    private String bidderEmail;

    @Column(name = "company_name", length = 500)
    private String companyName;

    @Column(name = "bid_amount", precision = 18, scale = 2)
    private BigDecimal bidAmount;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "LKR";

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "SUBMITTED";

    @Column(name = "technical_score")
    private BigDecimal technicalScore;

    @Column(name = "financial_score")
    private BigDecimal financialScore;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
