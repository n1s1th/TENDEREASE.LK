package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderClarification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenderClarificationRepository extends JpaRepository<TenderClarification, Long> {

    List<TenderClarification> findByTenderIdOrderByAskedAtDesc(UUID tenderId);

    Optional<TenderClarification> findByIdAndTenderId(Long id, UUID tenderId);

    List<TenderClarification> findByTenderCreatedByOrderByAskedAtDesc(String createdBy);
}
