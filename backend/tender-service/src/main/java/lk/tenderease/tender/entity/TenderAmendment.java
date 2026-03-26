package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tender_amendments")
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

    private Integer version;

    private LocalDateTime previousClosingDate;
    private LocalDateTime newClosingDate;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "tender_id")
    private Tender tender;
}