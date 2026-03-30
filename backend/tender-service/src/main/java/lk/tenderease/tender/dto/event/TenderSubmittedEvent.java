package lk.tenderease.tender.dto.event;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Event published when a tender is submitted for approval")
public class TenderSubmittedEvent {

    @Schema(description = "ID of the submitted tender")
    private UUID tenderId;

    @Schema(description = "Unique tender reference number")
    private String tenderNumber;

    @Schema(description = "Title of the tender")
    private String title;

    @Schema(description = "User who submitted the tender")
    private String submittedBy;

    @Schema(description = "Timestamp of submission")
    private LocalDateTime submittedAt;
}
