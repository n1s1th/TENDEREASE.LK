package lk.tenderease.evaluation.event;

import lk.tenderease.common.event.BidEvent;
import lk.tenderease.common.event.TenderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EvaluationEventListener {

    // For simplicity, we just log the event. In a real system, you'd trigger evaluation logic here.
    @RabbitListener(queues = "bid.queue")
    public void handleBidEvent(BidEvent event) {
        log.info("Received BidEvent: {}", event);
        if ("SUBMITTED".equals(event.getEventType())) {
            log.info("Preparing evaluation for bid: {}", event.getBidId());
            // Implementation to prepare evaluation...
        }
    }

    @RabbitListener(queues = "tender.queue")
    public void handleTenderEvent(TenderEvent event) {
        log.info("Received TenderEvent: {}", event);
        if ("CLOSED".equals(event.getEventType())) {
            log.info("Triggering evaluation phase for tender: {}", event.getTenderId());
            // Implementation to trigger evaluation phase...
        }
    }
}
