package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lk.tenderease.user.enums.OrganizationType;
import lk.tenderease.user.enums.VendorStatus;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vendor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"authorizedOfficer", "documents"})
@EqualsAndHashCode(exclude = {"authorizedOfficer", "documents"})
public class VendorProfile {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String businessName;

    private String registrationAuthority;

    @Column(nullable = false, unique = true)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    private OrganizationType organizationType;

    private String country;
    private String registrationAddress;
    private String city;
    private String province;
    private String website;

    @Column(nullable = false, unique = true)
    private String officialEmail;

    private String officialTelephone;
    private String cidaGrade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING_REVIEW;

    @Builder.Default
    private Boolean drcVerified = false;
    
    private String drcCompanyName;
    private LocalDate drcIncorporationDate;

    @OneToOne(mappedBy = "vendorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private VendorAuthorizedOfficer authorizedOfficer;

    @OneToMany(mappedBy = "vendorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VendorDocument> documents = new ArrayList<>();

    @Builder.Default
    private Boolean termsAccepted = false;
    
    private LocalDateTime termsAcceptedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;

    @ElementCollection
    @CollectionTable(name = "vendor_departments", joinColumns = @JoinColumn(name = "vendor_id"))
    @Column(name = "department_name")
    @Builder.Default
    private List<String> departments = new java.util.ArrayList<>();
}
