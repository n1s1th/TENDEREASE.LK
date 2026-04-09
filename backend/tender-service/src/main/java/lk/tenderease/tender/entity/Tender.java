package lk.tenderease.tender.entity;

import jakarta.persistence.*;
import lk.tenderease.common.entity.BaseEntity;
import lk.tenderease.tender.enums.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tenders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tender extends BaseEntity {

    @Column(name = "tender_number", unique = true, nullable = false)
    private String tenderNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(name = "project_overview", columnDefinition = "TEXT")
    private String projectOverview;

    @Column(name = "scope_of_work", columnDefinition = "TEXT")
    private String scopeOfWork;

    @Enumerated(EnumType.STRING)
    private ProcurementMethod procurementMethod;

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "tender_status")
    private TenderStatus status;
    @Column(name = "estimated_budget")
    private BigDecimal estimatedBudget;

    @Column(name = "opening_date")
    private LocalDateTime openingDate;

    @Column(name = "closing_date")
    private LocalDateTime closingDate;

    @Column(name = "department_name")
    private String departmentName;

    @Column(name = "procuring_entity_id")
    private Long procuringEntityId;

    // 🔗 Relationships
    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderDocument> documents;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderAmendment> amendments;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderClarification> clarifications;

    @OneToMany(mappedBy = "tender", cascade = CascadeType.ALL)
    private List<TenderTimeline> timelineEvents;
}