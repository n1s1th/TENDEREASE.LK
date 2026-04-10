package lk.tenderease.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Component;

/**
 * Publisher for officer-related events to RabbitMQ.
 *
 * <p>Publishes events to {@code officer.exchange} with routing keys:</p>
 * <ul>
 *   <li>{@code officer.registered} – when a new officer submits registration</li>
 *   <li>{@code officer.approved} – when admin approves an officer</li>
 *   <li>{@code officer.rejected} – when admin rejects an officer</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OfficerEventPublisher {

    public static final String EXCHANGE = "officer.exchange";
    public static final String REGISTERED_KEY = "officer.registered";
    public static final String APPROVED_KEY = "officer.approved";
    public static final String REJECTED_KEY = "officer.rejected";

    private final AmqpTemplate amqpTemplate;

    /**
     * Publish an officer registered event.
     *
     * @param event the officer event
     */
    public void publishRegistered(OfficerEvent event) {
        publish(REGISTERED_KEY, event);
    }

    /**
     * Publish an officer approved event.
     *
     * @param event the officer event
     */
    public void publishApproved(OfficerEvent event) {
        publish(APPROVED_KEY, event);
    }

    /**
     * Publish an officer rejected event.
     *
     * @param event the officer event
     */
    public void publishRejected(OfficerEvent event) {
        publish(REJECTED_KEY, event);
    }

    private void publish(String routingKey, OfficerEvent event) {
        try {
            log.info("Publishing officer event [routingKey={}, referenceId={}]",
                    routingKey, event.getReferenceId());
            amqpTemplate.convertAndSend(EXCHANGE, routingKey, event);
            log.info("Successfully published officer event [routingKey={}]", routingKey);
        } catch (Exception e) {
            log.error("Failed to publish officer event [routingKey={}, referenceId={}]: {}",
                    routingKey, event.getReferenceId(), e.getMessage(), e);
            // Don't rethrow — event publishing failure should not break the registration flow
        }
    }
}
