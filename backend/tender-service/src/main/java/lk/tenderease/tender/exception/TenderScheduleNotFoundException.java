package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

import java.util.UUID;

/**
 * Thrown when the schedule for a tender has not been saved yet.
 */
public class TenderScheduleNotFoundException extends BusinessException {

    public TenderScheduleNotFoundException(String message) {
        super(message);
    }

    public static TenderScheduleNotFoundException of(UUID tenderId) {
        return new TenderScheduleNotFoundException(
                "Schedule not found for tender ID: " + tenderId);
    }
}
