package lk.tenderease.tender.exception;

import lk.tenderease.common.exception.BusinessException;

/**
 * Thrown when the departmentId does not belong to the selected ministryId.
 */
public class InvalidMinistryDepartmentException extends BusinessException {

    public InvalidMinistryDepartmentException(String message) {
        super(message);
    }

    public static InvalidMinistryDepartmentException of(Long departmentId, Long ministryId) {
        return new InvalidMinistryDepartmentException(
                "Department ID " + departmentId + " does not belong to Ministry ID " + ministryId);
    }
}
