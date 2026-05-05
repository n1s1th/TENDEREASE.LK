package lk.tenderease.tender.producer;

import lk.tenderease.common.constant.AMQPConstants;
import lk.tenderease.common.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(NotificationEvent event) {
        log.info("Sending notification event for recipient: {} to RabbitMQ", event.getRecipient());
        sendNotification(event, AMQPConstants.NOTIFICATION_ROUTING_KEY);
    }

    public void sendNotification(NotificationEvent event, String routingKey) {
        log.info("Sending notification event for recipient: {} with routing key: {}", event.getRecipient(), routingKey);
        rabbitTemplate.convertAndSend(
            AMQPConstants.NOTIFICATION_EXCHANGE,
            routingKey,
            event
        );
    }
}
