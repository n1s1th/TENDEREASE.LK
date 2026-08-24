package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.SavedTender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedTenderRepository extends JpaRepository<SavedTender, UUID> {

    Page<SavedTender> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<SavedTender> findByUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndTenderId(String userId, UUID tenderId);

    void deleteByUserIdAndTenderId(String userId, UUID tenderId);
}
