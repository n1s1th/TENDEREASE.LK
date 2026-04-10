package lk.tenderease.user.exception;

import lk.tenderease.common.exception.BusinessException;
import lombok.Getter;

import java.util.List;

/**
 * Thrown when officer registration fails due to multiple validation errors.
 * Carries the list of error messages and a support ID for troubleshooting.
 */
@Getter
public class OfficerRegistrationException extends BusinessException {

    private final List<String> errors;
    private final String supportId;

    public OfficerRegistrationException(List<String> errors, String supportId) {
        super("Registration failed due to validation errors");
        this.errors = errors;
        this.supportId = supportId;
    }
}
