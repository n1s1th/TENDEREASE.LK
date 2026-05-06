package lk.tenderease.user.producer;

import lk.tenderease.common.constant.AMQPConstants;
import lk.tenderease.common.event.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserEvent(UserEvent event) {
        log.info("Publishing user event: {} for user {}", event.getEventType(), event.getUserId());
        try {
            rabbitTemplate.convertAndSend(AMQPConstants.REPORTING_EXCHANGE, AMQPConstants.KPI_USER_ROUTING_KEY, event);
        } catch (Exception e) {
            log.error("Failed to send user event to RabbitMQ: {}", e.getMessage());
        }
    }
}
