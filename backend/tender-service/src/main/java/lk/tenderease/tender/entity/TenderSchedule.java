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

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tender_schedule", indexes = {
    @Index(name = "idx_tender_schedule_tender_id", columnList = "tender_id", unique = true)
})
public class TenderSchedule extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id", nullable = false, unique = true)
    private Tender tender;

    @Column(name = "advertisement_start_date", nullable = false)
    private LocalDate advertisementStartDate;

    @Column(name = "bid_submission_deadline", nullable = false)
    private LocalDate bidSubmissionDeadline;

    @Column(name = "pre_bid_meeting_enabled", nullable = false)
    @Builder.Default
    private Boolean preBidMeetingEnabled = false;

    @Column(name = "pre_bid_meeting_date")
    private LocalDate preBidMeetingDate;

    @Column(name = "pre_bid_meeting_time")
    private LocalTime preBidMeetingTime;
}
