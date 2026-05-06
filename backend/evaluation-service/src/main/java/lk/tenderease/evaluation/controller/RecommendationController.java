package lk.tenderease.evaluation.controller;

import lk.tenderease.evaluation.entity.RecommendationNote;
import lk.tenderease.evaluation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For local development
public class RecommendationController {

    private final RecommendationService service;

    @GetMapping
    public ResponseEntity<List<RecommendationNote>> getAllRecommendations(
            @RequestParam(required = false) RecommendationNote.RecommendationStatus status) {
        return ResponseEntity.ok(service.getAllRecommendations(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecommendationNote> getRecommendationById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRecommendationById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RecommendationNote> updateStatus(
            @PathVariable Long id,
            @RequestParam RecommendationNote.RecommendationStatus status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(service.updateStatus(id, status, reason));
    }
}
