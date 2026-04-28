package lk.tenderease.user.exception;

import lk.tenderease.common.exception.BadRequestException;

/**
 * Thrown when a NIC number doesn't match the Sri Lankan format.
 * Valid formats: 9 digits + V/X (old) or 12 digits (new).
 */
public class InvalidNICException extends BadRequestException {

    public InvalidNICException(String nic) {
        super(String.format("NIC format is invalid: '%s'. Must be 9 digits + V/X or 12 digits.", nic));
    }
}
