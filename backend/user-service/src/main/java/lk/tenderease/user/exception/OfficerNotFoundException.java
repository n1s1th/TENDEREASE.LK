package lk.tenderease.user.exception;

import lk.tenderease.common.exception.ResourceNotFoundException;

/**
 * Thrown when an officer cannot be found by ID or reference number.
 */
public class OfficerNotFoundException extends ResourceNotFoundException {

    public OfficerNotFoundException(String message) {
        super(message);
    }

    public OfficerNotFoundException(String field, Object value) {
        super("Officer", field, value);
    }
}
