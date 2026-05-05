package lk.tenderease.evaluation.service;

import lk.tenderease.evaluation.dto.request.EvaluationAssignRequest;
import lk.tenderease.evaluation.dto.request.EvaluationScoreRequest;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.dto.response.EvaluationResultResponse;

import java.util.List;
import java.util.UUID;

public interface EvaluationService {

    // Evaluator APIs
    EvaluationResponse startEvaluation(UUID bidId, UUID evaluatorId);
    EvaluationResponse scoreEvaluation(UUID evaluationId, EvaluationScoreRequest request, UUID evaluatorId);
    EvaluationResponse completeEvaluation(UUID evaluationId, UUID evaluatorId);
    List<EvaluationResponse> getMyEvaluations(UUID evaluatorId);
    EvaluationResponse toggleFlag(UUID evaluationId, UUID evaluatorId);
    EvaluationResponse updateComplianceStatus(UUID evaluationId, String complianceStatus, UUID evaluatorId);

    // Admin/Committee APIs
    EvaluationResponse assignEvaluator(UUID tenderId, EvaluationAssignRequest request);
    List<EvaluationResponse> getEvaluationsByTender(UUID tenderId);
    EvaluationResultResponse finalizeEvaluation(UUID tenderId);
    EvaluationResultResponse getEvaluationResults(UUID tenderId);
    lk.tenderease.evaluation.dto.response.DashboardMetricsResponse getDashboardMetrics(UUID evaluatorId);
}
