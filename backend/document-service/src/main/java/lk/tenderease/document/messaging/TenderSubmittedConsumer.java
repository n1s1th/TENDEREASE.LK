package lk.tenderease.document.messaging;

import lk.tenderease.document.client.TenderClient;
import lk.tenderease.document.dto.event.TenderDocumentGeneratedEvent;
import lk.tenderease.document.service.PdfGeneratorService;
import lk.tenderease.tender.dto.event.TenderSubmittedEvent;
import lk.tenderease.tender.dto.response.TenderDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenderSubmittedConsumer {

    private final TenderClient tenderClient;
    private final PdfGeneratorService pdfGeneratorService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.tender:tender.exchange}")
    private String tenderExchangeName;

    @Value("${rabbitmq.routing-keys.document-generated:document.generated}")
    private String documentGeneratedRoutingKey;

    @RabbitListener(queues = "${rabbitmq.queues.tender-submitted-doc:tender.submitted.document.queue}")
    public void handleTenderSubmitted(TenderSubmittedEvent event) {
        log.info("Received TenderSubmittedEvent for tender: {}", event.getTenderNumber());
        try {
            // 1. Fetch full tender details from Tender Service
            TenderDetailResponse tenderDetail = tenderClient.getTenderById(event.getTenderId());

            // 2. Generate PDF
            byte[] pdfContent = pdfGeneratorService.generateTenderReviewPdf(tenderDetail);

            // 3. Publish Document Generated Event
            TenderDocumentGeneratedEvent generatedEvent = TenderDocumentGeneratedEvent.builder()
                    .tenderId(event.getTenderId())
                    .tenderNumber(event.getTenderNumber())
                    .title(event.getTitle())
                    .pdfContent(pdfContent)
                    .fileName("Tender_Review_" + event.getTenderNumber() + ".pdf")
                    .build();

            log.info("Publishing TenderDocumentGeneratedEvent for tender: {}", event.getTenderNumber());
            rabbitTemplate.convertAndSend(tenderExchangeName, documentGeneratedRoutingKey, generatedEvent);

        } catch (Exception e) {
            log.error("Error processing TenderSubmittedEvent for tender {}: {}", event.getTenderNumber(), e.getMessage());
        }
    }
}
