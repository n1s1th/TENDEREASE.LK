package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {
    List<Evaluation> findByEvaluatorId(UUID evaluatorId);
    List<Evaluation> findByTenderId(UUID tenderId);
    List<Evaluation> findByBidId(UUID bidId);
    Optional<Evaluation> findByBidIdAndEvaluatorId(UUID bidId, UUID evaluatorId);
    boolean existsByBidIdAndEvaluatorId(UUID bidId, UUID evaluatorId);
}
