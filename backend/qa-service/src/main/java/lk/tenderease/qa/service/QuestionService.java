package lk.tenderease.qa.service;

import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.domain.QuestionStatus;
import lk.tenderease.qa.dto.AnswerQuestionRequest;
import lk.tenderease.qa.dto.CreateQuestionRequest;
import lk.tenderease.qa.dto.QuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuestionService {

    Page<QuestionResponse> getPublicQuestions(QuestionCategory category, Pageable pageable);

    QuestionResponse getQuestion(Long id);

    QuestionResponse createQuestion(CreateQuestionRequest request);

    Page<QuestionResponse> getMyQuestions(Pageable pageable);

    Page<QuestionResponse> getAdminQuestions(Pageable pageable);

    Page<QuestionResponse> getQuestionsByStatus(QuestionStatus status, Pageable pageable);

    QuestionResponse answerQuestion(Long id, AnswerQuestionRequest request);
}
