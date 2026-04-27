package lk.tenderease.qa.service;

public record QaAnswerCreatedEvent(Long questionId, Long answerId) {

    public String eventName() {
        return "qa.answer.created";
    }
}
