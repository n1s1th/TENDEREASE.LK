package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when pre-bid meeting is enabled but date and/or time are not provided.
 */
public class PreBidMeetingDateRequiredException extends BusinessException {

    public PreBidMeetingDateRequiredException(String message) {
        super(message);
    }

    public static PreBidMeetingDateRequiredException create() {
        return new PreBidMeetingDateRequiredException(
                "Pre-bid meeting date and time are required when pre-bid meeting is enabled.");
    }
}
