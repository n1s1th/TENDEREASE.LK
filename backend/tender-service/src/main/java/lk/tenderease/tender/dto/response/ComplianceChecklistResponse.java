package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Compliance checklist response")
public class ComplianceChecklistResponse {

    @Schema(description = "Unique checklist identifier")
    private UUID id;

    @Schema(description = "ID of the parent tender")
    private UUID tenderId;

    @Schema(description = "Whether the procurement plan has been approved")
    private Boolean procurementPlanApproved;

    @Schema(description = "Whether budget availability has been confirmed")
    private Boolean budgetAvailabilityConfirmed;

    @Schema(description = "Whether SBDs are compliant with government guidelines")
    private Boolean sbdsCompliantWithGuidelines;

    @Schema(description = "Whether evaluation criteria have been defined")
    private Boolean evaluationCriteriaDefined;

    @Schema(description = "Derived field: true if all 4 checklist items are true")
    private Boolean allComplete;
}
