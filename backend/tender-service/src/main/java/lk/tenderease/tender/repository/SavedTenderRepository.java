package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.SavedTender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedTenderRepository extends JpaRepository<SavedTender, UUID> {
    Page<SavedTender> findByUserId(String userId, Pageable pageable);
    Optional<SavedTender> findByUserIdAndTenderId(String userId, UUID tenderId);
    void deleteByUserIdAndTenderId(String userId, UUID tenderId);
    boolean existsByUserIdAndTenderId(String userId, UUID tenderId);
}
