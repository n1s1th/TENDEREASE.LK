package lk.tenderease.notification.config;

import lk.tenderease.common.constant.AMQPConstants;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQNotificationConfig {

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(AMQPConstants.NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(AMQPConstants.NOTIFICATION_QUEUE);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(notificationExchange)
                .with(AMQPConstants.NOTIFICATION_ROUTING_KEY);
    }
}
