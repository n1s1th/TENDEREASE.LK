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
@Schema(description = "Department reference data response")
public class DepartmentResponse {

    @Schema(description = "Unique department identifier", example = "1")
    private Long id;

    @Schema(description = "Name of the department", example = "Planning Division")
    private String name;

    @Schema(description = "ID of the parent ministry", example = "1")
    private Long ministryId;
}
