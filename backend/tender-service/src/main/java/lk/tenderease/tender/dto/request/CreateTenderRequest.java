package lk.tenderease.tender.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lk.tenderease.tender.enums.BiddingMethod;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Request payload for creating or updating a tender")
public class CreateTenderRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    @Schema(description = "Title of the tender", example = "Construction of District Hospital")
    private String title;

    @NotBlank(message = "Tender number is required")
    @Size(max = 50, message = "Tender number must not exceed 50 characters")
    @Schema(description = "Unique tender reference number", example = "NCB/2026/001")
    @JsonAlias("referenceNumber")
    private String tenderNumber;

    @NotNull(message = "Procurement type is required")
    @Schema(description = "Type of procurement", example = "WORKS")
    private ProcurementType procurementType;

    @NotNull(message = "Bidding method is required")
    @Schema(description = "Bidding method to be used", example = "NCB")
    private BiddingMethod biddingMethod;

    @NotNull(message = "Tender type is required")
    @Schema(description = "Type of tender", example = "OPEN_TENDER")
    private TenderType tenderType;

    @NotNull(message = "Ministry ID is required")
    @Schema(description = "ID of the procuring ministry", example = "1")
    private Long ministryId;

    @NotNull(message = "Department ID is required")
    @Schema(description = "ID of the procuring department", example = "1")
    @JsonAlias("departmentAgencyId")
    private Long departmentId;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    @Schema(description = "Detailed description of the tender")
    private String description;

    @NotNull(message = "Estimated budget is required")
    @Positive(message = "Estimated budget must be greater than 0")
    @Schema(description = "Estimated budget amount in LKR", example = "50000000.00")
    private BigDecimal estimatedBudget;

    @Schema(description = "ID of the funding source (optional)", example = "1")
    @JsonAlias("fundingSource")
    private Long fundingSourceId;
}
