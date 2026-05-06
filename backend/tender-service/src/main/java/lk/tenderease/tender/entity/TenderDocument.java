package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.tender.enums.DocumentType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tender_document", indexes = {
        @Index(name = "idx_tender_document_tender_id", columnList = "tender_id")
})
public class TenderDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id", nullable = false)
    private Tender tender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sbd_template_id")
    private SbdTemplate sbdTemplate;

    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "s3_key", nullable = false, length = 1000)
    private String s3Key;

    // ✅ From LEFT (keep this)
    private Integer version;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "template_version", length = 20)
    private String templateVersion;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}