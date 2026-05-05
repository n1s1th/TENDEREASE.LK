package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.EvaluationCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvaluationCriteriaRepository extends JpaRepository<EvaluationCriteria, UUID> {
    List<EvaluationCriteria> findByTenderId(UUID tenderId);
}
