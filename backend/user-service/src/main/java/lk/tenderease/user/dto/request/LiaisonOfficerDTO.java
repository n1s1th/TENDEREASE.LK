package lk.tenderease.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the Liaison Officer section of the registration form.
 *
 * <p>All fields marked with * in the UI are mandatory. NIC must follow
 * Sri Lankan format (old: 9 digits + V/X, new: 12 digits).</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Liaison Officer details for officer registration")
public class LiaisonOfficerDTO {

    @NotBlank(message = "Title is required")
    @Schema(description = "Title (Mr/Ms/Mrs/Dr)", example = "Mr", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @NotBlank(message = "Procurement Liaison Officer Name is required")
    @Schema(description = "Full name of the liaison officer", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "Designation of the liaison officer", example = "Senior Procurement Officer")
    private String designation;

    @NotBlank(message = "NIC is required")
    @Pattern(
        regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$",
        message = "NIC format is invalid. Must be 9 digits followed by V/X or 12 digits"
    )
    @Schema(description = "National Identity Card number", example = "123456789V", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nic;

    @NotBlank(message = "Mobile phone with country code is required")
    @Pattern(
        regexp = "^\\+?[0-9]{10,15}$",
        message = "Mobile phone number format is invalid"
    )
    @Schema(description = "Mobile phone with country code", example = "+94771234567", requiredMode = Schema.RequiredMode.REQUIRED)
    private String mobile;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Schema(description = "Email address", example = "john@gov.lk", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}
