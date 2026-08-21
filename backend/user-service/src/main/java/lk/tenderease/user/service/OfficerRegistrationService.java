package lk.tenderease.user.service;

import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.request.CreateOfficerRegistrationRequest;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.dto.response.OfficerRegistrationSuccessResponse;
import lk.tenderease.user.enums.OfficerStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface defining the contract for officer registration operations.
 *
 * <p>Covers the full registration lifecycle: submit, view, approve, reject.</p>
 */
public interface OfficerRegistrationService {

    /**
     * Register a new officer. This is a PUBLIC operation.
     * Validates input, generates reference ID, saves officer as PENDING,
     * publishes OfficerRegistered event, and sends confirmation email.
     *
     * @param request the registration form data
     * @return success response with registration reference ID
     */
    OfficerRegistrationSuccessResponse registerOfficer(CreateOfficerRegistrationRequest request);

    /**
     * Get officer profile by official email.
     *
     * @param email the officer's email
     * @return officer profile details
     */
    OfficerProfileResponse getOfficerByEmail(String email);

    /**
     * Get officer profile by registration reference ID.
     *
     * @param referenceId the registration reference (e.g., OFF-2026-000123)
     * @return officer profile details
     */
    OfficerProfileResponse getOfficerByReference(String referenceId);

    /**
     * Get officer profile by UUID.
     *
     * @param id the officer UUID
     * @return officer profile details
     */
    OfficerProfileResponse getOfficerById(UUID id);

    /**
     * List all officers with pagination and optional status filter.
     *
     * @param status   optional status to filter by
     * @param pageable pagination parameters
     * @return paginated list of officer profiles
     */
    PageResponse<OfficerProfileResponse> listOfficers(OfficerStatus status, Pageable pageable);

    /**
     * Approve an officer registration. Admin operation.
     *
     * @param id the officer UUID
     * @return updated officer profile
     */
    OfficerProfileResponse approveOfficer(UUID id);

    /**
     * Reject an officer registration with a reason. Admin operation.
     *
     * @param id     the officer UUID
     * @param reason the rejection reason
     * @return updated officer profile
     */
    OfficerProfileResponse rejectOfficer(UUID id, String reason);

    /**
     * Get officer profile by official email or liaison email.
     *
     * @param email the email of the officer
     * @return officer profile details
     */
    OfficerProfileResponse getOfficerByEmail(String email);

    /**
     * Get officer profile by Keycloak user ID.
     *
     * @param keycloakUserId the Keycloak user ID
     * @return officer profile details
     */
    OfficerProfileResponse getOfficerByKeycloakUserId(String keycloakUserId);
}
