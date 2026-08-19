package lk.tenderease.evaluation.service.impl;

import lk.tenderease.common.constant.EvaluationStatus;
import lk.tenderease.common.event.EvaluationEvent;
import lk.tenderease.common.exception.BusinessException;
import lk.tenderease.evaluation.dto.request.EvaluationAssignRequest;
import lk.tenderease.evaluation.dto.request.EvaluationScoreRequest;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.dto.response.EvaluationResultResponse;
import lk.tenderease.evaluation.entity.Evaluation;
import lk.tenderease.evaluation.entity.EvaluationCriteria;
import lk.tenderease.evaluation.entity.EvaluationResult;
import lk.tenderease.evaluation.entity.EvaluationScore;
import lk.tenderease.evaluation.exception.EvaluationAlreadyCompletedException;
import lk.tenderease.evaluation.exception.EvaluationNotFoundException;
import lk.tenderease.evaluation.exception.UnauthorizedEvaluationException;
import lk.tenderease.evaluation.mapper.EvaluationMapper;
import lk.tenderease.evaluation.repository.EvaluationCriteriaRepository;
import lk.tenderease.evaluation.repository.EvaluationRepository;
import lk.tenderease.evaluation.repository.EvaluationResultRepository;
import lk.tenderease.evaluation.repository.EvaluationScoreRepository;
import lk.tenderease.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import org.springframework.web.client.RestTemplate;
import lk.tenderease.evaluation.entity.RecommendationNote;
import lk.tenderease.evaluation.repository.RecommendationNoteRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationCriteriaRepository criteriaRepository;
    private final EvaluationScoreRepository scoreRepository;
    private final EvaluationResultRepository resultRepository;
    private final EvaluationMapper mapper;
    private final RabbitTemplate rabbitTemplate;
    private final RecommendationNoteRepository recommendationNoteRepository;

    private static final String EVALUATION_EXCHANGE = "evaluation.exchange";

    @Override
    @Transactional
    public EvaluationResponse startEvaluation(UUID bidId, UUID evaluatorId) {
        Evaluation evaluation = evaluationRepository.findByBidIdAndEvaluatorId(bidId, evaluatorId)
                .orElseThrow(() -> new EvaluationNotFoundException("Evaluation assignment not found for this bid"));

        if (!evaluation.getStatus().equals(EvaluationStatus.PENDING)) {
            throw new BusinessException("Evaluation is already in progress or completed");
        }

        evaluation.setStatus(EvaluationStatus.IN_PROGRESS);
        Evaluation saved = evaluationRepository.save(evaluation);

        publishEvent(saved.getId().toString(), saved.getTenderId().toString(), "evaluation.started");

        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "evaluations", key = "#evaluation.tenderId")
    public EvaluationResponse scoreEvaluation(UUID evaluationId, EvaluationScoreRequest request, UUID evaluatorId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        if (!evaluation.getEvaluatorId().equals(evaluatorId)) {
            throw new UnauthorizedEvaluationException("You are not authorized to score this evaluation");
        }

        if (evaluation.getStatus().equals(EvaluationStatus.COMPLETED)) {
            throw new EvaluationAlreadyCompletedException("Cannot score a completed evaluation");
        }

        EvaluationCriteria criteria = criteriaRepository.findById(request.getCriteriaId())
                .orElseThrow(() -> new BusinessException("Criteria not found"));

        if (!criteria.getTenderId().equals(evaluation.getTenderId())) {
            throw new BusinessException("Criteria does not belong to this tender");
        }

        EvaluationScore score = new EvaluationScore();
        score.setEvaluation(evaluation);
        score.setCriteria(criteria);
        score.setScore(request.getScore());
        score.setComment(request.getComment());
        scoreRepository.save(score);

        // Update total score in evaluation
        List<EvaluationScore> allScores = scoreRepository.findByEvaluationId(evaluationId);
        BigDecimal totalScore = allScores.stream()
                .map(s -> s.getScore().multiply(s.getCriteria().getWeight()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        evaluation.setTotalScore(totalScore);
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional
    @CacheEvict(value = "evaluations", key = "#evaluation.tenderId")
    public EvaluationResponse completeEvaluation(UUID evaluationId, UUID evaluatorId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));

        if (!evaluation.getEvaluatorId().equals(evaluatorId)) {
            throw new UnauthorizedEvaluationException("You are not authorized to complete this evaluation");
        }

        List<EvaluationCriteria> criteriaList = criteriaRepository.findByTenderId(evaluation.getTenderId());
        List<EvaluationScore> scores = scoreRepository.findByEvaluationId(evaluationId);
        
        if (scores.size() < criteriaList.size()) {
            throw new BusinessException("All criteria must be scored before completing");
        }

        evaluation.setStatus(EvaluationStatus.COMPLETED);
        evaluation.setEvaluatedAt(LocalDateTime.now());
        Evaluation saved = evaluationRepository.save(evaluation);

        publishEvent(saved.getId().toString(), saved.getTenderId().toString(), "evaluation.completed");

        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponse> getMyEvaluations(UUID evaluatorId) {
        return evaluationRepository.findByEvaluatorId(evaluatorId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "evaluations", key = "#tenderId")
    public EvaluationResponse assignEvaluator(UUID tenderId, EvaluationAssignRequest request) {
        if (evaluationRepository.existsByBidIdAndEvaluatorId(request.getBidId(), request.getEvaluatorId())) {
            throw new BusinessException("Evaluator is already assigned to this bid");
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setTenderId(tenderId);
        evaluation.setBidId(request.getBidId());
        evaluation.setEvaluatorId(request.getEvaluatorId());
        evaluation.setStatus(EvaluationStatus.PENDING);
        
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "evaluations", key = "#tenderId")
    public List<EvaluationResponse> getEvaluationsByTender(UUID tenderId) {
        return evaluationRepository.findByTenderId(tenderId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"evaluations", "results"}, key = "#tenderId")
    public EvaluationResultResponse finalizeEvaluation(UUID tenderId) {
        List<Evaluation> evaluations = evaluationRepository.findByTenderId(tenderId);
        
        boolean anyIncomplete = evaluations.stream()
                .anyMatch(e -> !e.getStatus().equals(EvaluationStatus.COMPLETED));
        
        if (anyIncomplete || evaluations.isEmpty()) {
            throw new BusinessException("All evaluations must be completed before finalizing");
        }

        // Simplistic logic for winning bid: find the one with the highest average score.
        // In a real scenario, this would group by bidId and average the scores across evaluators.
        UUID winningBidId = null;
        BigDecimal maxScore = BigDecimal.ZERO;
        Evaluation winningEval = null;
        
        for (Evaluation eval : evaluations) {
            if (eval.getTotalScore() != null && eval.getTotalScore().compareTo(maxScore) > 0) {
                maxScore = eval.getTotalScore();
                winningBidId = eval.getBidId();
                winningEval = eval;
            }
        }

        EvaluationResult result = resultRepository.findByTenderId(tenderId).orElse(new EvaluationResult());
        result.setTenderId(tenderId);
        result.setWinningBidId(winningBidId);
        result.setFinalScore(maxScore);
        result.setStatus("FINALIZED");
        result.setApprovedAt(LocalDateTime.now());
        
        EvaluationResult saved = resultRepository.save(result);
        
        if (winningEval != null) {
            String tenderName = "Infrastructure Upgrade Project";
            String department = "Engineering";
            BigDecimal estimatedBudget = new BigDecimal("5000000.00");
            String bidderName = "Apex Build Ltd.";
            BigDecimal recommendedValue = new BigDecimal("4800000.00");

            try {
                RestTemplate restTemplate = new RestTemplate();
                // Fetch tender details
                String tenderUrl = "http://localhost:8082/api/v1/tenders/" + tenderId;
                Map<String, Object> tenderRes = restTemplate.getForObject(tenderUrl, Map.class);
                if (tenderRes != null) {
                    if (tenderRes.get("title") != null) {
                        tenderName = (String) tenderRes.get("title");
                    }
                    if (tenderRes.get("department") != null) {
                        department = (String) tenderRes.get("department");
                    }
                    if (tenderRes.get("estimatedCost") != null) {
                        estimatedBudget = new BigDecimal(tenderRes.get("estimatedCost").toString());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch tender details for recommendation note: {}", e.getMessage());
            }

            try {
                RestTemplate restTemplate = new RestTemplate();
                // Fetch bid details
                String bidUrl = "http://localhost:8083/api/bids";
                Map<String, Object> bidsRes = restTemplate.getForObject(bidUrl, Map.class);
                if (bidsRes != null && bidsRes.get("data") != null) {
                    List<Map<String, Object>> bidsList = (List<Map<String, Object>>) bidsRes.get("data");
                    for (Map<String, Object> bid : bidsList) {
                        if (bid.get("id") != null && bid.get("id").toString().equalsIgnoreCase(winningBidId.toString())) {
                            bidderName = (String) bid.get("companyName");
                            if (bidderName == null) bidderName = (String) bid.get("bidderName");
                            if (bid.get("bidAmount") != null) {
                                recommendedValue = new BigDecimal(bid.get("bidAmount").toString());
                            }
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch bid details for recommendation note: {}", e.getMessage());
            }

            RecommendationNote recNote = RecommendationNote.builder()
                    .tenderId(tenderId.toString())
                    .tenderName(tenderName)
                    .department(department)
                    .estimatedBudget(estimatedBudget)
                    .bidderName(bidderName)
                    .recommendedValue(recommendedValue)
                    .finalScore(maxScore.doubleValue())
                    .justification("Recommended based on the highest technical and financial evaluation score of " + maxScore + "%.")
                    .status(RecommendationNote.RecommendationStatus.PENDING)
                    .build();
            recommendationNoteRepository.save(recNote);
            log.info("Created recommendation note for tender: {} with winning bidder: {}", tenderId, bidderName);
        }

        publishEvent(null, tenderId.toString(), "evaluation.finalized");

        return mapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "results", key = "#tenderId")
    public EvaluationResultResponse getEvaluationResults(UUID tenderId) {
        return resultRepository.findByTenderId(tenderId)
                .map(mapper::toDto)
                .orElseThrow(() -> new BusinessException("Results not found for tender"));
    }

    @Override
    @Transactional
    public EvaluationResponse toggleFlag(UUID evaluationId, UUID evaluatorId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));
        evaluation.setIsFlagged(!evaluation.getIsFlagged());
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional
    public EvaluationResponse updateComplianceStatus(UUID evaluationId, String complianceStatus, UUID evaluatorId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EvaluationNotFoundException(evaluationId));
        evaluation.setComplianceStatus(lk.tenderease.common.constant.ComplianceStatus.valueOf(complianceStatus.toUpperCase()));
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional(readOnly = true)
    public lk.tenderease.evaluation.dto.response.DashboardMetricsResponse getDashboardMetrics(UUID evaluatorId) {
        List<Evaluation> evaluations = evaluationRepository.findByEvaluatorId(evaluatorId);
        
        long activeTenders = evaluations.stream().map(Evaluation::getTenderId).distinct().count();
        long totalBids = evaluations.size();
        long underEvaluation = evaluations.stream()
                .filter(e -> e.getStatus().equals(EvaluationStatus.IN_PROGRESS))
                .count();
        
        return lk.tenderease.evaluation.dto.response.DashboardMetricsResponse.builder()
                .activeTenders(activeTenders)
                .totalBids(totalBids)
                .underEvaluation(underEvaluation)
                .awardedProposals(4) // Mocked for now
                .noBidTenders(3) // Mocked for now
                .build();
    }

    @Override
    @Transactional
    public EvaluationResponse toggleFlagByBidId(UUID bidId) {
        Evaluation evaluation = evaluationRepository.findByBidId(bidId).stream().findFirst().orElse(null);
        if (evaluation == null) {
            log.info("No evaluation found for bidId {} when toggling flag.", bidId);
            return null;
        }
        evaluation.setIsFlagged(!evaluation.getIsFlagged());
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional
    public EvaluationResponse updateComplianceStatusByBidId(UUID bidId, String complianceStatus) {
        Evaluation evaluation = evaluationRepository.findByBidId(bidId).stream().findFirst().orElse(null);
        if (evaluation == null) {
            log.info("No evaluation found for bidId {} when updating compliance status.", bidId);
            return null;
        }
        evaluation.setComplianceStatus(lk.tenderease.common.constant.ComplianceStatus.valueOf(complianceStatus.toUpperCase()));
        return mapper.toDto(evaluationRepository.save(evaluation));
    }

    private void publishEvent(String evaluationId, String tenderId, String eventType) {
        try {
            EvaluationEvent event = EvaluationEvent.builder()
                    .evaluationId(evaluationId)
                    .tenderId(tenderId)
                    .eventType(eventType)
                    .build();
            rabbitTemplate.convertAndSend(EVALUATION_EXCHANGE, eventType, event);
            log.info("Published event: {} for tender: {}", eventType, tenderId);
        } catch (Exception e) {
            log.error("Failed to publish event {}", eventType, e);
        }
    }
}
