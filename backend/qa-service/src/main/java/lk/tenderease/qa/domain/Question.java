package lk.tenderease.qa.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String userId;

    @Column(nullable = false, columnDefinition = "text")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuestionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuestionStatus status;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Answer answer;

    protected Question() {
    }

    public Question(String userId, String questionText, QuestionCategory category) {
        this.userId = userId;
        this.questionText = questionText;
        this.category = category;
        this.status = QuestionStatus.PENDING;
        this.createdAt = OffsetDateTime.now();
    }

    public void answer(String answeredBy, String answerText) {
        Answer newAnswer = new Answer(this, answeredBy, answerText);
        this.answer = newAnswer;
        this.status = QuestionStatus.ANSWERED;
    }

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public QuestionCategory getCategory() {
        return category;
    }

    public QuestionStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public Answer getAnswer() {
        return answer;
    }
}
