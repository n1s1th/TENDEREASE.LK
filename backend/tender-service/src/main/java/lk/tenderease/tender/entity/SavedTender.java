package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A tender bookmarked by a user.
 *
 * <p>The tender is referenced by id rather than by association so that a saved row
 * never blocks or cascades into tender lifecycle changes; a bookmark pointing at a
 * removed tender is simply skipped when the list is read.
 */
@Entity
@Table(
        name = "saved_tender",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_saved_tender_user_tender",
                columnNames = {"user_id", "tender_id"}),
        indexes = @Index(name = "idx_saved_tender_user_id", columnList = "user_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedTender {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /** Keycloak subject of the owner (falls back to the caller's email in dev). */
    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "tender_id", nullable = false)
    private UUID tenderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
