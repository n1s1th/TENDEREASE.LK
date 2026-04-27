package lk.tenderease.notification.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationRabbitMQConfig {

    @Value("${rabbitmq.exchanges.tender:tender.exchange}")
    private String tenderExchangeName;

    @Value("${rabbitmq.queues.document-generated:tender.document.generated.queue}")
    private String documentGeneratedQueueName;

    @Value("${rabbitmq.routing-keys.document-generated:document.generated}")
    private String documentGeneratedRoutingKey;

    @Value("${rabbitmq.queues.tender-submitted:tender.submitted.queue}")
    private String tenderSubmittedQueueName;

    @Value("${rabbitmq.routing-keys.tender-submitted:tender.submitted}")
    private String tenderSubmittedRoutingKey;

    @Bean
    public TopicExchange tenderExchange() {
        return new TopicExchange(tenderExchangeName);
    }

    @Bean
    public Queue documentGeneratedQueue() {
        return new Queue(documentGeneratedQueueName, true);
    }

    @Bean
    public Queue tenderSubmittedQueue() {
        return new Queue(tenderSubmittedQueueName, true);
    }

    @Bean
    public Binding documentGeneratedBinding(Queue documentGeneratedQueue, TopicExchange tenderExchange) {
        return BindingBuilder
                .bind(documentGeneratedQueue)
                .to(tenderExchange)
                .with(documentGeneratedRoutingKey);
    }

    @Bean
    public Binding tenderSubmittedBinding(Queue tenderSubmittedQueue, TopicExchange tenderExchange) {
        return BindingBuilder
                .bind(tenderSubmittedQueue)
                .to(tenderExchange)
                .with(tenderSubmittedRoutingKey);
    }
}
