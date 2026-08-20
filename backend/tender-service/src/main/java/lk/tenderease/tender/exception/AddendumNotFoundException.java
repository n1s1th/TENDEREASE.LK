package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

public class AddendumNotFoundException extends BusinessException {

    public AddendumNotFoundException(String message) {
        super(message);
    }

    public static AddendumNotFoundException of(Long addendumId) {
        return new AddendumNotFoundException("Addendum not found with ID: " + addendumId);
    }
}
