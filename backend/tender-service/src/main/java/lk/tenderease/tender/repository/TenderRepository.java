package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TenderRepository extends JpaRepository<Tender, UUID>, JpaSpecificationExecutor<Tender> {

    // 🔍 Find by tender number
    Optional<Tender> findByTenderNumber(String tenderNumber);

    // 📄 Get tenders by status
    Page<Tender> findByStatus(TenderStatus status, Pageable pageable);

    @Query("""
                SELECT t FROM Tender t WHERE
                (:keyword = '' OR
                    LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(t.tenderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(t.departmentName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                AND t.status = :status
                AND t.status NOT IN ('PENDING_APPROVAL', 'DRAFT')
            """)
    Page<Tender> searchWithStatus(
            @Param("keyword") String keyword,
            @Param("status") TenderStatus status,
            Pageable pageable);

    @Query("""
                SELECT t FROM Tender t WHERE
                (:keyword = '' OR
                    LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(t.tenderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(t.departmentName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                AND t.status NOT IN ('PENDING_APPROVAL', 'DRAFT')
            """)
    Page<Tender> searchWithoutStatus(
            @Param("keyword") String keyword,
            Pageable pageable);
}