package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendor_authorized_officers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAuthorizedOfficer {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_profile_id", nullable = false)
    private VendorProfile vendorProfile;

    @Column(nullable = false)
    private String nicOrPassportNo;

    @Column(nullable = false)
    private String name;

    private String designation;
    private String mobilePhone;
    private String email;
    @Column(nullable = false)
    private String password;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
