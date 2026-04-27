package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.tender.enums.BiddingMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Auto-generated tender notice preview (Invitation for Bids)")
public class TenderNoticePreviewResponse {

    @Schema(description = "ID of the tender")
    private UUID tenderId;

    @Schema(description = "Tender reference number")
    private String tenderNumber;

    @Schema(description = "Title of the tender")
    private String title;

    @Schema(description = "Bidding method used")
    private BiddingMethod biddingMethod;

    @Schema(description = "Deadline for bid submissions")
    private LocalDate bidSubmissionDeadline;

    @Schema(description = "Formatted notice body text (Invitation for Bids)")
    private String generatedText;
}
