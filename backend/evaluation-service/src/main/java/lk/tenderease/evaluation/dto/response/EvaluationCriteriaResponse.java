package lk.tenderease.evaluation.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class EvaluationCriteriaResponse {
    private UUID id;
    private UUID tenderId;
    private String name;
    private String description;
    private BigDecimal weight;
}
