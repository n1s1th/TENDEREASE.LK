package lk.tenderease.tender.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.tender.dto.response.TenderDetailResponse;
import lk.tenderease.tender.dto.response.TenderResponse;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cao/tenders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "CAO Tender Management", description = "Dashboard APIs for CAO to review and approve tenders")
public class CaoTenderController {

    private final TenderService tenderService;

    @GetMapping
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "List tenders for CAO", description = "Lists tenders filtered by status for the CAO dashboard.")
    public ResponseEntity<PageResponse<TenderResponse>> listTenders(
            @RequestParam(required = false) TenderStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("CAO request to list tenders with status: {}, page: {}, size: {}", status, page, size);
        // Spring Data Pageable is 0-indexed, frontend is 1-indexed
        Pageable pageable = PageRequest.of(page - 1, size);
        return ResponseEntity.ok(tenderService.listAllTenders(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tender details", description = "Fetches a single tender by ID for CAO review.")
    public ResponseEntity<TenderDetailResponse> getTenderById(@PathVariable UUID id) {
        log.info("CAO fetching tender details: {}", id);
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @GetMapping("/kpi")
    @Operation(summary = "Get tender KPIs", description = "Fetches precise counts of active and awarded tenders from the database.")
    public ResponseEntity<java.util.Map<String, Long>> getKPIs(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(tenderService.getKPIs(department, category, month));
    }

    @GetMapping("/kpi/trend")
    @Operation(summary = "Get tender KPI trend", description = "Returns monthly counts of active tenders filtered by department and category.")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getKPITrend(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(tenderService.getKPITrend(department, category));
    }

    @GetMapping("/documents/{docId}/view")
    @Operation(summary = "View tender document", description = "Fetches a tender document for viewing (PDF).")
    public ResponseEntity<byte[]> viewDocument(@PathVariable UUID docId) {
        byte[] content = tenderService.viewDocument(docId);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"document.pdf\"")
                .body(content);
    }

    @GetMapping("/documents/{docId}/base64")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "Get document as Base64 JSON", description = "Bypasses download managers by sending file as a JSON string")
    public ResponseEntity<java.util.Map<String, String>> getDocumentBase64(@PathVariable java.util.UUID docId) {
        byte[] content = tenderService.viewDocument(docId);
        String base64Content = java.util.Base64.getEncoder().encodeToString(content);
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("content", base64Content);
        response.put("mimeType", "application/pdf");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "Approve tender", description = "CAO approves a tender, moving it to APPROVED or PUBLISHED status.")
    public ResponseEntity<TenderResponse> approveTender(@PathVariable UUID id) {
        log.info("CAO approving tender: {}", id);
        return ResponseEntity.ok(tenderService.updateTenderStatus(id, TenderStatus.PUBLISHED, null, "cao-user"));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CAO') or hasRole('ADMIN')")
    @Operation(summary = "Reject tender", description = "CAO rejects a tender with a reason.")
    public ResponseEntity<TenderResponse> rejectTender(
            @PathVariable UUID id,
            @RequestParam String reason) {
        log.info("CAO rejecting tender: {} for reason: {}", id, reason);
        return ResponseEntity.ok(tenderService.updateTenderStatus(id, TenderStatus.REJECTED, reason, "cao-user"));
    }
}
