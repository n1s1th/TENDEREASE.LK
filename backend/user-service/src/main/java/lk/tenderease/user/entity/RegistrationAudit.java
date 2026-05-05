package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lombok.*;

/**
 * Audit trail entity for officer registration events.
 *
 * <p>Records every significant event during the registration lifecycle,
 * including successful registrations, validation failures, approvals,
 * and rejections. Used for troubleshooting and compliance.</p>
 */
@Entity
@Table(name = "registration_audits", indexes = {
    @Index(name = "idx_audit_reference_id", columnList = "reference_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationAudit extends BaseEntity {

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "support_id")
    private String supportId;

    @Column(name = "action", nullable = false)
    private String action;
}
