package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderClarification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenderClarificationRepository extends JpaRepository<TenderClarification, Long> {

    List<TenderClarification> findByTenderIdAndIsPublicTrue(Long tenderId);
}