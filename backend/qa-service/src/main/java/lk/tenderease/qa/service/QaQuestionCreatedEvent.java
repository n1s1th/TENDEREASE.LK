package lk.tenderease.qa.service;

public record QaQuestionCreatedEvent(Long questionId) {

    public String eventName() {
        return "qa.question.created";
    }
}
