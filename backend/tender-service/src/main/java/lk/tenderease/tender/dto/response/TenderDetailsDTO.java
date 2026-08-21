package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderDetailsDTO {

    private UUID id;
    private String tenderNumber;
    private String title;
    private String description;
    private String specialRequirements;
    private String projectOverview;
    private String scopeOfWork;

    private BigDecimal estimatedBudget;

    // Ministry / Department
    private Long ministryId;
    private String ministryName;
    private Long departmentId;
    private String departmentName;

    // Funding
    private Long fundingSourceId;
    private String fundingSourceName;

    // Classification
    private String procurementType;
    private BiddingMethod biddingMethod;
    private TenderType tenderType;

    private TenderStatus status;
    private java.util.Map<String, Object> dynamicData;

    private LocalDateTime openingDate;
    private LocalDateTime closingDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 🔥 UI
    private long timeRemaining;

    // 🔥 TABS
    private List<TenderDocumentDTO> documents;
    private List<TenderAmendmentDTO> addenda;
    private List<ClarificationDTO> clarifications;
    private List<TimelineDTO> timeline;
    private List<ContactDTO> contacts;
}