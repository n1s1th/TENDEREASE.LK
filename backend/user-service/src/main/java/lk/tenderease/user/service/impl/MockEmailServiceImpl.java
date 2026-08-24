package lk.tenderease.user.service.impl;

import lk.tenderease.user.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockEmailServiceImpl implements EmailService {

    private final TemplateEngine templateEngine;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String NOTIFICATION_SERVICE_URL = "http://notification-service:8089/api/v1/notifications/email";

    private void sendRealEmail(String to, String subject, String htmlBody) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", to);
            payload.put("subject", subject);
            payload.put("body", htmlBody);
            payload.put("isHtml", true);
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL, payload, String.class);
            log.info("Successfully sent real email to {}", to);
        } catch (Exception e) {
            log.error("Failed to send real email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationSuccessEmail(String toEmail, String officerName, String referenceId) {
        log.info("Preparing Registration Success Email for: {}", toEmail);

        Context context = new Context();
        context.setVariable("officerName", officerName != null ? officerName : "Officer");
        context.setVariable("referenceId", referenceId);

        String htmlContent = templateEngine.process("emails/officer-registration-success", context);
        sendRealEmail(toEmail, "Registration Received successfully - TenderEase", htmlContent);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationApprovalEmail(String toEmail, String officerName, String referenceId) {
        log.info("Preparing Registration Approval Email for: {}", toEmail);

        Context context = new Context();
        context.setVariable("officerName", officerName != null ? officerName : "Officer");
        context.setVariable("referenceId", referenceId);

        String htmlContent = templateEngine.process("emails/officer-registration-approved", context);
        sendRealEmail(toEmail, "Registration Approved - TenderEase", htmlContent);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendRegistrationRejectionEmail(String toEmail, String officerName, String referenceId, String reason) {
        log.info("Preparing Registration Rejection Email for: {}", toEmail);

        Context context = new Context();
        context.setVariable("officerName", officerName != null ? officerName : "Officer");
        context.setVariable("referenceId", referenceId);
        context.setVariable("reason", reason != null ? reason : "Not specified");

        String htmlContent = templateEngine.process("emails/officer-registration-rejected", context);
        sendRealEmail(toEmail, "Registration Rejected - TenderEase", htmlContent);
    }
}
