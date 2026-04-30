package lk.tenderease.user.service;

/**
 * Service for sending emails related to officer lifecycle and notifications.
 */
public interface EmailService {

    /**
     * Sends an acknowledgment email to the newly registered officer containing their reference ID.
     *
     * @param toEmail     The recipient's email address
     * @param officerName The liaison officer's name
     * @param referenceId The uniquely generated tracking reference ID
     */
    void sendRegistrationSuccessEmail(String toEmail, String officerName, String referenceId);

}
