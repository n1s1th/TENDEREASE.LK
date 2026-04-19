package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderRepository extends JpaRepository<Tender, UUID> {

    @EntityGraph(attributePaths = {"ministry", "department", "fundingSource"})
    Optional<Tender> findById(UUID id);

    Page<Tender> findByStatus(TenderStatus status, Pageable pageable);

    Page<Tender> findByCreatedBy(String createdBy, Pageable pageable);

    Optional<Tender> findByTenderNumber(String tenderNumber);

    Page<Tender> findByCreatedByAndStatus(String createdBy, TenderStatus status, Pageable pageable);

    boolean existsByTenderNumber(String tenderNumber);
}
