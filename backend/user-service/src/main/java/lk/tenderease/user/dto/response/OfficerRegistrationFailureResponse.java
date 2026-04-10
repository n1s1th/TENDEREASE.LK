package lk.tenderease.user.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for a failed officer registration.
 *
 * <p>Returned when the registration cannot be completed due to
 * validation errors or business rule violations. Maps to the
 * "Registration Unsuccessful" failure page shown in the UI wireframe.</p>
 *
 * <p>Example response:</p>
 * <pre>
 * {
 *   "success": false,
 *   "message": "Registration failed",
 *   "errorCode": "VALIDATION_ERROR",
 *   "errors": [
 *     "Email already registered",
 *     "NIC format invalid"
 *   ],
 *   "supportId": "ERR-REG-2026-000456"
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Failed officer registration response")
public class OfficerRegistrationFailureResponse {

    @Builder.Default
    @Schema(description = "Success indicator", example = "false")
    private boolean success = false;

    @Schema(description = "Failure message", example = "Registration failed")
    private String message;

    @Schema(description = "Error code for client handling", example = "VALIDATION_ERROR")
    private String errorCode;

    @Schema(description = "List of validation/business error messages")
    private List<String> errors;

    @Schema(description = "Support Reference ID for troubleshooting", example = "ERR-REG-2026-000456")
    private String supportId;
}
