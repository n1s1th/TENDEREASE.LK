package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {
    private long active;
    private long bids;
    private long evaluating;
    private long awarded;
    private long noBids;
    private long completed;
}
