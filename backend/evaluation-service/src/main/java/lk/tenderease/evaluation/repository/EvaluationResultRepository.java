package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.EvaluationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvaluationResultRepository extends JpaRepository<EvaluationResult, UUID> {
    Optional<EvaluationResult> findByTenderId(UUID tenderId);
}
