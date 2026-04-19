package lk.tenderease.tender.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderScheduleResponse {
    private LocalDateTime publicationDate;
    private LocalDateTime documentIssueStart;
    private LocalDateTime documentIssueEnd;
    private LocalDateTime preBidMeetingDate;
    private LocalDateTime bidSubmissionDeadline;
    private LocalDateTime bidOpeningDate;
}
