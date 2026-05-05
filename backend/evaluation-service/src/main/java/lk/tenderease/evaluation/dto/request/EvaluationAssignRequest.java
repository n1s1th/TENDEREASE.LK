package lk.tenderease.evaluation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class EvaluationAssignRequest {
    @NotNull(message = "Evaluator ID is required")
    private UUID evaluatorId;
    
    @NotNull(message = "Bid ID is required")
    private UUID bidId;
}
