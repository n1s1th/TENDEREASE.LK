package lk.tenderease.tender.dto.response;

import lk.tenderease.tender.enums.TenderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderSummaryDTO {

    private UUID id;
    private String tenderNumber;
    private String title;
    private String departmentName;
    private BigDecimal estimatedBudget;
    private LocalDateTime closingDate;
    private TenderStatus status;
    private lk.tenderease.tender.enums.ProcurementType procurementType;

    // 🔥 UI IMPORTANT
    private long timeRemaining; // seconds
}