package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.enums.TenderType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Tender summary response")
public class TenderResponse {

    @Schema(description = "Unique tender identifier")
    private UUID id;

    @Schema(description = "Unique tender reference number", example = "NCB/2026/001")
    private String tenderNumber;

    @Schema(description = "Title of the tender")
    private String title;

    @Schema(description = "Detailed description of the tender")
    private String description;

    @Schema(description = "Type of procurement")
    private ProcurementType procurementType;

    @Schema(description = "Bidding method used")
    private BiddingMethod biddingMethod;

    @Schema(description = "Type of tender")
    private TenderType tenderType;

    @Schema(description = "ID of the procuring ministry")
    private Long ministryId;

    @Schema(description = "Name of the procuring ministry")
    private String ministryName;

    @Schema(description = "ID of the procuring department")
    private Long departmentId;

    @Schema(description = "Name of the procuring department")
    private String departmentName;

    @Schema(description = "Estimated budget in LKR")
    private BigDecimal estimatedBudget;

    @Schema(description = "ID of the funding source")
    private Long fundingSourceId;

    @Schema(description = "Name of the funding source")
    private String fundingSourceName;

    @Schema(description = "Current status of the tender")
    private TenderStatus status;

    @Schema(description = "Timestamp when the tender was created")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when the tender was last updated")
    private LocalDateTime updatedAt;

    @Schema(description = "ID/username of the user who created the tender")
    private String createdBy;

    @Schema(description = "Closing date for bid submission")
    private LocalDateTime closingDate;

    @Schema(description = "Time remaining in seconds until closing date")
    private Long timeRemaining;

    @Schema(description = "Reason for rejection if the tender was rejected")
    private String rejectionReason;

    @Schema(description = "SBD Template name")
    private String sbdTemplate;

    @Schema(description = "SBD Template version")
    private String templateVersion;

    @Schema(description = "Dynamic data JSON")
    private java.util.Map<String, Object> dynamicData;
}
