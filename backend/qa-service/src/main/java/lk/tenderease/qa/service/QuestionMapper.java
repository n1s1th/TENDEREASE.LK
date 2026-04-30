package lk.tenderease.qa.service;

import lk.tenderease.qa.domain.Answer;
import lk.tenderease.qa.domain.Question;
import lk.tenderease.qa.dto.AnswerResponse;
import lk.tenderease.qa.dto.QuestionResponse;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {

    public QuestionResponse toResponse(Question question) {
        Answer answer = question.getAnswer();
        AnswerResponse answerResponse = answer == null
                ? null
                : new AnswerResponse(answer.getId(), answer.getAnsweredBy(), answer.getAnswerText(), answer.getCreatedAt());

        return new QuestionResponse(
                question.getId(),
                question.getUserId(),
                question.getQuestionText(),
                question.getCategory(),
                question.getStatus(),
                question.getCreatedAt(),
                answerResponse
        );
    }
}
