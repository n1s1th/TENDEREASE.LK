package lk.tenderease.user.exception;

import lk.tenderease.common.exception.BadRequestException;

/**
 * Thrown when an officer status transition is invalid.
 * For example, trying to approve an already-rejected officer.
 */
public class InvalidOfficerStatusException extends BadRequestException {

    public InvalidOfficerStatusException(String currentStatus, String attemptedAction) {
        super(String.format("Cannot %s officer in '%s' status.", attemptedAction, currentStatus));
    }
}
