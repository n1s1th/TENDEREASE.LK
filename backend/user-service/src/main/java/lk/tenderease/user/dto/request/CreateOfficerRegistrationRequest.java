package lk.tenderease.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for officer registration form submission.
 *
 * <p>Maps directly to the Officer Registration UI form. All fields marked
 * with * in the UI wireframe are validated as mandatory. Includes nested
 * address and liaison officer objects.</p>
 *
 * <p>Example payload:</p>
 * <pre>
 * {
 *   "procuringEntityType": "Government Department",
 *   "headDesignation": "Director",
 *   "address": {
 *     "country": "Sri Lanka",
 *     "streetLine1": "No 1 Main St",
 *     "city": "Colombo"
 *   },
 *   "officialEmail": "officer@gov.lk",
 *   "personalLandPhone": "0112345678",
 *   "liaisonOfficer": {
 *     "title": "Mr",
 *     "name": "John Doe",
 *     "nic": "123456789V",
 *     "mobile": "+94771234567",
 *     "email": "john@gov.lk"
 *   },
 *   "termsAccepted": true
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Officer registration form submission request")
public class CreateOfficerRegistrationRequest {

    // ──── Procuring Entity Info ────

    @NotBlank(message = "Procuring Entity Type is required")
    @Schema(description = "Type of procuring entity", example = "Government Department", requiredMode = Schema.RequiredMode.REQUIRED)
    private String procuringEntityType;

    @NotBlank(message = "Designation of the Head of the Procuring Entity is required")
    @Schema(description = "Head designation", example = "Director", requiredMode = Schema.RequiredMode.REQUIRED)
    private String headDesignation;

    @Schema(description = "Organization name", example = "Ministry of Finance")
    private String organizationName;

    @NotNull(message = "Address is required")
    @Valid
    @Schema(description = "Address details", requiredMode = Schema.RequiredMode.REQUIRED)
    private AddressDTO address;

    // ──── Contact Info ────

    @NotBlank(message = "Personal Land Phone is required")
    @Schema(description = "Personal land phone number", example = "0112345678", requiredMode = Schema.RequiredMode.REQUIRED)
    private String personalLandPhone;

    @NotBlank(message = "Official Email is required")
    @Email(message = "Official Email format is invalid")
    @Schema(description = "Official email address (must be unique)", example = "officer@gov.lk", requiredMode = Schema.RequiredMode.REQUIRED)
    private String officialEmail;

    // ──── Business Info (Optional) ────

    @Schema(description = "Business Registration Number (if applicable)", example = "BR-2026-001234")
    private String businessRegistrationNumber;

    @Schema(description = "VAT Registration Number (if applicable)", example = "VAT-2026-001234")
    private String vatRegistrationNumber;

    // ──── Liaison Officer ────

    @NotNull(message = "Liaison Officer details are required")
    @Valid
    @Schema(description = "Liaison Officer details", requiredMode = Schema.RequiredMode.REQUIRED)
    private LiaisonOfficerDTO liaisonOfficer;

    // ──── Terms ────

    @AssertTrue(message = "Terms and Conditions must be accepted")
    @Schema(description = "Terms and conditions acceptance", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    private Boolean termsAccepted;
}
