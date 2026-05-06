package lk.tenderease.qa.exception;

public class QuestionNotFoundException extends RuntimeException {

    public QuestionNotFoundException(Long questionId) {
        super("Question " + questionId + " was not found");
    }
}
