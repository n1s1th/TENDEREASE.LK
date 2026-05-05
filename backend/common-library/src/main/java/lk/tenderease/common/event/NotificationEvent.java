package lk.tenderease.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String recipient;
    private String recipientUserId;
    private String type;
    private String subject;
    private String message;
    private UUID tenderId;
    private String tenderNumber;
    private String tenderTitle;
    private Long clarificationId;
    private String questionPreview;
    private String actionUrl;
    private LocalDateTime createdAt;
}
