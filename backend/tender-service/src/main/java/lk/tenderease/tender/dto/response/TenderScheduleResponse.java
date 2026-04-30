package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Tender schedule response with key dates")
public class TenderScheduleResponse {

    @Schema(description = "Unique schedule identifier")
    private UUID id;

    @Schema(description = "ID of the parent tender")
    private UUID tenderId;

    @Schema(description = "Date when the tender advertisement begins")
    private LocalDate advertisementStartDate;

    @Schema(description = "Deadline for bid submissions")
    private LocalDate bidSubmissionDeadline;

    @Schema(description = "Whether a pre-bid meeting is scheduled")
    private Boolean preBidMeetingEnabled;

    @Schema(description = "Date of the pre-bid meeting")
    private LocalDate preBidMeetingDate;

    @Schema(description = "Time of the pre-bid meeting")
    private LocalTime preBidMeetingTime;
}
