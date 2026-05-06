package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when schedule date ordering rules are violated.
 */
public class InvalidScheduleDatesException extends BusinessException {

    public InvalidScheduleDatesException(String message) {
        super(message);
    }

    public static InvalidScheduleDatesException of(String reason) {
        return new InvalidScheduleDatesException("Invalid schedule dates: " + reason);
    }
}
