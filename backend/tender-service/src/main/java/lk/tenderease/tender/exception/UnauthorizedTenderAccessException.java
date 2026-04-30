package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when a user tries to access a tender they do not own and is not an ADMIN.
 */
public class UnauthorizedTenderAccessException extends BusinessException {

    public UnauthorizedTenderAccessException(String message) {
        super(message);
    }

    public static UnauthorizedTenderAccessException of(String callerUserId) {
        return new UnauthorizedTenderAccessException(
                "User '" + callerUserId + "' is not authorized to access or modify this tender.");
    }
}
