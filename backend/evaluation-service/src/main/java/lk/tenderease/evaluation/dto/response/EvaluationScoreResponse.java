package lk.tenderease.evaluation.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class EvaluationScoreResponse {
    private UUID id;
    private UUID evaluationId;
    private EvaluationCriteriaResponse criteria;
    private BigDecimal score;
    private String comment;
}
