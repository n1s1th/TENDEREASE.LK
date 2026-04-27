package lk.tenderease.tender.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTenderRequest {

    private String title;
    private String description;
    private String specialRequirements;
    private String projectOverview;
    private String scopeOfWork;
    private BigDecimal estimatedBudget;
    private LocalDateTime openingDate;
    private LocalDateTime closingDate;
    private String departmentName;
}