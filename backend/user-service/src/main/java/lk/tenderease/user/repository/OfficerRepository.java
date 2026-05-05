package lk.tenderease.user.repository;

import lk.tenderease.user.entity.Officer;
import lk.tenderease.user.enums.OfficerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link Officer} entity operations.
 * Provides custom query methods for registration workflow.
 */
@Repository
public interface OfficerRepository extends JpaRepository<Officer, UUID> {

    /**
     * Check if an officer with the given official email already exists.
     *
     * @param officialEmail the email to check
     * @return true if email is already registered
     */
    boolean existsByOfficialEmail(String officialEmail);

    /**
     * Find an officer by their unique registration reference ID.
     *
     * @param registrationReference the reference ID (e.g., OFF-2026-000123)
     * @return optional officer
     */
    Optional<Officer> findByRegistrationReference(String registrationReference);

    /**
     * Find all officers filtered by registration status with pagination.
     *
     * @param status   the officer status to filter by
     * @param pageable pagination parameters
     * @return page of officers
     */
    Page<Officer> findByStatus(OfficerStatus status, Pageable pageable);

    /**
     * Get the current count of officers for reference ID sequence generation.
     * Uses a native query to get the next value from the database sequence.
     *
     * @return next sequence value
     */
    @Query(value = "SELECT nextval('officer_ref_seq')", nativeQuery = true)
    Long getNextReferenceSequence();

    /**
     * Get the next support ID sequence value.
     *
     * @return next support sequence value
     */
    @Query(value = "SELECT nextval('officer_support_seq')", nativeQuery = true)
    Long getNextSupportSequence();

    /**
     * Find officer by official email.
     *
     * @param officialEmail the email
     * @return optional officer
     */
    Optional<Officer> findByOfficialEmail(String officialEmail);

    /**
     * Find officer by Keycloak user ID.
     *
     * @param keycloakUserId the Keycloak user identifier
     * @return optional officer
     */
    Optional<Officer> findByKeycloakUserId(String keycloakUserId);
}
