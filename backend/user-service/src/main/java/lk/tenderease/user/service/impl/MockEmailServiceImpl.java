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

        // 1. Setup Thymeleaf context variables
        Context context = new Context();
        context.setVariable("officerName", officerName != null ? officerName : "Officer");
        context.setVariable("referenceId", referenceId);

        // 2. Render the HTML using the template in resources/templates/emails/officer-registration-success.html
        String htmlContent = templateEngine.process("emails/officer-registration-success", context);

        // 3. Log it instead of sending over network
        log.info("\n================ MOCK EMAIL GENERATED ================\n" +
                 "TO: {}\n" +
                 "SUBJECT: Registration Received successfully - TenderEase\n" +
                 "BODY:\n" +
                 "{}\n" +
                 "=======================================================", 
                 toEmail, htmlContent);
    }
}
