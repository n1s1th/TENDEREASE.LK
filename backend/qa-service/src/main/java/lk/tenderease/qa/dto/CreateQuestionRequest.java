package lk.tenderease.qa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.tenderease.qa.domain.QuestionCategory;

public record CreateQuestionRequest(
        @NotBlank
        @Size(max = 3000)
        String questionText,

        @NotNull
        QuestionCategory category
) {
}
