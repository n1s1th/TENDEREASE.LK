package lk.tenderease.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@tenderease.lk}")
    private String fromAddress;

    // ✅ BASIC TEXT EMAIL
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Successfully sent email to {}", to);

        } catch (Exception ex) {
            log.error("Failed to send email to {}. [MOCK LOG] Subject: {} | Body: {}", to, subject, body);
            log.error("Error Detail: {}. Ensure mail server is running.", ex.getMessage());
            // We catch and log but don't re-throw to avoid RabbitMQ retry loops in local dev
        }
    }

    // ✅ HTML EMAIL
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("Sending HTML email to: {} with subject: {}", to, subject);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("HTML email sent successfully to {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}. [MOCK LOG] Subject: {} | Content: {}", to, subject, htmlBody);
            log.error("Error Detail: {}. Ensure mail server is running.", e.getMessage());
            // We catch and log but don't re-throw to avoid RabbitMQ retry loops in local dev
        }
    }

    // ✅ EMAIL WITH ATTACHMENT
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            if (attachment != null) {
                helper.addAttachment(filename, new ByteArrayResource(attachment));
            }

            mailSender.send(message);
            log.info("Email with attachment sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send email with attachment to {}. [MOCK LOG] Subject: {} | Body: {}", to, subject, body);
            log.error("Error Detail: {}. Ensure mail server is running.", e.getMessage());
            // We catch and log but don't re-throw to avoid RabbitMQ retry loops in local dev
        }
    }
}