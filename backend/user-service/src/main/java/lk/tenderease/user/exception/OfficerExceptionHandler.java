package lk.tenderease.user.exception;

import lk.tenderease.user.dto.response.OfficerRegistrationFailureResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service-specific exception handler for officer registration errors.
 * Returns UI-compatible failure responses with support IDs.
 *
 * <p>Takes precedence over the common-library {@code GlobalExceptionHandler}
 * for officer-specific exceptions via {@code @Order(1)}.</p>
 */
@Slf4j
@RestControllerAdvice(basePackages = "lk.tenderease.user.controller")
@Order(1)
public class OfficerExceptionHandler {

    /**
     * Handles registration-specific validation exceptions.
     * Returns a response compatible with the UI failure page.
     */
    @ExceptionHandler(OfficerRegistrationException.class)
    public ResponseEntity<OfficerRegistrationFailureResponse> handleRegistrationException(
            OfficerRegistrationException ex) {
        log.warn("Officer registration failed [supportId={}]: {}", ex.getSupportId(), ex.getErrors());

        final OfficerRegistrationFailureResponse response = OfficerRegistrationFailureResponse.builder()
                .success(false)
                .message("Registration failed")
                .errorCode("VALIDATION_ERROR")
                .errors(ex.getErrors())
                .supportId(ex.getSupportId())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles duplicate officer exceptions.
     */
    @ExceptionHandler(OfficerAlreadyExistsException.class)
    public ResponseEntity<OfficerRegistrationFailureResponse> handleAlreadyExists(
            OfficerAlreadyExistsException ex) {
        log.warn("Officer already exists: {}", ex.getMessage());

        final OfficerRegistrationFailureResponse response = OfficerRegistrationFailureResponse.builder()
                .success(false)
                .message("Registration failed")
                .errorCode("DUPLICATE_ERROR")
                .errors(java.util.List.of(ex.getMessage()))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles invalid NIC format exceptions.
     */
    @ExceptionHandler(InvalidNICException.class)
    public ResponseEntity<OfficerRegistrationFailureResponse> handleInvalidNIC(
            InvalidNICException ex) {
        log.warn("Invalid NIC: {}", ex.getMessage());

        final OfficerRegistrationFailureResponse response = OfficerRegistrationFailureResponse.builder()
                .success(false)
                .message("Registration failed")
                .errorCode("VALIDATION_ERROR")
                .errors(java.util.List.of(ex.getMessage()))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles invalid officer status transition exceptions.
     */
    @ExceptionHandler(InvalidOfficerStatusException.class)
    public ResponseEntity<OfficerRegistrationFailureResponse> handleInvalidStatus(
            InvalidOfficerStatusException ex) {
        log.warn("Invalid officer status transition: {}", ex.getMessage());

        final OfficerRegistrationFailureResponse response = OfficerRegistrationFailureResponse.builder()
                .success(false)
                .message("Operation failed")
                .errorCode("INVALID_STATUS")
                .errors(java.util.List.of(ex.getMessage()))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles Jakarta Bean Validation (@Valid) failures from the controller layer.
     * Extracts field-level errors and returns them as human-readable messages
     * in the same OfficerRegistrationFailureResponse format.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<OfficerRegistrationFailureResponse> handleValidationException(
            MethodArgumentNotValidException ex) {
        final List<String> fieldErrors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    if (error instanceof FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .collect(Collectors.toList());

        log.warn("Officer registration validation failed: {}", fieldErrors);

        final OfficerRegistrationFailureResponse response = OfficerRegistrationFailureResponse.builder()
                .success(false)
                .message("Registration failed")
                .errorCode("VALIDATION_ERROR")
                .errors(fieldErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
