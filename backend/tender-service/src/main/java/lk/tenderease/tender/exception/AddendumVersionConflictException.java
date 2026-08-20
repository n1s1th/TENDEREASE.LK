package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

public class AddendumVersionConflictException extends BusinessException {

    public AddendumVersionConflictException(String message) {
        super(message);
    }

    public AddendumVersionConflictException(String message, Throwable cause) {
        super(message);
        initCause(cause);
    }

    public static AddendumVersionConflictException of(Long addendumId, Integer versionNumber) {
        return new AddendumVersionConflictException(
                String.format("Version %d already exists for addendum ID: %d due to concurrent upload", versionNumber, addendumId));
    }
}
