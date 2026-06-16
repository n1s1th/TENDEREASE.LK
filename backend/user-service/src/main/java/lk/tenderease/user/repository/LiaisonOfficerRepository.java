package lk.tenderease.user.repository;

import lk.tenderease.user.entity.LiaisonOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link LiaisonOfficer} entity operations.
 */
@Repository
public interface LiaisonOfficerRepository extends JpaRepository<LiaisonOfficer, UUID> {

    /**
     * Check if a liaison officer with the given NIC already exists.
     * Enforces one-NIC-one-liaison-officer business rule.
     *
     * @param nic the National Identity Card number
     * @return true if NIC is already registered
     */
    boolean existsByNic(String nic);

    /**
     * Check if a liaison officer with the given email already exists.
     *
     * @param email the email address
     * @return true if email is already registered
     */
    boolean existsByEmail(String email);

    /**
     * Find liaison officer by NIC.
     *
     * @param nic the National Identity Card number
     * @return optional liaison officer
     */
    Optional<LiaisonOfficer> findByNic(String nic);

    /**
     * Find liaison officer by associated officer ID.
     *
     * @param officerId the officer UUID
     * @return optional liaison officer
     */
    Optional<LiaisonOfficer> findByOfficerId(UUID officerId);
}
