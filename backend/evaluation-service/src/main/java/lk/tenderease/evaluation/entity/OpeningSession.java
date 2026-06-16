package lk.tenderease.evaluation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lk.tenderease.common.constant.OpeningStatus;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "opening_session")
@Getter
@Setter
public class OpeningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tender_id", nullable = false)
    private UUID tenderId;

    @Column(name = "scheduled_opening_time", nullable = false)
    private LocalDateTime scheduledOpeningTime;

    @Column(name = "actual_opening_time")
    private LocalDateTime actualOpeningTime;

    @Column(name = "bid_submission_deadline")
    private LocalDateTime bidSubmissionDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OpeningStatus status = OpeningStatus.SCHEDULED;

    @Column(name = "opened_by")
    private String openedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
