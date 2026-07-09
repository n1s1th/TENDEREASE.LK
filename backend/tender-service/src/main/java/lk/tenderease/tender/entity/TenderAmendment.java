package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tender_amendment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer amendmentNumber;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Human-readable note about what changed (e.g., "Closing date extended") */
    @Column(name = "change_note", columnDefinition = "TEXT")
    private String changeNote;

    private Integer version;

    private LocalDateTime previousClosingDate;
    private LocalDateTime newClosingDate;

    private LocalDateTime createdAt;

    /** Optional: the new TenderDocument version uploaded with this amendment */
    @Column(name = "document_id")
    private UUID documentId;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}