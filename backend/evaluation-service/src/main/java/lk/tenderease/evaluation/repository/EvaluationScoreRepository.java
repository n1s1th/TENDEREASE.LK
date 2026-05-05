package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.EvaluationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvaluationScoreRepository extends JpaRepository<EvaluationScore, UUID> {
    List<EvaluationScore> findByEvaluationId(UUID evaluationId);
}
