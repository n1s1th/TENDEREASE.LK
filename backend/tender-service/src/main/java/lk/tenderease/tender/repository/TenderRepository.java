package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderRepository extends JpaRepository<Tender, UUID>, JpaSpecificationExecutor<Tender> {

    // 🔥 Optimized fetch
    @EntityGraph(attributePaths = { "ministry", "department", "fundingSource" })
    Optional<Tender> findById(UUID id);

    // Basic queries
    Optional<Tender> findByTenderNumber(String tenderNumber);

    boolean existsByTenderNumber(String tenderNumber);

    Page<Tender> findByStatus(TenderStatus status, Pageable pageable);

    Page<Tender> findByStatusIn(java.util.Collection<TenderStatus> statuses, Pageable pageable);

    @Query("SELECT t FROM Tender t WHERE t.status IN :statuses")
    java.util.List<Tender> findAllByStatusIn(
            @org.springframework.data.repository.query.Param("statuses") java.util.Collection<TenderStatus> statuses);

    Page<Tender> findByCreatedBy(String createdBy, Pageable pageable);

    Page<Tender> findByCreatedByAndStatus(String createdBy, TenderStatus status, Pageable pageable);

    // 🔍 Advanced search WITH status
    @Query("""
                SELECT t FROM Tender t WHERE
                (CAST(:keyword AS string) = '' OR
                 LOWER(t.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR
                 LOWER(t.tenderNumber) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR
                 LOWER(t.department.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                AND t.status = :status
                AND t.status NOT IN (lk.tenderease.tender.enums.TenderStatus.PENDING_APPROVAL, lk.tenderease.tender.enums.TenderStatus.DRAFT, lk.tenderease.tender.enums.TenderStatus.REJECTED)
            """)
    Page<Tender> searchWithStatuses(
            @Param("keyword") String keyword,
            @Param("statuses") java.util.List<TenderStatus> statuses,
            Pageable pageable);

    // 🔍 Advanced search WITHOUT status
    @Query("""
                SELECT t FROM Tender t WHERE
                (:keyword = '' OR
                 LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(t.tenderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(t.department.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                AND t.status NOT IN ('PENDING_APPROVAL', 'DRAFT')
            """)
    Page<Tender> searchWithoutStatus(
            @Param("keyword") String keyword,
            Pageable pageable);
}