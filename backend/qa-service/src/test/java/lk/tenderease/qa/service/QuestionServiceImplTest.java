package lk.tenderease.qa.service;

import lk.tenderease.qa.domain.Question;
import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.dto.AnswerQuestionRequest;
import lk.tenderease.qa.dto.CreateQuestionRequest;
import lk.tenderease.qa.exception.AlreadyAnsweredException;
import lk.tenderease.qa.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class QuestionServiceImplTest {

    private QuestionRepository questionRepository;
    private CurrentUser currentUser;
    private QuestionServiceImpl questionService;

    @BeforeEach
    void setUp() {
        questionRepository = mock(QuestionRepository.class);
        currentUser = mock(CurrentUser.class);
        questionService = new QuestionServiceImpl(
                questionRepository,
                new QuestionMapper(),
                currentUser,
                mock(ApplicationEventPublisher.class)
        );
    }

    @Test
    void createQuestion() {
        when(currentUser.userId()).thenReturn("vendor-123");
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = questionService.createQuestion(
                new CreateQuestionRequest("How do I register?", QuestionCategory.REGISTRATION)
        );

        assertThat(response.userId()).isEqualTo("vendor-123");
        assertThat(response.questionText()).isEqualTo("How do I register?");
        assertThat(response.category()).isEqualTo(QuestionCategory.REGISTRATION);
        assertThat(response.answer()).isNull();
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    void answerQuestion() {
        Question question = new Question("vendor-123", "How do I pay?", QuestionCategory.PAYMENTS);
        when(currentUser.userId()).thenReturn("admin-1");
        when(questionRepository.findWithAnswerById(10L)).thenReturn(Optional.of(question));
        when(questionRepository.save(question)).thenReturn(question);

        var response = questionService.answerQuestion(10L, new AnswerQuestionRequest("Use the payments page."));

        assertThat(response.status().name()).isEqualTo("ANSWERED");
        assertThat(response.answer()).isNotNull();
        assertThat(response.answer().answeredBy()).isEqualTo("admin-1");
        assertThat(response.answer().answerText()).isEqualTo("Use the payments page.");
    }

    @Test
    void answerQuestionRejectsSecondAnswer() {
        Question question = new Question("vendor-123", "Deadline?", QuestionCategory.DEADLINES);
        question.answer("admin-1", "Tomorrow.");
        when(questionRepository.findWithAnswerById(10L)).thenReturn(Optional.of(question));

        assertThatThrownBy(() -> questionService.answerQuestion(10L, new AnswerQuestionRequest("Another answer.")))
                .isInstanceOf(AlreadyAnsweredException.class);
    }

    @Test
    void getAllQuestions() {
        Question question = new Question("vendor-123", "How do I submit?", QuestionCategory.SUBMISSION);
        PageRequest pageable = PageRequest.of(0, 20);
        when(questionRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(question), pageable, 1));

        Page<?> response = questionService.getPublicQuestions(null, pageable);

        assertThat(response.getTotalElements()).isEqualTo(1);
        verify(questionRepository).findAll(pageable);
    }
}
