package lk.tenderease.officerdashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationSummaryResponse {
    private long unread;
    private long failedDeliveries;
    private long awardLettersGenerated;
    private String date;
}
