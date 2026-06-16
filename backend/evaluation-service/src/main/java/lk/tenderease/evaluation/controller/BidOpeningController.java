package lk.tenderease.evaluation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.common.dto.ApiResponse;
import lk.tenderease.evaluation.dto.request.OpeningAttendanceRequest;
import lk.tenderease.evaluation.dto.response.OpeningAttendanceResponse;
import lk.tenderease.evaluation.dto.response.OpeningSessionResponse;
import lk.tenderease.evaluation.service.BidOpeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opening")
@RequiredArgsConstructor
@Tag(name = "Bid Opening API", description = "APIs for managing bid opening sessions and attendance")
public class BidOpeningController {

    private final BidOpeningService bidOpeningService;

    @GetMapping("/tender/{tenderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Get opening session for a tender")
    public ResponseEntity<ApiResponse<OpeningSessionResponse>> getOpeningSession(@PathVariable UUID tenderId) {
        OpeningSessionResponse response = bidOpeningService.getOpeningSession(tenderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Opening session retrieved successfully"));
    }

    @PostMapping("/session/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE')")
    @Operation(summary = "Mark attendance for an opening session")
    public ResponseEntity<ApiResponse<OpeningAttendanceResponse>> markAttendance(
            @PathVariable UUID sessionId,
            @Valid @RequestBody OpeningAttendanceRequest request) {
        OpeningAttendanceResponse response = bidOpeningService.markAttendance(sessionId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Attendance marked successfully"));
    }

    @GetMapping("/session/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE', 'PROCUREMENT_OFFICER')")
    @Operation(summary = "Get attendance log for a session")
    public ResponseEntity<ApiResponse<List<OpeningAttendanceResponse>>> getAttendance(@PathVariable UUID sessionId) {
        List<OpeningAttendanceResponse> response = bidOpeningService.getAttendance(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Attendance retrieved successfully"));
    }

    @PostMapping("/session/{sessionId}/open")
    @PreAuthorize("hasRole('COMMITTEE')")
    @Operation(summary = "Start the bid opening session")
    public ResponseEntity<ApiResponse<OpeningSessionResponse>> startOpeningSession(@PathVariable UUID sessionId) {
        // Use a dummy officer name for now since Keycloak is disabled
        OpeningSessionResponse response = bidOpeningService.startOpeningSession(sessionId, "ENG. KHALID HAMDAN");
        return ResponseEntity.ok(ApiResponse.success(response, "Bid opening session started successfully"));
    }
}
