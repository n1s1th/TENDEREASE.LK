package lk.tenderease.user.repository;

import lk.tenderease.user.entity.RegistrationAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link RegistrationAudit} entity operations.
 * Used for tracking registration events and troubleshooting.
 */
@Repository
public interface RegistrationAuditRepository extends JpaRepository<RegistrationAudit, UUID> {

    /**
     * Find all audit records for a given registration reference ID,
     * ordered by creation date descending.
     *
     * @param referenceId the registration reference ID
     * @return list of audit records
     */
    List<RegistrationAudit> findByReferenceIdOrderByCreatedAtDesc(String referenceId);

    /**
     * Find audit record by support ID.
     *
     * @param supportId the error support ID
     * @return list of matching audit records
     */
    List<RegistrationAudit> findBySupportId(String supportId);
}
