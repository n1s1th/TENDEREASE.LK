package lk.tenderease.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.common.dto.PageResponse;
import lk.tenderease.user.dto.request.VendorRegisterRequest;
import lk.tenderease.user.dto.request.VendorSubmitRequest;
import lk.tenderease.user.dto.request.VerifyRegistrationRequest;
import lk.tenderease.user.dto.response.VendorDocumentResponse;
import lk.tenderease.user.dto.response.VendorProfileResponse;
import lk.tenderease.user.dto.response.VendorRegistrationResponse;
import lk.tenderease.user.dto.response.VerifyRegistrationResponse;
import lk.tenderease.user.enums.VendorDocumentType;
import lk.tenderease.user.enums.VendorStatus;
import lk.tenderease.user.service.VendorRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
@Tag(name = "Vendor Registration", description = "APIs for vendor registration and management")
public class VendorRegistrationController {

    private final VendorRegistrationService vendorRegistrationService;

    @PostMapping("/verify-registration")
    @Operation(summary = "Verify business registration number")
    public ResponseEntity<VerifyRegistrationResponse> verifyRegistration(
            @Valid @RequestBody VerifyRegistrationRequest request) {
        return ResponseEntity.ok(vendorRegistrationService.verifyRegistrationNumber(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new vendor")
    public ResponseEntity<VendorRegistrationResponse> register(
            @Valid @RequestBody VendorRegisterRequest request) {
        VendorRegistrationResponse response = vendorRegistrationService.register(request);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a vendor document")
    public ResponseEntity<VendorDocumentResponse> uploadDocument(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") VendorDocumentType documentType,
            @RequestParam(value = "documentTitle", required = false) String documentTitle) {
        VendorDocumentResponse response = vendorRegistrationService.uploadDocument(id, file, documentType, documentTitle);
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{id}/documents/{docId}")
    @Operation(summary = "Delete a vendor document")
    public ResponseEntity<Void> deleteDocument(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id,
            @Parameter(description = "Document UUID") @PathVariable UUID docId) {
        vendorRegistrationService.deleteDocument(id, docId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit vendor registration for review")
    public ResponseEntity<VendorRegistrationResponse> submit(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id,
            @Valid @RequestBody VendorSubmitRequest request) {
        return ResponseEntity.ok(vendorRegistrationService.submit(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor profile")
    public ResponseEntity<VendorProfileResponse> getVendorById(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(vendorRegistrationService.getVendorById(id));
    }

    @GetMapping
    @Operation(summary = "List all vendors (Admin)")
    public ResponseEntity<PageResponse<VendorProfileResponse>> listVendors(
            @RequestParam(required = false) VendorStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(vendorRegistrationService.listVendors(status, pageable));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a vendor (Admin)")
    public ResponseEntity<VendorProfileResponse> approveVendor(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(vendorRegistrationService.approveVendor(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a vendor (Admin)")
    public ResponseEntity<VendorProfileResponse> rejectVendor(
            @Parameter(description = "Vendor UUID") @PathVariable UUID id,
            @RequestParam String reason) {
        return ResponseEntity.ok(vendorRegistrationService.rejectVendor(id, reason));
    }
}
