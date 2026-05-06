package lk.tenderease.evaluation.exception;

import lk.tenderease.common.exception.ResourceNotFoundException;

import java.util.UUID;

public class EvaluationNotFoundException extends ResourceNotFoundException {
    public EvaluationNotFoundException(String message) {
        super(message);
    }

    public EvaluationNotFoundException(UUID id) {
        super("Evaluation", "id", id);
    }
}
