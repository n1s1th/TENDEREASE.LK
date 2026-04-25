package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tender_clarification")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderClarification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String question;

    private Long askedBy;

    private String bidderEmail;

    private LocalDateTime askedAt;

    private Boolean isPublic;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}
