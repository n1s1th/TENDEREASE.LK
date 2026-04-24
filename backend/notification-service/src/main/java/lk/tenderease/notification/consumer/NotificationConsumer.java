package lk.tenderease.notification.consumer;

import lk.tenderease.common.constant.AMQPConstants;
import lk.tenderease.common.event.NotificationEvent;
import lk.tenderease.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = AMQPConstants.NOTIFICATION_QUEUE)
    public void consumeNotification(NotificationEvent event) {
        log.info("Received notification event for recipient: {}", event.getRecipient());
        
        if ("EMAIL".equalsIgnoreCase(event.getType())) {
            emailService.sendEmail(
                event.getRecipient(),
                event.getSubject(),
                event.getMessage()
            );
        } else {
            log.warn("Unsupported notification type: {}", event.getType());
        }
    }
}
