package lk.tenderease.tender.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating a new tender addendum")
public class CreateAddendumRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Title of the addendum", example = "Addendum 1 - Clarification on Scope")
    private String title;

    @Schema(description = "Detailed description of the amendment/addendum")
    private String description;

    @Schema(description = "New closing date if this addendum extends the submission deadline")
    private LocalDateTime newClosingDate;

    @Schema(description = "Description of changes for version 1")
    private String changeDescription;
}
