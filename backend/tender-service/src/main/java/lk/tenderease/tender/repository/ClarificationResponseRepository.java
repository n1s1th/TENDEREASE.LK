package lk.tenderease.tender.repository;

import lk.tenderease.tender.entity.ClarificationResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClarificationResponseRepository extends JpaRepository<ClarificationResponse, Long> {

    Optional<ClarificationResponse> findByClarificationId(Long clarificationId);
}