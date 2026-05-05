package lk.tenderease.evaluation.mapper;

import lk.tenderease.evaluation.dto.response.EvaluationCriteriaResponse;
import lk.tenderease.evaluation.dto.response.EvaluationResponse;
import lk.tenderease.evaluation.dto.response.EvaluationResultResponse;
import lk.tenderease.evaluation.dto.response.EvaluationScoreResponse;
import lk.tenderease.evaluation.dto.response.OpeningAttendanceResponse;
import lk.tenderease.evaluation.dto.response.OpeningSessionResponse;
import lk.tenderease.evaluation.entity.Evaluation;
import lk.tenderease.evaluation.entity.EvaluationCriteria;
import lk.tenderease.evaluation.entity.EvaluationResult;
import lk.tenderease.evaluation.entity.EvaluationScore;
import lk.tenderease.evaluation.entity.OpeningAttendance;
import lk.tenderease.evaluation.entity.OpeningSession;
import org.springframework.stereotype.Component;

@Component
public class EvaluationMapper {

    public EvaluationResponse toDto(Evaluation entity) {
        if (entity == null) return null;
        EvaluationResponse dto = new EvaluationResponse();
        dto.setId(entity.getId());
        dto.setTenderId(entity.getTenderId());
        dto.setBidId(entity.getBidId());
        dto.setEvaluatorId(entity.getEvaluatorId());
        dto.setStatus(entity.getStatus().name());
        dto.setIsFlagged(entity.getIsFlagged());
        dto.setComplianceStatus(entity.getComplianceStatus().name());
        dto.setTotalScore(entity.getTotalScore());
        dto.setRemarks(entity.getRemarks());
        dto.setEvaluatedAt(entity.getEvaluatedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public EvaluationCriteriaResponse toDto(EvaluationCriteria entity) {
        if (entity == null) return null;
        EvaluationCriteriaResponse dto = new EvaluationCriteriaResponse();
        dto.setId(entity.getId());
        dto.setTenderId(entity.getTenderId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setWeight(entity.getWeight());
        return dto;
    }

    public EvaluationScoreResponse toDto(EvaluationScore entity) {
        if (entity == null) return null;
        EvaluationScoreResponse dto = new EvaluationScoreResponse();
        dto.setId(entity.getId());
        dto.setEvaluationId(entity.getEvaluation().getId());
        dto.setCriteria(toDto(entity.getCriteria()));
        dto.setScore(entity.getScore());
        dto.setComment(entity.getComment());
        return dto;
    }

    public EvaluationResultResponse toDto(EvaluationResult entity) {
        if (entity == null) return null;
        EvaluationResultResponse dto = new EvaluationResultResponse();
        dto.setId(entity.getId());
        dto.setTenderId(entity.getTenderId());
        dto.setWinningBidId(entity.getWinningBidId());
        dto.setFinalScore(entity.getFinalScore());
        dto.setApprovedAt(entity.getApprovedAt());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public OpeningSessionResponse toDto(OpeningSession entity) {
        if (entity == null) return null;
        OpeningSessionResponse dto = new OpeningSessionResponse();
        dto.setId(entity.getId());
        dto.setTenderId(entity.getTenderId());
        dto.setScheduledOpeningTime(entity.getScheduledOpeningTime());
        dto.setActualOpeningTime(entity.getActualOpeningTime());
        dto.setStatus(entity.getStatus());
        dto.setOpenedBy(entity.getOpenedBy());
        return dto;
    }

    public OpeningAttendanceResponse toDto(OpeningAttendance entity) {
        if (entity == null) return null;
        OpeningAttendanceResponse dto = new OpeningAttendanceResponse();
        dto.setId(entity.getId());
        dto.setOfficerId(entity.getOfficerId());
        dto.setOfficerName(entity.getOfficerName());
        dto.setDesignation(entity.getDesignation());
        dto.setAttendanceTime(entity.getAttendanceTime());
        return dto;
    }
}
