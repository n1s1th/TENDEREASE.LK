package lk.tenderease.user.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lk.tenderease.user.dto.request.AddressDTO;
import lk.tenderease.user.dto.request.LiaisonOfficerDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Comprehensive response DTO for officer profile details.
 * Used by admin endpoints for viewing, approving, and rejecting officers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full officer profile response for admin view")
public class OfficerProfileResponse {

    @Schema(description = "Officer UUID")
    private UUID officerId;

    @Schema(description = "Registration reference ID", example = "OFF-2026-000123")
    private String registrationReference;

    @Schema(description = "Registration status", example = "PENDING")
    private String status;

    // ──── Procuring Entity Info ────

    @Schema(description = "Type of procuring entity", example = "Government Department")
    private String procuringEntityType;

    @Schema(description = "Head designation", example = "Director")
    private String headDesignation;

    @Schema(description = "Organization name", example = "Ministry of Finance")
    private String organizationName;

    @Schema(description = "Address details")
    private AddressDTO address;

    // ──── Contact Info ────

    @Schema(description = "Personal land phone", example = "0112345678")
    private String personalLandPhone;

    @Schema(description = "Official email", example = "officer@gov.lk")
    private String officialEmail;

    // ──── Business Info ────

    @Schema(description = "Business registration number")
    private String businessRegistrationNumber;

    @Schema(description = "VAT registration number")
    private String vatRegistrationNumber;

    // ──── Liaison Officer ────

    @Schema(description = "Liaison officer details")
    private LiaisonOfficerDTO liaisonOfficer;

    // ──── System Fields ────

    @Schema(description = "Terms accepted flag")
    private Boolean termsAccepted;

    @Schema(description = "Keycloak user ID")
    private String keycloakUserId;

    @Schema(description = "Rejection reason (if rejected)")
    private String rejectionReason;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
