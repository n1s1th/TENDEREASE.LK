package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

public class AddendumVersionNotFoundException extends BusinessException {

    public AddendumVersionNotFoundException(String message) {
        super(message);
    }

    public static AddendumVersionNotFoundException of(Long addendumId, Integer versionNumber) {
        return new AddendumVersionNotFoundException(
                String.format("Addendum version %d not found for addendum ID: %d", versionNumber, addendumId));
    }
}
