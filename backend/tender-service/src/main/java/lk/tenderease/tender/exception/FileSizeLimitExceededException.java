package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when an uploaded file exceeds the maximum allowed size of 50 MB.
 */
public class FileSizeLimitExceededException extends BusinessException {

    public FileSizeLimitExceededException(String message) {
        super(message);
    }

    public static FileSizeLimitExceededException of(long fileSizeBytes) {
        return new FileSizeLimitExceededException(
                "File size " + (fileSizeBytes / (1024 * 1024)) + " MB exceeds the maximum allowed size of 50 MB.");
    }
}
