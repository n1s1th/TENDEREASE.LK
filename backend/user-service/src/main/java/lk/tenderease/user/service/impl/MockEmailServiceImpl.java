package lk.tenderease.user.service.impl;

import lk.tenderease.user.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Mock implementation of EmailService.
 * Renders the HTML templates using Thymeleaf and logs them to the terminal console
 * instead of sending to an actual SMTP server.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockEmailServiceImpl implements EmailService {

    private final TemplateEngine templateEngine;

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationSuccessEmail(String toEmail, String officerName, String referenceId) {
        log.info("Preparing Registration Success Email for: {}", toEmail);

        Context context = new Context();
        context.setVariable("officerName", officerName != null ? officerName : "Officer");
        context.setVariable("referenceId", referenceId);

        String htmlContent = templateEngine.process("emails/officer-registration-success", context);

        log.info("\n================ MOCK EMAIL GENERATED ================\n" +
                 "TO: {}\n" +
                 "SUBJECT: Registration Received successfully - TenderEase\n" +
                 "BODY:\n" +
                 "{}\n" +
                 "=======================================================", 
                 toEmail, htmlContent);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationApprovalEmail(String toEmail, String officerName, String referenceId) {
        log.info("\n" +
                "╔══════════════════════════════════════════════════════════════╗\n" +
                "║              📧 REGISTRATION APPROVAL EMAIL                ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║ TO:      {}                                                \n" +
                "║ SUBJECT: Registration Approved - TenderEase                ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║                                                            ║\n" +
                "║ Dear {},                                                   \n" +
                "║                                                            ║\n" +
                "║ Congratulations! Your officer registration has been        ║\n" +
                "║ APPROVED by the Chief Accounting Officer (CAO).            ║\n" +
                "║                                                            ║\n" +
                "║ Registration Reference: {}                                 \n" +
                "║                                                            ║\n" +
                "║ You can now log in to TenderEase.lk and start creating     ║\n" +
                "║ and managing government tenders.                           ║\n" +
                "║                                                            ║\n" +
                "║ Best regards,                                              ║\n" +
                "║ TenderEase Team                                            ║\n" +
                "╚══════════════════════════════════════════════════════════════╝",
                toEmail, officerName, referenceId);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationRejectionEmail(String toEmail, String officerName, String referenceId, String reason) {
        log.info("\n" +
                "╔══════════════════════════════════════════════════════════════╗\n" +
                "║              📧 REGISTRATION REJECTION EMAIL               ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║ TO:      {}                                                \n" +
                "║ SUBJECT: Registration Rejected - TenderEase                ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║                                                            ║\n" +
                "║ Dear {},                                                   \n" +
                "║                                                            ║\n" +
                "║ We regret to inform you that your officer registration     ║\n" +
                "║ has been REJECTED by the Chief Accounting Officer (CAO).   ║\n" +
                "║                                                            ║\n" +
                "║ Registration Reference: {}                                 \n" +
                "║ Reason: {}                                                 \n" +
                "║                                                            ║\n" +
                "║ If you believe this is an error, please contact the CAO    ║\n" +
                "║ office for further assistance.                             ║\n" +
                "║                                                            ║\n" +
                "║ Best regards,                                              ║\n" +
                "║ TenderEase Team                                            ║\n" +
                "╚══════════════════════════════════════════════════════════════╝",
                toEmail, officerName, referenceId, reason);
    }
}
