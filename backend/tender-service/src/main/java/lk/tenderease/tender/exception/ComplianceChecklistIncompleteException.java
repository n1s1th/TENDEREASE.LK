package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

import java.util.UUID;

/**
 * Thrown when attempting to submit a tender whose compliance checklist is incomplete.
 */
public class ComplianceChecklistIncompleteException extends BusinessException {

    public ComplianceChecklistIncompleteException(String message) {
        super(message);
    }

    public static ComplianceChecklistIncompleteException of(UUID tenderId) {
        return new ComplianceChecklistIncompleteException(
                "All compliance checklist items must be completed before submitting tender ID: " + tenderId);
    }
}
