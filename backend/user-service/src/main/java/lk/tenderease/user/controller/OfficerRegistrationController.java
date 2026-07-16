package lk.tenderease.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.request.CreateOfficerRegistrationRequest;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationFailureResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationSuccessResponse;
import lk.tenderease.user.enums.OfficerStatus;
import lk.tenderease.user.service.OfficerRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Officer Registration operations.
 *
 * <p><strong>Public Endpoints:</strong></p>
 * <ul>
 *   <li>{@code POST /api/officers/register} – Submit officer registration form</li>
 * </ul>
 *
 * <p><strong>Admin Endpoints (ROLE_ADMIN):</strong></p>
 * <ul>
 *   <li>{@code GET /api/officers} – List all officers with pagination</li>
 *   <li>{@code GET /api/officers/{id}} – Get officer by UUID</li>
 *   <li>{@code GET /api/officers/reference/{referenceId}} – Get officer by reference ID</li>
 *   <li>{@code POST /api/officers/{id}/approve} – Approve officer registration</li>
 *   <li>{@code POST /api/officers/{id}/reject} – Reject officer registration</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/api/officers")
@RequiredArgsConstructor
@Tag(name = "Officer Registration", description = "APIs for officer registration and management")
public class OfficerRegistrationController {

    private final OfficerRegistrationService officerRegistrationService;

    // ────────────────────────────────────────────────────────
    //  PUBLIC ENDPOINTS
    // ────────────────────────────────────────────────────────

    /**
     * Submit a new officer registration.
     * This is a PUBLIC endpoint — no authentication required.
     *
     * @param request the registration form data
     * @return success response with registration reference ID
     */
    @PostMapping("/register")
    @Operation(
        summary = "Submit officer registration",
        description = "Public endpoint for submitting a new officer registration form. " +
                      "Returns a reference ID on success or a list of validation errors on failure."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Registration successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OfficerRegistrationSuccessResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "success": true,
                      "message": "Registration successful",
                      "data": {
                        "referenceId": "OFF-2026-000123"
                      }
                    }
                    """)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Registration failed due to validation errors",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OfficerRegistrationFailureResponse.class),
                examples = @ExampleObject(value = """
                    {
                      "success": false,
                      "message": "Registration failed",
                      "errorCode": "VALIDATION_ERROR",
                      "errors": [
                        "Email already registered",
                        "NIC format incorrect"
                      ],
                      "supportId": "ERR-REG-2026-000456"
                    }
                    """)
            )
        )
    })
    public ResponseEntity<OfficerRegistrationSuccessResponse> registerOfficer(
            @Valid @RequestBody CreateOfficerRegistrationRequest request) {
        log.info("Received officer registration request for email: {}", request.getOfficialEmail());
        final OfficerRegistrationSuccessResponse response = officerRegistrationService.registerOfficer(request);
        log.info("Officer registration successful [referenceId={}]",
                response.getData().getReferenceId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ────────────────────────────────────────────────────────
    //  ADMIN ENDPOINTS
    // ────────────────────────────────────────────────────────

    /**
     * List all officers with pagination and optional status filter.
     * Requires ROLE_ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all officers (Admin)", description = "Paginated list of officers with optional status filter")
    @ApiResponse(responseCode = "200", description = "Officers retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    public ResponseEntity<PageResponse<OfficerProfileResponse>> listOfficers(
            @Parameter(description = "Filter by status") @RequestParam(required = false) OfficerStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Admin listing officers [status={}, page={}]", status, pageable.getPageNumber());
        return ResponseEntity.ok(officerRegistrationService.listOfficers(status, pageable));
    }

    /**
     * Get officer profile by UUID.
     * Requires ROLE_ADMIN.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get officer by ID (Admin)", description = "Retrieve officer profile by UUID")
    @ApiResponse(responseCode = "200", description = "Officer retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Officer not found")
    public ResponseEntity<OfficerProfileResponse> getOfficerById(
            @Parameter(description = "Officer UUID") @PathVariable UUID id) {
        log.debug("Admin fetching officer by ID: {}", id);
        return ResponseEntity.ok(officerRegistrationService.getOfficerById(id));
    }

    /**
     * Get officer profile by registration reference ID.
     * Requires ROLE_ADMIN.
     */
    @GetMapping("/reference/{referenceId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get officer by reference ID (Admin)", description = "Retrieve officer profile by registration reference")
    @ApiResponse(responseCode = "200", description = "Officer retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Officer not found")
    public ResponseEntity<OfficerProfileResponse> getOfficerByReference(
            @Parameter(description = "Registration Reference ID", example = "OFF-2026-000123")
            @PathVariable String referenceId) {
        log.debug("Admin fetching officer by reference: {}", referenceId);
        return ResponseEntity.ok(officerRegistrationService.getOfficerByReference(referenceId));
    }

    /**
     * Get officer profile by email.
     */
    @GetMapping("/email/{email}")
    @Operation(summary = "Get officer by email", description = "Retrieve officer profile by email")
    @ApiResponse(responseCode = "200", description = "Officer retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Officer not found")
    public ResponseEntity<OfficerProfileResponse> getOfficerByEmail(@PathVariable String email) {
        log.debug("Fetching officer by email: {}", email);
        return ResponseEntity.ok(officerRegistrationService.getOfficerByEmail(email));
    }

    /**
     * Approve an officer registration.
     * Requires ROLE_ADMIN.
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve officer registration (Admin)", description = "Approve a pending officer registration")
    @ApiResponse(responseCode = "200", description = "Officer approved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @ApiResponse(responseCode = "404", description = "Officer not found")
    public ResponseEntity<OfficerProfileResponse> approveOfficer(
            @Parameter(description = "Officer UUID") @PathVariable UUID id) {
        log.info("Admin approving officer: {}", id);
        return ResponseEntity.ok(officerRegistrationService.approveOfficer(id));
    }

    /**
     * Reject an officer registration with a reason.
     * Requires ROLE_ADMIN.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject officer registration (Admin)", description = "Reject a pending officer registration with reason")
    @ApiResponse(responseCode = "200", description = "Officer rejected successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @ApiResponse(responseCode = "404", description = "Officer not found")
    public ResponseEntity<OfficerProfileResponse> rejectOfficer(
            @Parameter(description = "Officer UUID") @PathVariable UUID id,
            @Parameter(description = "Rejection reason", required = true)
            @RequestParam String reason) {
        log.info("Admin rejecting officer: {} with reason: {}", id, reason);
        return ResponseEntity.ok(officerRegistrationService.rejectOfficer(id, reason));
    }
}
