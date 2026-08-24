package lk.tenderease.evaluation.service;

import lk.tenderease.evaluation.entity.RecommendationNote;
import lk.tenderease.evaluation.entity.EvaluationResult;
import lk.tenderease.evaluation.repository.RecommendationNoteRepository;
import lk.tenderease.evaluation.repository.EvaluationResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationNoteRepository repository;
    private final EvaluationResultRepository resultRepository;

    public List<RecommendationNote> getAllRecommendations(RecommendationNote.RecommendationStatus status) {
        syncMissingRecommendationNotes();

        if (status != null) {
            return repository.findByStatus(status);
        }
        return repository.findAllByOrderByCreatedAtDesc();
    }

    private void syncMissingRecommendationNotes() {
        List<RecommendationNote> existingNotes = repository.findAll();
        
        // Removed cleanup block to prevent deletion of real notes that fell back to dummy titles

        List<EvaluationResult> results = resultRepository.findAll();
        for (EvaluationResult result : results) {
            if (result.getWinningBidId() == null) continue;

            boolean exists = existingNotes.stream()
                    .anyMatch(n -> n.getTenderId() != null && n.getTenderId().equals(result.getTenderId().toString()));

            if (!exists) {
                createRecommendationNote(result);
            }
        }
    }

    private boolean createRecommendationNote(EvaluationResult result) {
        String tenderId = result.getTenderId().toString();
        String tenderName = null;
        String department = null;
        java.math.BigDecimal estimatedBudget = null;
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String tenderUrl = "http://tender-service:8082/api/v1/tenders/" + tenderId;
            Map<String, Object> tenderRes = restTemplate.getForObject(tenderUrl, Map.class);
            if (tenderRes != null) {
                if (tenderRes.get("title") != null) tenderName = (String) tenderRes.get("title");
                if (tenderRes.get("department") != null) department = (String) tenderRes.get("department");
                if (tenderRes.get("estimatedCost") != null) estimatedBudget = new java.math.BigDecimal(tenderRes.get("estimatedCost").toString());
                if (tenderRes.get("estimatedBudget") != null) estimatedBudget = new java.math.BigDecimal(tenderRes.get("estimatedBudget").toString());
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch tender details for sync (tender likely doesn't exist): " + e.getMessage());
            return false; // Skip creating recommendation if tender doesn't exist in tender-service
        }

        if (tenderName == null) return false;

        String bidderName = "Unknown Bidder";
        java.math.BigDecimal recommendedValue = java.math.BigDecimal.ZERO;

        try {
            RestTemplate restTemplate = new RestTemplate();
            String bidUrl = "http://bid-service:8083/api/bids/tender/" + tenderId;
            Map<String, Object> bidsRes = restTemplate.getForObject(bidUrl, Map.class);
            if (bidsRes != null && bidsRes.get("data") != null) {
                List<Map<String, Object>> bidsList = (List<Map<String, Object>>) bidsRes.get("data");
                for (Map<String, Object> bid : bidsList) {
                    if (bid.get("id") != null && bid.get("id").toString().equalsIgnoreCase(result.getWinningBidId().toString())) {
                        bidderName = (String) bid.get("companyName");
                        if (bidderName == null) bidderName = (String) bid.get("bidderName");
                        if (bid.get("bidAmount") != null) recommendedValue = new java.math.BigDecimal(bid.get("bidAmount").toString());
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch bid details for sync: " + e.getMessage());
        }

        RecommendationNote recNote = RecommendationNote.builder()
                .tenderId(tenderId)
                .tenderName(tenderName)
                .department(department != null ? department : "N/A")
                .estimatedBudget(estimatedBudget != null ? estimatedBudget : java.math.BigDecimal.ZERO)
                .bidderName(bidderName)
                .recommendedValue(recommendedValue)
                .finalScore(result.getFinalScore().doubleValue())
                .technicalScore(Math.round(result.getFinalScore().doubleValue() * 0.7 * 100.0) / 100.0)
                .financialScore(Math.round(result.getFinalScore().doubleValue() * 0.3 * 100.0) / 100.0)
                .bidId(result.getWinningBidId().toString().substring(0, 8).toUpperCase())
                .justification("Recommended based on the highest technical and financial evaluation score of " + result.getFinalScore() + "%.")
                .status(RecommendationNote.RecommendationStatus.PENDING)
                .build();
        repository.save(recNote);
        return true;
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
            // Wait for the officer to send the award emails before setting the status to AWARDED.
            // The frontend AwardProcessingDetail component will update the status to AWARDED
            // once the winner and loser emails are generated.
            System.out.println("CAO approved recommendation for tender: " + note.getTenderId() + ". Waiting for officer to send emails.");
        }
        
        return repository.save(note);
    }
}
