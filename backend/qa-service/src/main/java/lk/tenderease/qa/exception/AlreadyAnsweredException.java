package lk.tenderease.qa.exception;

public class AlreadyAnsweredException extends RuntimeException {

    public AlreadyAnsweredException(Long questionId) {
        super("Question " + questionId + " has already been answered");
    }
}
