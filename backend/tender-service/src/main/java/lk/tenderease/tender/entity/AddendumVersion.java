package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "addendum_version", uniqueConstraints = {
        @UniqueConstraint(name = "uq_addendum_version", columnNames = {"addendum_id", "version_number"})
}, indexes = {
        @Index(name = "idx_addendum_version_addendum_id", columnList = "addendum_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddendumVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addendum_id", nullable = false)
    private TenderAmendment addendum;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "cloudinary_public_id", nullable = false, length = 500)
    private String cloudinaryPublicId;

    @Column(name = "cloudinary_url", nullable = false, length = 1000)
    private String cloudinaryUrl;

    @Column(name = "secure_url", nullable = false, length = 1000)
    private String secureUrl;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    @Column(name = "uploaded_by", length = 255)
    private String uploadedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
