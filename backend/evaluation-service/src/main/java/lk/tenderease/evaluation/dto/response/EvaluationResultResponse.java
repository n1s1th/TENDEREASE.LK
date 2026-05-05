package lk.tenderease.evaluation.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EvaluationResultResponse {
    private UUID id;
    private UUID tenderId;
    private UUID winningBidId;
    private BigDecimal finalScore;
    private LocalDateTime approvedAt;
    private String status;
}
