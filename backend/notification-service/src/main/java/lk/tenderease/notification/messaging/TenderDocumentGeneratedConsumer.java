package lk.tenderease.notification.messaging;

import lk.tenderease.notification.dto.event.TenderDocumentGeneratedEvent;
import lk.tenderease.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenderDocumentGeneratedConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queues.document-generated:tender.document.generated.queue}")
    public void handleDocumentGenerated(TenderDocumentGeneratedEvent event) {
        log.info("Received TenderDocumentGeneratedEvent for tender: {}", event.getTenderNumber());

        String to = "nisith.nimdinu@gmail.com";
        String subject = "Tender Submission for Approval: " + event.getTenderNumber();
        String body = String.format(
                "<h3>Tender Submission Review</h3>" +
                "<p>Tender <b>%s - %s</b> has been submitted for approval.</p>" +
                "<p>Please find the attached review document for your consideration.</p>" +
                "<p>Regards,<br>TenderEase System</p>",
                event.getTenderNumber(), event.getTitle()
        );

        emailService.sendEmailWithAttachment(to, subject, body, event.getPdfContent(), event.getFileName());
    }
}
