package lk.tenderease.evaluation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class EvaluationScoreRequest {
    @NotNull(message = "Criteria ID is required")
    private UUID criteriaId;

    @NotNull(message = "Score is required")
    private BigDecimal score;

    private String comment;
}
