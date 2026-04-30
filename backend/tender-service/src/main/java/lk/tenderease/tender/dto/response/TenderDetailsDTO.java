package lk.tenderease.tender.dto.response;

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
    private String departmentName;

    private LocalDateTime openingDate;
    private LocalDateTime closingDate;

    // 🔥 UI
    private long timeRemaining;

    // 🔥 TABS
    private List<TenderDocumentDTO> documents;
    private List<TenderAmendmentDTO> addenda;
    private List<ClarificationDTO> clarifications;
    private List<TimelineDTO> timeline;
    private List<ContactDTO> contacts;
}