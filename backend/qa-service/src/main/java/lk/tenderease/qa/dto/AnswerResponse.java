package lk.tenderease.qa.dto;

import java.time.OffsetDateTime;

public record AnswerResponse(
        Long id,
        String answeredBy,
        String answerText,
        OffsetDateTime createdAt
) {
}
