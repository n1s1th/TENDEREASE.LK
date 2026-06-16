package lk.tenderease.evaluation.dto.response;

import lk.tenderease.common.constant.OpeningStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OpeningSessionResponse {
    private UUID id;
    private UUID tenderId;
    private LocalDateTime scheduledOpeningTime;
    private LocalDateTime actualOpeningTime;
    private LocalDateTime bidSubmissionDeadline;
    private OpeningStatus status;
    private String openedBy;
    private int attendanceCount;
}
