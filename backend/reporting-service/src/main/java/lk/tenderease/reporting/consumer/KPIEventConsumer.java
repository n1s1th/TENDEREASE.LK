package lk.tenderease.reporting.consumer;

import lk.tenderease.common.event.TenderEvent;
import lk.tenderease.common.event.UserEvent;
import lk.tenderease.reporting.service.KPIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KPIEventConsumer {

    private final KPIService kpiService;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "reporting.tender.kpi.queue", durable = "true"),
            exchange = @Exchange(value = "reporting.exchange", type = "topic"),
            key = "kpi.tender"
    ))
    public void consumeTenderEvent(TenderEvent event) {
        log.info("Received tender KPI event: {}", event);
        kpiService.handleTenderEvent(event.getEventType(), event.getStatus());
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "reporting.user.kpi.queue", durable = "true"),
            exchange = @Exchange(value = "reporting.exchange", type = "topic"),
            key = "kpi.user"
    ))
    public void consumeUserEvent(UserEvent event) {
        log.info("Received user KPI event: {}", event);
        kpiService.handleUserEvent(event.getEventType(), event.getStatus());
    }
}
