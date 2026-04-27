package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

import java.util.UUID;

/**
 * Thrown when a document with the given ID does not exist for the specified tender.
 */
public class TenderDocumentNotFoundException extends BusinessException {

    public TenderDocumentNotFoundException(String message) {
        super(message);
    }

    public static TenderDocumentNotFoundException of(UUID docId) {
        return new TenderDocumentNotFoundException(
                "Tender document not found with ID: " + docId);
    }
}
