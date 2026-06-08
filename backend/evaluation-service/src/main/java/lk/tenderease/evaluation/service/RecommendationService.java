package lk.tenderease.evaluation.service;

import lk.tenderease.evaluation.entity.RecommendationNote;
import lk.tenderease.evaluation.repository.RecommendationNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationNoteRepository repository;

    public List<RecommendationNote> getAllRecommendations(RecommendationNote.RecommendationStatus status) {
        if (status != null) {
            return repository.findByStatus(status);
        }
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public RecommendationNote getRecommendationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + id));
    }

    @Transactional
    public RecommendationNote updateStatus(Long id, RecommendationNote.RecommendationStatus status, String reason) {
        RecommendationNote note = getRecommendationById(id);
        
        note.setStatus(status);
        note.setActionedAt(LocalDateTime.now());
        
        if (status == RecommendationNote.RecommendationStatus.REJECTED && reason != null) {
            note.setRejectionReason(reason);
        }
        
        return repository.save(note);
    }
}
