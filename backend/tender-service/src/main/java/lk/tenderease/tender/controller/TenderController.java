package lk.tenderease.tender.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.tender.dto.request.ComplianceChecklistRequest;
import lk.tenderease.tender.dto.request.CreateAddendumRequest;
import lk.tenderease.tender.dto.request.CreateTenderRequest;
import lk.tenderease.tender.dto.request.TenderScheduleRequest;
import lk.tenderease.tender.dto.response.AddendumVersionResponse;
import lk.tenderease.tender.dto.response.ComplianceChecklistResponse;
import lk.tenderease.tender.dto.response.DepartmentResponse;
import lk.tenderease.tender.dto.response.FundingSourceResponse;
import lk.tenderease.tender.dto.response.MinistryResponse;
import lk.tenderease.tender.dto.response.SbdTemplateResponse;
import lk.tenderease.tender.dto.response.TenderAmendmentDTO;
import lk.tenderease.tender.dto.response.TenderDetailResponse;
import lk.tenderease.tender.dto.response.TenderDocumentResponse;
import lk.tenderease.tender.dto.response.TenderNoticePreviewResponse;
import lk.tenderease.tender.dto.response.TenderResponse;
import lk.tenderease.tender.dto.response.TenderScheduleResponse;
import lk.tenderease.tender.enums.DocumentType;
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/tenders")
@RequiredArgsConstructor
@Tag(name = "Tender Management", description = "APIs for creating, managing, and submitting tenders")
public class TenderController {

    private final TenderService tenderService;

