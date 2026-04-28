package lk.tenderease.officerdashboard.service;

import lk.tenderease.common.event.NotificationEvent;
import lk.tenderease.officerdashboard.dto.DashboardNotificationResponse;
import lk.tenderease.officerdashboard.dto.NotificationSummaryResponse;
import lk.tenderease.officerdashboard.entity.OfficerNotification;
import lk.tenderease.officerdashboard.repository.OfficerNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfficerNotificationService {

    private final OfficerNotificationRepository officerNotificationRepository;

    @Transactional
    public OfficerNotification record(NotificationEvent event, String status) {
        OfficerNotification notification = OfficerNotification.builder()
                .recipient(resolveRecipient(event))
                .recipientUserId(event.getRecipientUserId())
                .type(defaultString(event.getType(), "GENERAL"))
                .subject(defaultString(event.getSubject(), "Notification"))
                .message(event.getMessage())
                .tenderId(event.getTenderId())
                .tenderNumber(event.getTenderNumber())
                .tenderTitle(event.getTenderTitle())
                .clarificationId(event.getClarificationId())
                .questionPreview(event.getQuestionPreview())
                .actionUrl(event.getActionUrl())
                .status(status)
                .read(false)
                .createdAt(event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now())
                .build();
        return officerNotificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<DashboardNotificationResponse> list(
            String recipientUserId,
            String recipient,
            String search,
            String type,
            String status
    ) {
        return officerNotificationRepository.findForRecipient(blankToNull(recipientUserId), blankToNull(recipient))
                .stream()
                .filter(notification -> matches(notification, search, type, status))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificationSummaryResponse summarize(String recipientUserId, String recipient) {
        String userId = blankToNull(recipientUserId);
        String email = blankToNull(recipient);
        return NotificationSummaryResponse.builder()
                .unread(officerNotificationRepository.countUnreadForRecipient(userId, email))
                .failedDeliveries(officerNotificationRepository.countByStatusForRecipient(userId, email, "failed"))
                .awardLettersGenerated(officerNotificationRepository.countByStatusForRecipient(userId, email, "pdf_generated"))
                .date(LocalDate.now().toString())
                .build();
    }

    @Transactional
    public void markRead(UUID id) {
        officerNotificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
    }

    @Transactional
    public void markAllRead(String recipientUserId, String recipient) {
        officerNotificationRepository.findForRecipient(blankToNull(recipientUserId), blankToNull(recipient))
                .forEach(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(LocalDateTime.now());
                });
    }

    private DashboardNotificationResponse toResponse(OfficerNotification notification) {
        return DashboardNotificationResponse.builder()
                .id(notification.getId())
                .tenderId(notification.getTenderId())
                .tenderTitle(notification.getTenderTitle())
                .tenderNumber(notification.getTenderNumber())
                .title(notification.getSubject())
                .message(notification.getMessage())
                .type(notification.getType().toLowerCase())
                .status(notification.getStatus())
                .questionPreview(notification.getQuestionPreview())
                .actionUrl(notification.getActionUrl())
                .time(relativeTime(notification.getCreatedAt()))
                .performedBy(defaultString(notification.getRecipientUserId(), notification.getRecipient()))
                .read(notification.isRead())
                .clarificationId(notification.getClarificationId())
                .build();
    }

    private boolean matches(OfficerNotification notification, String search, String type, String status) {
        String normalizedSearch = blankToNull(search);
        boolean searchMatches = normalizedSearch == null
                || contains(notification.getSubject(), normalizedSearch)
                || contains(notification.getMessage(), normalizedSearch)
                || contains(notification.getTenderTitle(), normalizedSearch)
                || contains(notification.getTenderNumber(), normalizedSearch);
        boolean typeMatches = blankToNull(type) == null || notification.getType().equalsIgnoreCase(type);
        boolean statusMatches = blankToNull(status) == null || notification.getStatus().equalsIgnoreCase(status);
        return searchMatches && typeMatches && statusMatches;
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search.toLowerCase());
    }

    private String relativeTime(LocalDateTime createdAt) {
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        if (duration.toMinutes() < 1) {
            return "Just now";
        }
        if (duration.toHours() < 1) {
            return duration.toMinutes() + " mins ago";
        }
        if (duration.toDays() < 1) {
            return duration.toHours() + " hours ago";
        }
        return duration.toDays() + " days ago";
    }

    private String resolveRecipient(NotificationEvent event) {
        return defaultString(event.getRecipient(), defaultString(event.getRecipientUserId(), "officer"));
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
