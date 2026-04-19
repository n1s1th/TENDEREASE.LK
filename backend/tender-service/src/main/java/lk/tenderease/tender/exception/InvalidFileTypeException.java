package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when an uploaded file is not of an allowed type (PDF, DOC, DOCX).
 */
public class InvalidFileTypeException extends BusinessException {

    public InvalidFileTypeException(String message) {
        super(message);
    }

    public static InvalidFileTypeException of(String mimeType) {
        return new InvalidFileTypeException(
                "File type not allowed: " + mimeType + ". Allowed types: PDF, DOC, DOCX.");
    }
}
