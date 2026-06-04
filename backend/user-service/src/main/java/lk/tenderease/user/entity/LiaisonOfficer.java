package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lombok.*;

/**
 * Entity representing the Liaison Officer associated with an {@link Officer} registration.
 *
 * <p>Each officer registration must have one liaison officer. A single Liaison Officer
 * can be associated with multiple officer registrations.</p>
 */
@Entity
@Table(name = "liaison_officers", indexes = {
    @Index(name = "idx_liaison_nic", columnList = "nic", unique = true),
    @Index(name = "idx_liaison_email", columnList = "email", unique = true),
    @Index(name = "idx_liaison_officer_id", columnList = "officer_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiaisonOfficer extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "designation")
    private String designation;

    @Column(name = "nic", nullable = false, unique = true)
    private String nic;

    @Column(name = "mobile", nullable = false)
    private String mobile;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private Officer officer;
}
