package lk.tenderease.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.response.OfficerProfileResponse;
import lk.tenderease.user.enums.OfficerStatus;
import lk.tenderease.user.service.OfficerRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cao")
@RequiredArgsConstructor
@Tag(name = "CAO User Management", description = "Dashboard APIs for CAO to manage officers")
public class CAOUserController {

    private final OfficerRegistrationService officerRegistrationService;

    @GetMapping("/registrations")
    @Operation(summary = "List registrations", description = "Lists officer registrations filtered by status for the CAO dashboard.")
    public ResponseEntity<PageResponse<OfficerProfileResponse>> listRegistrations(
            @RequestParam(required = false) OfficerStatus status,
            Pageable pageable) {
        log.info("CAO request to list registrations with status: {}", status);
        // Default to PENDING if no status is provided
        OfficerStatus filterStatus = (status != null) ? status : OfficerStatus.PENDING;
        return ResponseEntity.ok(officerRegistrationService.listOfficers(filterStatus, pageable));
    }

    @PostMapping("/registrations/{id}/accept")
    @Operation(summary = "Accept registration", description = "CAO accepts an officer registration.")
    public ResponseEntity<OfficerProfileResponse> acceptRegistration(@PathVariable UUID id) {
        log.info("CAO accepting registration: {}", id);
        return ResponseEntity.ok(officerRegistrationService.approveOfficer(id));
    }

    @PostMapping("/registrations/{id}/reject")
    @Operation(summary = "Reject registration", description = "CAO rejects an officer registration with a reason.")
    public ResponseEntity<OfficerProfileResponse> rejectRegistration(
            @PathVariable UUID id,
            @RequestParam String reason) {
        log.info("CAO rejecting registration: {} for reason: {}", id, reason);
        return ResponseEntity.ok(officerRegistrationService.rejectOfficer(id, reason));
    }

    @GetMapping("/officers")
    @Operation(summary = "List all officers", description = "Lists all approved officers for the CAO.")
    public ResponseEntity<PageResponse<OfficerProfileResponse>> listAllOfficers(Pageable pageable) {
        log.info("CAO request to list all active officers");
        return ResponseEntity.ok(officerRegistrationService.listOfficers(OfficerStatus.APPROVED, pageable));
    }
}
