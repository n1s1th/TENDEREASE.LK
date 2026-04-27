package lk.tenderease.document.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DocumentRabbitMQConfig {

    @Value("${rabbitmq.exchanges.tender:tender.exchange}")
    private String tenderExchangeName;

    @Value("${rabbitmq.queues.tender-submitted-doc:tender.submitted.document.queue}")
    private String tenderSubmittedQueueName;

    @Value("${rabbitmq.routing-keys.tender-submitted:tender.submitted}")
    private String tenderSubmittedRoutingKey;

    @Bean
    public TopicExchange tenderExchange() {
        return new TopicExchange(tenderExchangeName);
    }

    @Bean
    public Queue tenderSubmittedQueue() {
        return new Queue(tenderSubmittedQueueName, true);
    }

    @Bean
    public Binding tenderSubmittedBinding(Queue tenderSubmittedQueue, TopicExchange tenderExchange) {
        return BindingBuilder
                .bind(tenderSubmittedQueue)
                .to(tenderExchange)
                .with(tenderSubmittedRoutingKey);
    }
}
