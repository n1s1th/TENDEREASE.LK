package lk.tenderease.evaluation.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EvaluationResponse {
    private UUID id;
    private UUID tenderId;
    private UUID bidId;
    private UUID evaluatorId;
    private String status;
    private Boolean isFlagged;
    private String complianceStatus;
    private BigDecimal totalScore;
    private String remarks;
    private LocalDateTime evaluatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
