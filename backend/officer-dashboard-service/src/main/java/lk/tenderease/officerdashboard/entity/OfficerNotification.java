package lk.tenderease.officerdashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "officer_notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerNotification {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "recipient", nullable = false)
    private String recipient;

    @Column(name = "recipient_user_id")
    private String recipientUserId;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "tender_id")
    private UUID tenderId;

    @Column(name = "tender_number")
    private String tenderNumber;

    @Column(name = "tender_title")
    private String tenderTitle;

    @Column(name = "clarification_id")
    private Long clarificationId;

    @Column(name = "question_preview", length = 500)
    private String questionPreview;

    @Column(name = "action_url")
    private String actionUrl;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "read", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
