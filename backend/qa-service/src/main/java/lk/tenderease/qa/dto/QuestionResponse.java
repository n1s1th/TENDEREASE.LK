package lk.tenderease.qa.dto;

import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.domain.QuestionStatus;

import java.time.OffsetDateTime;

public record QuestionResponse(
        Long id,
        String userId,
        String questionText,
        QuestionCategory category,
        QuestionStatus status,
        OffsetDateTime createdAt,
        AnswerResponse answer
) {
}
