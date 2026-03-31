package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.Tender;
import lk.tenderease.tender.enums.TenderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import java.util.Optional;

public interface TenderRepository extends JpaRepository<Tender, Long>, JpaSpecificationExecutor<Tender> {

    Optional<Tender> findByTenderNumber(String tenderNumber);

    // 🔥 Public tenders (for UI listing)
    Page<Tender> findByStatus(TenderStatus status, Pageable pageable);

    // 🔥 Search by title (UI search bar)
    @Query("SELECT t FROM Tender t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND t.status = 'PUBLISHED'")
    Page<Tender> searchPublishedTenders(String keyword, Pageable pageable);

    // 🔥 Filter by department + status
    Page<Tender> findByDepartmentNameAndStatus(String departmentName, TenderStatus status, Pageable pageable);
}