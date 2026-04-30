package lk.tenderease.evaluation.exception;

import lk.tenderease.common.exception.UnauthorizedException;

public class UnauthorizedEvaluationException extends UnauthorizedException {
    public UnauthorizedEvaluationException(String message) {
        super(message);
    }
}
