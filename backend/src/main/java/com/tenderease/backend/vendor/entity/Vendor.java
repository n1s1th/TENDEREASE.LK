package com.tenderease.backend.vendor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vendor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Organization Details
    @Column(nullable = false)
    private String businessRegistrationAuthority;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false, unique = true)
    private String businessRegistrationNo;

    @Column(nullable = false)
    private String typeOfOrganization;

    @Column(nullable = false)
    private String registeredAddress;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String province;

    @Column
    private String website;

    @Column(nullable = false)
    private String officialEmail;

    @Column(nullable = false)
    private String officialTelephone;

    // Authorized Officer Details
    @Column(nullable = false)
    private String nicPassport;

    @Column(nullable = false)
    private String officerName;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String mobilePhone;

    @Column(nullable = false)
    private String officerEmail;

    // Documents
    @Column(nullable = false)
    private String businessRegistrationDocumentPath;

    @ElementCollection
    @CollectionTable(name = "vendor_other_documents", joinColumns = @JoinColumn(name = "vendor_id"))
    @Column(name = "document_path")
    private List<String> otherDocumentPaths;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
