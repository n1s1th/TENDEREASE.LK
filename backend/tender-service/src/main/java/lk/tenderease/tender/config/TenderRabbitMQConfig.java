package lk.tenderease.tender.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TenderRabbitMQConfig {

    @Value("${rabbitmq.exchanges.tender:tender.exchange}")
    private String tenderExchangeName;

    @Value("${rabbitmq.queues.workflow-approved:tender.workflow.approved.queue}")
    private String workflowApprovedQueueName;

    @Value("${rabbitmq.queues.workflow-rejected:tender.workflow.rejected.queue}")
    private String workflowRejectedQueueName;

    @Value("${rabbitmq.routing-keys.tender-created:tender.created}")
    private String tenderCreatedRoutingKey;

    @Value("${rabbitmq.routing-keys.tender-submitted:tender.submitted}")
    private String tenderSubmittedRoutingKey;

    // ── Exchange ─────────────────────────────────────────────────────────────

    @Bean
    public TopicExchange tenderExchange() {
        return new TopicExchange(tenderExchangeName);
    }

    // ── Queues ───────────────────────────────────────────────────────────────

    @Bean
    public Queue workflowApprovedQueue() {
        return new Queue(workflowApprovedQueueName, true);
    }

    @Bean
    public Queue workflowRejectedQueue() {
        return new Queue(workflowRejectedQueueName, true);
    }

    // ── Bindings ─────────────────────────────────────────────────────────────

    @Bean
    public Binding workflowApprovedBinding(Queue workflowApprovedQueue, TopicExchange tenderExchange) {
        return BindingBuilder
                .bind(workflowApprovedQueue)
                .to(tenderExchange)
                .with("workflow.approved.tender");
    }

    @Bean
    public Binding workflowRejectedBinding(Queue workflowRejectedQueue, TopicExchange tenderExchange) {
        return BindingBuilder
                .bind(workflowRejectedQueue)
                .to(tenderExchange)
                .with("workflow.rejected.tender");
    }

    // ── Message Converter ────────────────────────────────────────────────────

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
