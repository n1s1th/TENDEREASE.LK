package lk.tenderease.tender.dto.request;

import jakarta.validation.constraints.*;
import lk.tenderease.tender.enums.ProcurementMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTenderRequest {

    @NotBlank
    private String title;

    private String description;

    private String specialRequirements;

    private String projectOverview;

    private String scopeOfWork;

    @NotNull
    private ProcurementMethod procurementMethod;

    @NotNull
    @Positive
    private BigDecimal estimatedBudget;

    @NotNull
    private LocalDateTime openingDate;

    @NotNull
    private LocalDateTime closingDate;

    @NotBlank
    private String departmentName;
}