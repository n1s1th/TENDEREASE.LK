package lk.tenderease.tender.producer;

import lk.tenderease.common.constant.AMQPConstants;
import lk.tenderease.common.event.TenderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenderEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendTenderStatusEvent(TenderEvent event) {
        log.info("Publishing tender status event: {} for tender {}", event.getEventType(), event.getTenderId());
        try {
            rabbitTemplate.convertAndSend(AMQPConstants.REPORTING_EXCHANGE, AMQPConstants.KPI_TENDER_ROUTING_KEY, event);
        } catch (Exception e) {
            log.error("Failed to send tender status event to RabbitMQ: {}", e.getMessage());
        }
    }
}
