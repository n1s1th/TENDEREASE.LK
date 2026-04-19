package lk.tenderease.tender.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for updating the compliance checklist")
public class ComplianceChecklistRequest {

    @NotNull(message = "Procurement plan approved flag is required")
    @Schema(description = "Whether the procurement plan has been approved", example = "true")
    private Boolean procurementPlanApproved;

    @NotNull(message = "Budget availability confirmed flag is required")
    @Schema(description = "Whether budget availability has been confirmed", example = "true")
    private Boolean budgetAvailabilityConfirmed;

    @NotNull(message = "SBDs compliant with guidelines flag is required")
    @Schema(description = "Whether SBDs are compliant with government guidelines", example = "true")
    private Boolean sbdsCompliantWithGuidelines;

    @NotNull(message = "Evaluation criteria defined flag is required")
    @Schema(description = "Whether evaluation criteria have been defined", example = "true")
    private Boolean evaluationCriteriaDefined;
}
