package lk.tenderease.qa.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private Question question;

    @Column(nullable = false, length = 100)
    private String answeredBy;

    @Column(nullable = false, columnDefinition = "text")
    private String answerText;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected Answer() {
    }

    public Answer(Question question, String answeredBy, String answerText) {
        this.question = question;
        this.answeredBy = answeredBy;
        this.answerText = answerText;
        this.createdAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Question getQuestion() {
        return question;
    }

    public String getAnsweredBy() {
        return answeredBy;
    }

    public String getAnswerText() {
        return answerText;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
