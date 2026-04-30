package lk.tenderease.evaluation.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetricsResponse {
    private long activeTenders;
    private long totalBids;
    private long underEvaluation;
    private long awardedProposals;
    private long noBidTenders;
}
