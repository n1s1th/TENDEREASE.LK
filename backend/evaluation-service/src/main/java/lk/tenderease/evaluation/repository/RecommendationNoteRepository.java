package lk.tenderease.evaluation.repository;

import lk.tenderease.evaluation.entity.RecommendationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationNoteRepository extends JpaRepository<RecommendationNote, Long> {
    List<RecommendationNote> findByStatus(RecommendationNote.RecommendationStatus status);
    List<RecommendationNote> findAllByOrderByCreatedAtDesc();
}
