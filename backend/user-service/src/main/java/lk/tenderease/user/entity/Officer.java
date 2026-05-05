package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.user.enums.OfficerStatus;
import lombok.*;

/**
 * Main aggregate entity for Officer Registration.
 *
 * <p>Represents a procurement officer registering on the TenderEase platform.
 * Contains procuring entity information, contact details, business info,
 * and a reference to the associated {@link LiaisonOfficer}.</p>
 *
 * <p>Uses snake_case column names, indexed on frequently queried columns.</p>
 */
@Entity
@Table(name = "officers", indexes = {
    @Index(name = "idx_officer_email", columnList = "official_email", unique = true),
    @Index(name = "idx_officer_reference", columnList = "registration_reference", unique = true),
    @Index(name = "idx_officer_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Officer extends BaseEntity {

    // ──── Procuring Entity Info ────

    @Column(name = "procuring_entity_type", nullable = false)
    private String procuringEntityType;

    @Column(name = "head_designation", nullable = false)
    private String headDesignation;

    @Column(name = "organization_name")
    private String organizationName;

    @Embedded
    private Address address;

    // ──── Contact Info ────

    @Column(name = "personal_land_phone", nullable = false)
    private String personalLandPhone;

    @Column(name = "official_email", nullable = false, unique = true)
    private String officialEmail;

    // ──── Business Info ────

    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;

    @Column(name = "vat_registration_number")
    private String vatRegistrationNumber;

    // ──── System Fields ────

    @Column(name = "registration_reference", unique = true)
    private String registrationReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OfficerStatus status = OfficerStatus.PENDING;

    @Column(name = "keycloak_user_id")
    private String keycloakUserId;

    @Column(name = "terms_accepted")
    @Builder.Default
    private Boolean termsAccepted = false;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    // ──── Relationships ────

    @OneToOne(mappedBy = "officer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private LiaisonOfficer liaisonOfficer;

    /**
     * Convenience method to set the liaison officer and maintain the bidirectional relationship.
     *
     * @param liaisonOfficer the liaison officer to associate
     */
    public void setLiaisonOfficer(LiaisonOfficer liaisonOfficer) {
        this.liaisonOfficer = liaisonOfficer;
        if (liaisonOfficer != null) {
            liaisonOfficer.setOfficer(this);
        }
    }
}
