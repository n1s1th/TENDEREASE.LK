package lk.tenderease.evaluation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.common.dto.ApiResponse;
import lk.tenderease.common.security.SecurityUtils;
import lk.tenderease.evaluation.dto.request.EvaluationScoreRequest;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@Tag(name = "Evaluation API", description = "APIs for evaluators to score bids")
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/start/{bidId}")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Start an evaluation for a bid")
    public ResponseEntity<ApiResponse<EvaluationResponse>> startEvaluation(@PathVariable UUID bidId) {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        EvaluationResponse response = evaluationService.startEvaluation(bidId, evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluation started successfully"));
    }

    @PostMapping("/{id}/score")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Submit a score for a specific criteria")
    public ResponseEntity<ApiResponse<EvaluationResponse>> scoreEvaluation(
            @PathVariable UUID id,
            @Valid @RequestBody EvaluationScoreRequest request) {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        EvaluationResponse response = evaluationService.scoreEvaluation(id, request, evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Score submitted successfully"));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Complete the evaluation")
    public ResponseEntity<ApiResponse<EvaluationResponse>> completeEvaluation(@PathVariable UUID id) {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        EvaluationResponse response = evaluationService.completeEvaluation(id, evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluation completed successfully"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Get all evaluations assigned to the current user")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getMyEvaluations() {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        List<EvaluationResponse> response = evaluationService.getMyEvaluations(evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluations retrieved successfully"));
    }

    @PutMapping("/{id}/flag")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Toggle flag status for an evaluation")
    public ResponseEntity<ApiResponse<EvaluationResponse>> toggleFlag(@PathVariable UUID id) {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        EvaluationResponse response = evaluationService.toggleFlag(id, evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Flag status toggled successfully"));
    }

    @PutMapping("/{id}/compliance/{status}")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Update technical compliance status")
    public ResponseEntity<ApiResponse<EvaluationResponse>> updateComplianceStatus(
            @PathVariable UUID id,
            @PathVariable String status) {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        EvaluationResponse response = evaluationService.updateComplianceStatus(id, status, evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(response, "Compliance status updated successfully"));
    }

    @GetMapping("/dashboard/metrics")
    @PreAuthorize("hasRole('EVALUATOR')")
    @Operation(summary = "Get dashboard metrics for the current evaluator")
    public ResponseEntity<ApiResponse<lk.tenderease.evaluation.dto.response.DashboardMetricsResponse>> getDashboardMetrics() {
        UUID evaluatorId = SecurityUtils.getCurrentUserId();
        lk.tenderease.evaluation.dto.response.DashboardMetricsResponse metrics = evaluationService.getDashboardMetrics(evaluatorId);
        return ResponseEntity.ok(ApiResponse.success(metrics, "Dashboard metrics retrieved successfully"));
    }
}
