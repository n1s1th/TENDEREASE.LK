package lk.tenderease.officerdashboard.config;

import lk.tenderease.common.constant.AMQPConstants;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OfficerDashboardRabbitMQConfig {

    public static final String OFFICER_DASHBOARD_QUEUE = "officer.dashboard.notification.queue";

    @Bean
    public DirectExchange officerDashboardNotificationExchange() {
        return new DirectExchange(AMQPConstants.NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue officerDashboardQueue() {
        return new Queue(OFFICER_DASHBOARD_QUEUE, true);
    }

    @Bean
    public Binding clarificationCreatedOfficerDashboardBinding(
            Queue officerDashboardQueue,
            DirectExchange officerDashboardNotificationExchange
    ) {
        return BindingBuilder
                .bind(officerDashboardQueue)
                .to(officerDashboardNotificationExchange)
                .with(AMQPConstants.CLARIFICATION_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding clarificationAnsweredOfficerDashboardBinding(
            Queue officerDashboardQueue,
            DirectExchange officerDashboardNotificationExchange
    ) {
        return BindingBuilder
                .bind(officerDashboardQueue)
                .to(officerDashboardNotificationExchange)
                .with(AMQPConstants.CLARIFICATION_ANSWERED_ROUTING_KEY);
    }
}
