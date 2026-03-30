package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when attempting to modify a tender that is not in DRAFT status.
 */
public class TenderNotEditableException extends BusinessException {

    public TenderNotEditableException(String message) {
        super(message);
    }

    public static TenderNotEditableException of(String status) {
        return new TenderNotEditableException(
                "Tender cannot be modified. Current status: " + status + ". Only DRAFT tenders are editable.");
    }
}
