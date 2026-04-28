package lk.tenderease.officerdashboard.consumer;

import lk.tenderease.common.event.NotificationEvent;
import lk.tenderease.officerdashboard.config.OfficerDashboardRabbitMQConfig;
import lk.tenderease.officerdashboard.service.OfficerDashboardEmailService;
import lk.tenderease.officerdashboard.service.OfficerNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OfficerDashboardNotificationConsumer {

    private final OfficerNotificationService officerNotificationService;
    private final OfficerDashboardEmailService officerDashboardEmailService;

    @RabbitListener(queues = OfficerDashboardRabbitMQConfig.OFFICER_DASHBOARD_QUEUE)
    public void handleClarificationNotification(NotificationEvent event) {
        log.info("Officer dashboard received clarification notification for tender {}", event.getTenderId());

        String status = "sent";
        try {
            if (event.getRecipient() != null && event.getRecipient().contains("@")) {
                officerDashboardEmailService.sendEmail(
                        event.getRecipient(),
                        event.getSubject(),
                        event.getMessage()
                );
            }
        } catch (Exception ex) {
            status = "failed";
        }

        officerNotificationService.record(event, status);
    }
}
