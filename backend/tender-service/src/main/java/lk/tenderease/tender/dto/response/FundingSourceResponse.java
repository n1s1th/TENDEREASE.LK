package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Funding source reference data response")
public class FundingSourceResponse {

    @Schema(description = "Unique funding source identifier", example = "1")
    private Long id;

    @Schema(description = "Name of the funding source", example = "Government Treasury")
    private String name;

    @Schema(description = "Type of funding source", example = "GOVERNMENT")
    private String sourceType;
}
