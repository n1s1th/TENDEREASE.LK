package lk.tenderease.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the address section of the officer registration form.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Address details for officer registration")
public class AddressDTO {

    @NotBlank(message = "Country is required")
    @Schema(description = "Country", example = "Sri Lanka", requiredMode = Schema.RequiredMode.REQUIRED)
    private String country;

    @Schema(description = "Street address line 1", example = "No 1 Main St")
    private String streetLine1;

    @Schema(description = "Street address line 2", example = "Apt 4B")
    private String streetLine2;

    @Schema(description = "City", example = "Colombo")
    private String city;

    @Schema(description = "Province", example = "Western")
    private String province;

    @Schema(description = "Postal code", example = "00100")
    private String postalCode;
}
