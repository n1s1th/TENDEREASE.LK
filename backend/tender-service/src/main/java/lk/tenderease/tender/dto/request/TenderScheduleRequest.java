package lk.tenderease.tender.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for saving/updating the tender schedule")
public class TenderScheduleRequest {

    @NotNull(message = "Advertisement start date is required")
    @Schema(description = "Date when the tender advertisement begins", example = "2026-04-01")
    private LocalDate advertisementStartDate;

    @NotNull(message = "Bid submission deadline is required")
    @Schema(description = "Deadline for bid submissions", example = "2026-05-01")
    private LocalDate bidSubmissionDeadline;

    @NotNull(message = "Pre-bid meeting enabled flag is required")
    @Schema(description = "Whether a pre-bid meeting is scheduled", example = "true")
    private Boolean preBidMeetingEnabled;

    @Schema(description = "Date of the pre-bid meeting (required if preBidMeetingEnabled is true)", example = "2026-04-15")
    private LocalDate preBidMeetingDate;

    @Schema(description = "Time of the pre-bid meeting (required if preBidMeetingEnabled is true)", example = "10:00:00")
    private LocalTime preBidMeetingTime;
}
