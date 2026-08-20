package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.tender.enums.TimelineEventType;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tender_timeline")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TimelineEventType eventType;

    private String description;

    private LocalDateTime timestamp;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "creator_role")
    private String creatorRole;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}