package lk.tenderease.qa.service;

import lk.tenderease.qa.domain.Question;
import lk.tenderease.qa.domain.QuestionCategory;
import lk.tenderease.qa.domain.QuestionStatus;
import lk.tenderease.qa.dto.AnswerQuestionRequest;
import lk.tenderease.qa.dto.CreateQuestionRequest;
import lk.tenderease.qa.dto.QuestionResponse;
import lk.tenderease.qa.exception.AlreadyAnsweredException;
import lk.tenderease.qa.exception.QuestionNotFoundException;
import lk.tenderease.qa.repository.QuestionRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;
    private final CurrentUser currentUser;
    private final ApplicationEventPublisher eventPublisher;

    public QuestionServiceImpl(
            QuestionRepository questionRepository,
            QuestionMapper questionMapper,
            CurrentUser currentUser,
            ApplicationEventPublisher eventPublisher
    ) {
        this.questionRepository = questionRepository;
        this.questionMapper = questionMapper;
        this.currentUser = currentUser;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Cacheable(value = "qa:questions", key = "{#category, #pageable.pageNumber, #pageable.pageSize, #pageable.sort}")
    public Page<QuestionResponse> getPublicQuestions(QuestionCategory category, Pageable pageable) {
        Page<Question> questions = category == null
                ? questionRepository.findAll(pageable)
                : questionRepository.findByCategory(category, pageable);
        return questions.map(questionMapper::toResponse);
    }

    @Override
    public QuestionResponse getQuestion(Long id) {
        return questionMapper.toResponse(findQuestion(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"qa:questions", "qa:questions:status"}, allEntries = true)
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        Question question = new Question(currentUser.userIdOrAnonymous(), request.questionText(), request.category());
        Question saved = questionRepository.save(question);
        eventPublisher.publishEvent(new QaQuestionCreatedEvent(saved.getId()));
        return questionMapper.toResponse(saved);
    }

    @Override
    public Page<QuestionResponse> getMyQuestions(Pageable pageable) {
        return questionRepository.findByUserId(currentUser.userId(), pageable)
                .map(questionMapper::toResponse);
    }

    @Override
    public Page<QuestionResponse> getAdminQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable)
                .map(questionMapper::toResponse);
    }

    @Override
    @Cacheable(value = "qa:questions:status", key = "{#status, #pageable.pageNumber, #pageable.pageSize, #pageable.sort}")
    public Page<QuestionResponse> getQuestionsByStatus(QuestionStatus status, Pageable pageable) {
        return questionRepository.findByStatus(status, pageable)
                .map(questionMapper::toResponse);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"qa:questions", "qa:questions:status"}, allEntries = true)
    public QuestionResponse answerQuestion(Long id, AnswerQuestionRequest request) {
        Question question = findQuestion(id);
        if (question.getStatus() == QuestionStatus.ANSWERED || question.getAnswer() != null) {
            throw new AlreadyAnsweredException(id);
        }

        question.answer(currentUser.userId(), request.answerText());
        Question saved = questionRepository.save(question);
        eventPublisher.publishEvent(new QaAnswerCreatedEvent(saved.getId(), saved.getAnswer().getId()));
        return questionMapper.toResponse(saved);
    }

    private Question findQuestion(Long id) {
        return questionRepository.findWithAnswerById(id)
                .orElseThrow(() -> new QuestionNotFoundException(id));
    }
}
