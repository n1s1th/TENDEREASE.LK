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
@Schema(description = "Ministry reference data response")
public class MinistryResponse {

    @Schema(description = "Unique ministry identifier", example = "1")
    private Long id;

    @Schema(description = "Name of the ministry", example = "Ministry of Health")
    private String name;

    @Schema(description = "Short code for the ministry", example = "MOH")
    private String code;
}
