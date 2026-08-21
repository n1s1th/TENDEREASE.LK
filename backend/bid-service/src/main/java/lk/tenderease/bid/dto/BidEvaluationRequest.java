package lk.tenderease.bid.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidEvaluationRequest {
    private BigDecimal technicalScore;
    private BigDecimal financialScore;
    private String status; // e.g. COMPLIANT, NON_COMPLIANT, FLAGGED, EVALUATED
    private String notes;
}
