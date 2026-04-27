package lk.tenderease.user.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for officer-related exchanges, queues, and bindings.
 *
 * <p>Exchange: {@code officer.exchange} (Topic)</p>
 * <p>Queues:</p>
 * <ul>
 *   <li>{@code officer.registered.queue}</li>
 *   <li>{@code officer.approved.queue}</li>
 *   <li>{@code officer.rejected.queue}</li>
 *   <li>{@code officer.notification.queue} – for notification service consumption</li>
 * </ul>
 */
@Configuration
public class OfficerRabbitMQConfig {

    public static final String OFFICER_EXCHANGE = "officer.exchange";

    public static final String REGISTERED_QUEUE = "officer.registered.queue";
    public static final String APPROVED_QUEUE = "officer.approved.queue";
    public static final String REJECTED_QUEUE = "officer.rejected.queue";
    public static final String NOTIFICATION_QUEUE = "officer.notification.queue";

    public static final String REGISTERED_KEY = "officer.registered";
    public static final String APPROVED_KEY = "officer.approved";
    public static final String REJECTED_KEY = "officer.rejected";

    // ──── Exchange ────

    @Bean
    public TopicExchange officerExchange() {
        return ExchangeBuilder
                .topicExchange(OFFICER_EXCHANGE)
                .durable(true)
                .build();
    }

    // ──── Queues ────

    @Bean
    public Queue officerRegisteredQueue() {
        return QueueBuilder.durable(REGISTERED_QUEUE).build();
    }

    @Bean
    public Queue officerApprovedQueue() {
        return QueueBuilder.durable(APPROVED_QUEUE).build();
    }

    @Bean
    public Queue officerRejectedQueue() {
        return QueueBuilder.durable(REJECTED_QUEUE).build();
    }

    @Bean
    public Queue officerNotificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // ──── Bindings ────

    @Bean
    public Binding registeredBinding() {
        return BindingBuilder
                .bind(officerRegisteredQueue())
                .to(officerExchange())
                .with(REGISTERED_KEY);
    }

    @Bean
    public Binding approvedBinding() {
        return BindingBuilder
                .bind(officerApprovedQueue())
                .to(officerExchange())
                .with(APPROVED_KEY);
    }

    @Bean
    public Binding rejectedBinding() {
        return BindingBuilder
                .bind(officerRejectedQueue())
                .to(officerExchange())
                .with(REJECTED_KEY);
    }

    @Bean
    public Binding notificationRegisteredBinding() {
        return BindingBuilder
                .bind(officerNotificationQueue())
                .to(officerExchange())
                .with("officer.*");
    }
}
