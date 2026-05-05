package lk.tenderease.user.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a successful officer registration.
 *
 * <p>Returned when the registration is completed successfully.
 * Maps to the "You are Successfully Registered!" success page
 * shown in the UI wireframe.</p>
 *
 * <p>Example response:</p>
 * <pre>
 * {
 *   "success": true,
 *   "message": "Registration successful",
 *   "data": {
 *     "referenceId": "OFF-2026-000123"
 *   }
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Successful officer registration response")
public class OfficerRegistrationSuccessResponse {

    @Builder.Default
    @Schema(description = "Success indicator", example = "true")
    private boolean success = true;

    @Schema(description = "Success message", example = "Registration successful")
    private String message;

    @Schema(description = "Response data containing the reference ID")
    private RegistrationData data;

    /**
     * Inner class containing the registration reference ID.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Registration data")
    public static class RegistrationData {

        @JsonProperty("referenceId")
        @Schema(description = "Registration Reference ID", example = "OFF-2026-000123")
        private String referenceId;
    }
}
