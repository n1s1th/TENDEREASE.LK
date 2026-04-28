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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "List pending registrations", description = "Lists officer registrations awaiting CAO approval.")
    public ResponseEntity<PageResponse<OfficerProfileResponse>> listPendingRegistrations(Pageable pageable) {
        log.info("CAO request to list pending registrations");
        return ResponseEntity.ok(officerRegistrationService.listOfficers(OfficerStatus.PENDING, pageable));
    }

    @PostMapping("/registrations/{id}/accept")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "Accept registration", description = "CAO accepts an officer registration.")
    public ResponseEntity<OfficerProfileResponse> acceptRegistration(@PathVariable UUID id) {
        log.info("CAO accepting registration: {}", id);
        return ResponseEntity.ok(officerRegistrationService.approveOfficer(id));
    }

    @GetMapping("/officers")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "List all officers", description = "Lists all approved officers for the CAO audit.")
    public ResponseEntity<PageResponse<OfficerProfileResponse>> listAllOfficers(Pageable pageable) {
        log.info("CAO request to list all active officers");
        return ResponseEntity.ok(officerRegistrationService.listOfficers(OfficerStatus.APPROVED, pageable));
    }
}
