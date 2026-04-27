package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

import java.util.UUID;

/**
 * Thrown when a tender with the given ID does not exist.
 */
public class TenderNotFoundException extends BusinessException {

    public TenderNotFoundException(String message) {
        super(message);
    }

    public static TenderNotFoundException of(UUID id) {
        return new TenderNotFoundException("Tender not found with ID: " + id);
    }
}
