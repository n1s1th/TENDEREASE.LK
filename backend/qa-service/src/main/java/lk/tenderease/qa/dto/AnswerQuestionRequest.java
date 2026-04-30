package lk.tenderease.qa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnswerQuestionRequest(
        @NotBlank
        @Size(max = 5000)
        String answerText
) {
}