    // ══════════════════════════════════════════════════════════════════════════
    // REFERENCE DATA — Public (no auth required)
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/reference-data/ministries")
    @Operation(summary = "List all ministries", description = "Returns all ministries for dropdown population. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ministries retrieved successfully")
    })
    public ResponseEntity<List<MinistryResponse>> listMinistries() {
        return ResponseEntity.ok(tenderService.listMinistries());
    }

    @GetMapping("/reference-data/ministries/{id}/departments")
    @Operation(summary = "List departments by ministry", description = "Returns all departments belonging to a specific ministry. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Departments retrieved successfully")
    })
    public ResponseEntity<List<DepartmentResponse>> listDepartmentsByMinistry(
            @Parameter(description = "Ministry ID") @PathVariable Long id) {
        return ResponseEntity.ok(tenderService.listDepartmentsByMinistry(id));
    }

    @GetMapping("/reference-data/funding-sources")
    @Operation(summary = "List funding sources", description = "Returns all available funding sources. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Funding sources retrieved successfully")
    })
    public ResponseEntity<List<FundingSourceResponse>> listFundingSources() {
        return ResponseEntity.ok(tenderService.listFundingSources());
    }

    @GetMapping("/reference-data/procurement-types")
    @Operation(summary = "List procurement types", description = "Returns all procurement type enum values. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Procurement types retrieved successfully")
    })
    public ResponseEntity<List<String>> listProcurementTypes() {
        return ResponseEntity.ok(tenderService.listProcurementTypes());
    }

    @GetMapping("/reference-data/bidding-methods")
    @Operation(summary = "List bidding methods", description = "Returns all bidding method enum values. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bidding methods retrieved successfully")
    })
    public ResponseEntity<List<String>> listBiddingMethods() {
        return ResponseEntity.ok(tenderService.listBiddingMethods());
    }

    @GetMapping("/reference-data/tender-types")
    @Operation(summary = "List tender types", description = "Returns all tender type enum values. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tender types retrieved successfully")
    })
    public ResponseEntity<List<String>> listTenderTypes() {
        return ResponseEntity.ok(tenderService.listTenderTypes());
    }

    @GetMapping("/reference-data/sbd-templates")
    @Operation(summary = "List SBD templates", description = "Returns active Standard Bidding Document templates, optionally filtered by procurement type. No authentication required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "SBD templates retrieved successfully")
    })
    public ResponseEntity<List<SbdTemplateResponse>> listSbdTemplates(
            @Parameter(description = "Filter by procurement type") @RequestParam(required = false) ProcurementType procurementType) {
        return ResponseEntity.ok(tenderService.listSbdTemplates(procurementType));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TENDER CRUD — Authenticated (PROCUREMENT_OFFICER, ADMIN)
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Create new tender", description = "Creates a new tender in DRAFT status. Requires PROCUREMENT_OFFICER or ADMIN role.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Tender created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "409", description = "Tender number already exists")
    })
    public ResponseEntity<TenderResponse> createTender(
            @Valid @RequestBody CreateTenderRequest request) {
        String createdBy = request.getOfficerEmail() != null ? request.getOfficerEmail() : "officer@procurement.gov.lk";
        try {
            String username = lk.tenderease.common.security.SecurityUtils.getCurrentUsername();
            if (username != null && !username.isEmpty() && !username.equals("anonymousUser")) {
                createdBy = username;
            }
        } catch (Exception e) {
            // ignore
        }
        TenderResponse response = tenderService.createTender(request, createdBy);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Get tender detail", description = "Returns full tender detail including documents, schedule, checklist, and notice preview.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tender detail retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderDetailResponse> getTenderById(
            @Parameter(description = "Tender UUID or Number") @PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return ResponseEntity.ok(tenderService.getTenderById(uuid));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(tenderService.getTenderByNumber(id));
        }
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Update tender", description = "Updates a DRAFT tender. Only the owner or ADMIN can update.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tender updated successfully"),
        @ApiResponse(responseCode = "400", description = "Tender is not in DRAFT status or invalid data"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized to update this tender"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderResponse> updateTender(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Valid @RequestBody CreateTenderRequest request) {
        String createdBy = "officer@procurement.gov.lk";
        try {
            String username = lk.tenderease.common.security.SecurityUtils.getCurrentUsername();
            if (username != null && !username.isEmpty()) {
                createdBy = username;
            }
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity.ok(tenderService.updateTender(id, request, createdBy));
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Delete tender", description = "Deletes a DRAFT tender and all child records. Only the owner or ADMIN can delete.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Tender deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Tender is not in DRAFT status"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized to delete this tender"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<Void> deleteTender(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        return null; // TODO: implement
    }

    @GetMapping
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "List own tenders", description = "Lists tenders created by the current user with optional status filter and pagination.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tenders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    public ResponseEntity<lk.tenderease.common.dto.PageResponse<TenderResponse>> listMyTenders(
            @Parameter(description = "Filter by tender status") @RequestParam(required = false) TenderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(tenderService.listMyTenders(status, pageable, "dev-user-id"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMIN ONLY — List all tenders
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/all")
    // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all tenders (Admin)", description = "Lists all tenders across all users. ADMIN role required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All tenders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized — ADMIN role required")
    })
    public ResponseEntity<lk.tenderease.common.dto.PageResponse<TenderResponse>> listAllTenders(
            @Parameter(description = "Filter by tender status") @RequestParam(required = false) TenderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(tenderService.listAllTenders(status, pageable));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DOCUMENT MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Upload document", description = "Uploads a document to a tender. Max 50 MB. Allowed: PDF, DOC, DOCX.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file type or size exceeded"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderDocumentResponse> uploadDocument(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "sbdTemplateId", required = false) Long sbdTemplateId) {
        
        lk.tenderease.tender.dto.request.DocumentUploadRequest uploadRequest = new lk.tenderease.tender.dto.request.DocumentUploadRequest();
        uploadRequest.setFile(file);
        uploadRequest.setDocumentType(documentType);
        uploadRequest.setSbdTemplateId(sbdTemplateId);
        
        TenderDocumentResponse response = tenderService.uploadDocument(id, uploadRequest, "dev-user-id");
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{id}/documents/{docId}")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Delete document", description = "Deletes a document from a tender.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Void> deleteDocument(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Parameter(description = "Document UUID") @PathVariable UUID docId) {
        tenderService.deleteDocument(id, docId, "dev-user-id");
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADDENDA & ADDENDUM VERSIONING
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/addenda")
    @Operation(summary = "Get all addenda for tender", description = "Returns all addenda/amendments issued for a tender including their latest version information.")
    public ResponseEntity<List<TenderAmendmentDTO>> getAddenda(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getAddenda(id));
    }

    @PostMapping(value = "/{id}/addenda", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Create new addendum (Officer)", description = "Created by Procurement Officer. Creates an addendum and optionally uploads the initial version (v1) file.")
    public ResponseEntity<TenderAmendmentDTO> createAddendum(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "changeDescription", required = false) String changeDescription,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        CreateAddendumRequest request = CreateAddendumRequest.builder()
                .title(title)
                .description(description)
                .changeDescription(changeDescription)
                .build();
        TenderAmendmentDTO response = tenderService.createAddendum(id, request, file, "procurement-officer");
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping(value = "/{id}/addenda/{addendumId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Upload new addendum version (Officer)", description = "Uploaded by Procurement Officer. Uploads a new immutable version for an existing addendum (e.g. v2, v3).")
    public ResponseEntity<AddendumVersionResponse> uploadAddendumVersion(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Parameter(description = "Addendum ID") @PathVariable Long addendumId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changeDescription", required = false) String changeDescription) {
        AddendumVersionResponse response = tenderService.uploadAddendumVersion(id, addendumId, file, changeDescription, "procurement-officer");
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions")
    @Operation(summary = "Get complete version history", description = "Returns all immutable versions created for an addendum in chronological order.")
    public ResponseEntity<List<AddendumVersionResponse>> getAddendumVersionHistory(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Parameter(description = "Addendum ID") @PathVariable Long addendumId) {
        return ResponseEntity.ok(tenderService.getAddendumVersionHistory(id, addendumId));
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions/current")
    @Operation(summary = "Get current addendum version", description = "Returns the latest active version for an addendum.")
    public ResponseEntity<AddendumVersionResponse> getCurrentAddendumVersion(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Parameter(description = "Addendum ID") @PathVariable Long addendumId) {
        return ResponseEntity.ok(tenderService.getCurrentAddendumVersion(id, addendumId));
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions/{versionNumber}")
    @Operation(summary = "Get specific addendum version", description = "Returns a specific historical version of an addendum by version number.")
    public ResponseEntity<AddendumVersionResponse> getAddendumVersion(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Parameter(description = "Addendum ID") @PathVariable Long addendumId,
            @Parameter(description = "Version number (1, 2, 3...)") @PathVariable Integer versionNumber) {
        return ResponseEntity.ok(tenderService.getAddendumVersion(id, addendumId, versionNumber));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SCHEDULE MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/schedule")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Get tender schedule", description = "Returns the schedule for a tender.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Schedule retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Schedule not found")
    })
    public ResponseEntity<TenderScheduleResponse> getSchedule(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getSchedule(id));
    }

    @PutMapping("/{id}/schedule")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Save/update schedule", description = "Saves or updates the schedule for a tender.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Schedule saved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid schedule dates"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderScheduleResponse> saveSchedule(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Valid @RequestBody TenderScheduleRequest request) {
        return ResponseEntity.ok(tenderService.saveSchedule(id, request, "dev-user-id"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // COMPLIANCE CHECKLIST
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/compliance-checklist")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Get compliance checklist", description = "Returns the compliance checklist state for a tender.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<ComplianceChecklistResponse> getComplianceChecklist(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getComplianceChecklist(id));
    }

    @PutMapping("/{id}/compliance-checklist")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Update compliance checklist", description = "Saves or updates the compliance checklist for a tender.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Checklist updated successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<ComplianceChecklistResponse> saveComplianceChecklist(
            @Parameter(description = "Tender UUID") @PathVariable UUID id,
            @Valid @RequestBody ComplianceChecklistRequest request) {
        return ResponseEntity.ok(tenderService.saveComplianceChecklist(id, request, "dev-user-id"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // NOTICE PREVIEW
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/{id}/notice-preview")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Get notice preview", description = "Generates the Invitation for Bids notice text from tender data.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notice preview generated successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderNoticePreviewResponse> getNoticePreview(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.generateNoticePreview(id));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SUBMISSION
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping("/{id}/submit-for-approval")
    // @PreAuthorize("hasRole('PROCUREMENT_OFFICER') or hasRole('ADMIN')")
    @Operation(summary = "Submit tender for approval",
            description = "Submits a DRAFT tender for approval. Requires all checklist items complete, at least 1 document, and schedule saved.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tender submitted for approval successfully"),
        @ApiResponse(responseCode = "400", description = "Pre-conditions not met (checklist incomplete, no documents, no schedule, or not DRAFT)"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Tender not found")
    })
    public ResponseEntity<TenderResponse> submitForApproval(
            @Parameter(description = "Tender UUID") @PathVariable UUID id) {
        log.info("REST request to submit tender for approval: {}", id);
        TenderResponse response = tenderService.submitForApproval(id, "dev-user-id");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update tender status", description = "Updates status of a tender. Public/internal use.")
    public ResponseEntity<TenderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam TenderStatus status,
            @RequestParam(required = false) String awardedBy) {
        log.info("REST request to update tender {} status to {}", id, status);
        TenderResponse response = tenderService.updateTenderStatus(id, status, null, awardedBy != null ? awardedBy : "system-user");
        return ResponseEntity.ok(response);
    }
}
