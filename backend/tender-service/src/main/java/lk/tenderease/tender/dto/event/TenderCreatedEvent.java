package lk.tenderease.tender.dto.event;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Event published when a new tender is created as DRAFT")
public class TenderCreatedEvent {

    @Schema(description = "ID of the created tender")
    private UUID tenderId;

    @Schema(description = "Unique tender reference number")
    private String tenderNumber;

    @Schema(description = "Title of the tender")
    private String title;

    @Schema(description = "Type of procurement")
    private ProcurementType procurementType;

    @Schema(description = "Bidding method used")
    private BiddingMethod biddingMethod;

    @Schema(description = "ID of the procuring ministry")
    private Long ministryId;

    @Schema(description = "ID of the procuring department")
    private Long departmentId;

    @Schema(description = "Estimated budget in LKR")
    private BigDecimal estimatedBudget;

    @Schema(description = "Status of the tender")
    private TenderStatus status;

    @Schema(description = "User who created the tender")
    private String createdBy;

    @Schema(description = "Timestamp of creation")
    private LocalDateTime createdAt;
}
