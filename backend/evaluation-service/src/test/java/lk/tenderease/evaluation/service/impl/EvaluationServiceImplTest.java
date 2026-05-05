package lk.tenderease.evaluation.service.impl;

import lk.tenderease.common.constant.EvaluationStatus;
import lk.tenderease.evaluation.dto.request.EvaluationAssignRequest;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.entity.Evaluation;
import lk.tenderease.evaluation.mapper.EvaluationMapper;
import lk.tenderease.evaluation.repository.EvaluationCriteriaRepository;
import lk.tenderease.evaluation.repository.EvaluationRepository;
import lk.tenderease.evaluation.repository.EvaluationResultRepository;
import lk.tenderease.evaluation.repository.EvaluationScoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceImplTest {

    @Mock
    private EvaluationRepository evaluationRepository;

    @Mock
    private EvaluationCriteriaRepository criteriaRepository;

    @Mock
    private EvaluationScoreRepository scoreRepository;

    @Mock
    private EvaluationResultRepository resultRepository;

    @Mock
    private EvaluationMapper mapper;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private EvaluationServiceImpl evaluationService;

    private UUID tenderId;
    private UUID bidId;
    private UUID evaluatorId;
    private Evaluation evaluation;

    @BeforeEach
    void setUp() {
        tenderId = UUID.randomUUID();
        bidId = UUID.randomUUID();
        evaluatorId = UUID.randomUUID();

        evaluation = new Evaluation();
        evaluation.setId(UUID.randomUUID());
        evaluation.setTenderId(tenderId);
        evaluation.setBidId(bidId);
        evaluation.setEvaluatorId(evaluatorId);
        evaluation.setStatus(EvaluationStatus.PENDING);
    }

    @Test
    void assignEvaluator_Success() {
        EvaluationAssignRequest request = new EvaluationAssignRequest();
        request.setBidId(bidId);
        request.setEvaluatorId(evaluatorId);

        when(evaluationRepository.existsByBidIdAndEvaluatorId(bidId, evaluatorId)).thenReturn(false);
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(evaluation);
        
        EvaluationResponse mockResponse = new EvaluationResponse();
        mockResponse.setTenderId(tenderId);
        when(mapper.toDto(any(Evaluation.class))).thenReturn(mockResponse);

        EvaluationResponse response = evaluationService.assignEvaluator(tenderId, request);

        assertNotNull(response);
        assertEquals(tenderId, response.getTenderId());
        verify(evaluationRepository, times(1)).save(any(Evaluation.class));
    }

    @Test
    void startEvaluation_Success() {
        when(evaluationRepository.findByBidIdAndEvaluatorId(bidId, evaluatorId)).thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(evaluation);
        
        EvaluationResponse mockResponse = new EvaluationResponse();
        mockResponse.setStatus(EvaluationStatus.IN_PROGRESS.name());
        when(mapper.toDto(any(Evaluation.class))).thenReturn(mockResponse);

        EvaluationResponse response = evaluationService.startEvaluation(bidId, evaluatorId);

        assertNotNull(response);
        assertEquals(EvaluationStatus.IN_PROGRESS.name(), response.getStatus());
        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}
