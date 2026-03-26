package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.tender.enums.DocumentType;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tender_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String documentName;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String s3Key;

    private Integer version;

    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}