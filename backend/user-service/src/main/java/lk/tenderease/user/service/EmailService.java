package lk.tenderease.user.service;

/**
 * Service for sending emails related to officer lifecycle and notifications.
 */
public interface EmailService {

    /**
     * Sends an acknowledgment email to the newly registered officer containing their reference ID.
     */
    void sendRegistrationSuccessEmail(String toEmail, String officerName, String referenceId);

    /**
     * Sends an approval notification email to the officer.
     */
    void sendRegistrationApprovalEmail(String toEmail, String officerName, String referenceId);

    /**
     * Sends a rejection notification email to the officer with the reason.
     */
    void sendRegistrationRejectionEmail(String toEmail, String officerName, String referenceId, String reason);
}
