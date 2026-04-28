package lk.tenderease.officerdashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DashboardNotificationResponse {
    private UUID id;
    private UUID tenderId;
    private String tenderTitle;
    private String tenderNumber;
    private String title;
    private String message;
    private String type;
    private String status;
    private String questionPreview;
    private String actionUrl;
    private String time;
    private String performedBy;
    private boolean read;
    private Long clarificationId;
}
