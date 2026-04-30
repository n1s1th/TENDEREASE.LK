package lk.tenderease.evaluation.exception;

import lk.tenderease.common.exception.BusinessException;

public class EvaluationAlreadyCompletedException extends BusinessException {
    public EvaluationAlreadyCompletedException(String message) {
        super(message);
    }
}
