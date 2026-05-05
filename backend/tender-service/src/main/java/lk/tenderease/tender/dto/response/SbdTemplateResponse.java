package lk.tenderease.tender.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.tender.enums.ProcurementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Standard Bidding Document template response")
public class SbdTemplateResponse {

    @Schema(description = "Unique SBD template identifier", example = "1")
    private Long id;

    @Schema(description = "Name of the SBD template")
    private String name;

    @Schema(description = "Procurement type this template applies to")
    private ProcurementType procurementType;

    @Schema(description = "Version of the template", example = "1.0")
    private String version;
}
