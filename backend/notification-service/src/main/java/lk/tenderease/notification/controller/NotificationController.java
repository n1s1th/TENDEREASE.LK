package lk.tenderease.notification.controller;

import lk.tenderease.notification.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow requests from Next.js frontend
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<String> sendCustomEmail(@RequestBody EmailRequest request) {
        log.info("Received request to send custom email to: {}", request.getTo());
        try {
            if (request.getIsHtml() != null && request.getIsHtml()) {
                emailService.sendHtmlEmail(request.getTo(), request.getSubject(), request.getBody());
            } else {
                emailService.sendEmail(request.getTo(), request.getSubject(), request.getBody());
            }
            return ResponseEntity.ok("Email sent successfully to " + request.getTo());
        } catch (Exception e) {
            log.error("Error sending custom email: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }

    @Data
    public static class EmailRequest {
        private String to;
        private String subject;
        private String body;
        private Boolean isHtml = true;
    }
}
