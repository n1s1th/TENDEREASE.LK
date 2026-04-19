package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when the SBD template's procurement type does not match the tender's procurement type.
 */
public class SbdTemplateMismatchException extends BusinessException {

    public SbdTemplateMismatchException(String message) {
        super(message);
    }

    public static SbdTemplateMismatchException of(Long sbdTemplateId, String expected, String actual) {
        return new SbdTemplateMismatchException(
                "SBD Template ID " + sbdTemplateId + " procurement type '" + actual
                        + "' does not match tender procurement type '" + expected + "'.");
    }
}
