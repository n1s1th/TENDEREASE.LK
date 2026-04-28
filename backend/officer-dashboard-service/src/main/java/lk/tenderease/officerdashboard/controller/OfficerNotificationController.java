package lk.tenderease.officerdashboard.controller;

import lk.tenderease.officerdashboard.dto.DashboardNotificationResponse;
import lk.tenderease.officerdashboard.dto.NotificationSummaryResponse;
import lk.tenderease.officerdashboard.service.OfficerNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/officer/notifications")
@RequiredArgsConstructor
public class OfficerNotificationController {

    private final OfficerNotificationService officerNotificationService;

    @GetMapping
    public List<DashboardNotificationResponse> list(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status
    ) {
        return officerNotificationService.list(userId, email, search, type, status);
    }

    @GetMapping("/summary")
    public NotificationSummaryResponse summary(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String email
    ) {
        return officerNotificationService.summarize(userId, email);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        officerNotificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String email
    ) {
        officerNotificationService.markAllRead(userId, email);
        return ResponseEntity.noContent().build();
    }
}
