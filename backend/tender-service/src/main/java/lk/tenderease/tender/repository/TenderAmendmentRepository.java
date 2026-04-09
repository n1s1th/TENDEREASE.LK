package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.TenderAmendment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TenderAmendmentRepository extends JpaRepository<TenderAmendment, Long> {

    List<TenderAmendment> findByTenderIdOrderByCreatedAtDesc(UUID tenderId);
}