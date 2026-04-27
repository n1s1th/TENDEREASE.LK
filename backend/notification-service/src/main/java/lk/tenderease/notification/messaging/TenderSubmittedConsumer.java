package lk.tenderease.notification.messaging;

import lk.tenderease.notification.service.EmailService;
import lk.tenderease.tender.dto.event.TenderSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenderSubmittedConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queues.tender-submitted:tender.submitted.queue}")
    public void handleTenderSubmitted(TenderSubmittedEvent event) {
        log.info("Received TenderSubmittedEvent for tender: {}", event.getTenderNumber());

        String to = "nisith.nimdinu@gmail.com";
        String subject = "Tender Submission Confirmation - " + event.getTenderNumber();
        
        String formattedDate = event.getSubmittedAt() != null 
            ? event.getSubmittedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            : "N/A";

        String htmlBody = "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>" +
                "    <div style='background-color: #0056b3; color: #ffffff; padding: 20px; text-align: center;'>" +
                "      <h1 style='margin: 0;'>Tender Submission</h1>" +
                "    </div>" +
                "    <div style='padding: 20px;'>" +
                "      <p>Dear Administrator,</p>" +
                "      <p>A new tender has been successfully submitted for approval in the TenderEase system.</p>" +
                "      <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "        <table style='width: 100%; border-collapse: collapse;'>" +
                "          <tr><td style='padding: 5px 0; font-weight: bold; width: 150px;'>Reference No:</td><td>" + event.getTenderNumber() + "</td></tr>" +
                "          <tr><td style='padding: 5px 0; font-weight: bold;'>Tender Title:</td><td>" + event.getTitle() + "</td></tr>" +
                "          <tr><td style='padding: 5px 0; font-weight: bold;'>Submitted By:</td><td>" + event.getSubmittedBy() + "</td></tr>" +
                "          <tr><td style='padding: 5px 0; font-weight: bold;'>Submitted At:</td><td>" + formattedDate + "</td></tr>" +
                "        </table>" +
                "      </div>" +
                "      <p>Please log in to the procurement dashboard to review the details and proceed with the approval workflow.</p>" +
                "      <div style='text-align: center; margin-top: 30px;'>" +
                "        <a href='http://localhost:3000/dashboard' style='background-color: #0056b3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View Dashboard</a>" +
                "      </div>" +
                "    </div>" +
                "    <div style='background-color: #f1f1f1; color: #777; padding: 10px; text-align: center; font-size: 12px;'>" +
                "      <p>This is an automated notification from TenderEase. Please do not reply to this email.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";

        emailService.sendHtmlEmail(to, subject, htmlBody);
    }
}
