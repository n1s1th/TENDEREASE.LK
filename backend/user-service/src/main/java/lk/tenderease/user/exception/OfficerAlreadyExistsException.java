package lk.tenderease.user.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when attempting to register an officer with an email
 * that already exists in the system.
 */
public class OfficerAlreadyExistsException extends BusinessException {

    public OfficerAlreadyExistsException(String message) {
        super(message);
    }

    public OfficerAlreadyExistsException(String field, String value) {
        super(String.format("Officer already exists with %s: '%s'", field, value));
    }
}
