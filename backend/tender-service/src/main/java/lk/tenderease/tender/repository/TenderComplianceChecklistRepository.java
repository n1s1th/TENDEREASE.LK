package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderComplianceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderComplianceChecklistRepository extends JpaRepository<TenderComplianceChecklist, UUID> {

    Optional<TenderComplianceChecklist> findByTenderId(UUID tenderId);
}
