package lk.tenderease.evaluation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.common.dto.ApiResponse;
import lk.tenderease.evaluation.dto.request.EvaluationAssignRequest;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.dto.response.EvaluationResultResponse;
import lk.tenderease.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evaluations/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Evaluation API", description = "APIs for admins and committee to manage evaluations")
public class AdminEvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/{tenderId}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE')")
    @Operation(summary = "Assign an evaluator to a tender's bid")
    public ResponseEntity<ApiResponse<EvaluationResponse>> assignEvaluator(
            @PathVariable UUID tenderId,
            @Valid @RequestBody EvaluationAssignRequest request) {
        EvaluationResponse response = evaluationService.assignEvaluator(tenderId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluator assigned successfully"));
    }

    @GetMapping("/tender/{tenderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE')")
    @Operation(summary = "Get all evaluations for a tender")
    public ResponseEntity<ApiResponse<List<EvaluationResponse>>> getEvaluationsByTender(@PathVariable UUID tenderId) {
        List<EvaluationResponse> response = evaluationService.getEvaluationsByTender(tenderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluations retrieved successfully"));
    }

    @PostMapping("/{tenderId}/finalize")
    @PreAuthorize("hasRole('COMMITTEE')")
    @Operation(summary = "Finalize the evaluation process for a tender")
    public ResponseEntity<ApiResponse<EvaluationResultResponse>> finalizeEvaluation(@PathVariable UUID tenderId) {
        EvaluationResultResponse response = evaluationService.finalizeEvaluation(tenderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Evaluation finalized successfully"));
    }

    @GetMapping("/results/{tenderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE', 'EVALUATOR')")
    @Operation(summary = "Get the final results for a tender")
    public ResponseEntity<ApiResponse<EvaluationResultResponse>> getEvaluationResults(@PathVariable UUID tenderId) {
        EvaluationResultResponse response = evaluationService.getEvaluationResults(tenderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Results retrieved successfully"));
    }
}
