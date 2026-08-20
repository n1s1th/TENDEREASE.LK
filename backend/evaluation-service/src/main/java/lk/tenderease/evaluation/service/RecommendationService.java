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

        if (status == RecommendationNote.RecommendationStatus.APPROVED) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String url = "http://localhost:8082/api/v1/tenders/" + note.getTenderId() + "/status?status=AWARDED";
                restTemplate.put(url, null);
                System.out.println("Tender status synchronized to AWARDED for tender: " + note.getTenderId());
            } catch (Exception e) {
                System.err.println("Failed to update tender status to AWARDED: " + e.getMessage());
            }
        }
        
        return repository.save(note);
    }
}
