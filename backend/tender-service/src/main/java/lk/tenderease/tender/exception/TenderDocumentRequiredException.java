package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

import java.util.UUID;

/**
 * Thrown when attempting to submit a tender that has no uploaded documents.
 */
public class TenderDocumentRequiredException extends BusinessException {

    public TenderDocumentRequiredException(String message) {
        super(message);
    }

    public static TenderDocumentRequiredException of(UUID tenderId) {
        return new TenderDocumentRequiredException(
                "At least one document is required to submit tender ID: " + tenderId);
    }
}
