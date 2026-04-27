package lk.tenderease.user.entity;

import jakarta.persistence.*;
import lk.tenderease.user.enums.VendorDocumentType;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendor_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDocument {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_profile_id", nullable = false)
    private VendorProfile vendorProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorDocumentType documentType;

    private String documentTitle;

    @Column(nullable = false)
    private String filePath;

    private String originalFileName;
    private Long fileSizeBytes;
    private String mimeType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
