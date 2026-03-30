package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when a tender number already exists in the system.
 */
public class DuplicateTenderNumberException extends BusinessException {

    public DuplicateTenderNumberException(String message) {
        super(message);
    }

    public static DuplicateTenderNumberException of(String tenderNumber) {
        return new DuplicateTenderNumberException(
                "Tender number already exists: " + tenderNumber);
    }
}
