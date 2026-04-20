package lk.tenderease.tender.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.tenderease.tender.dto.template.TenderTemplateRequest;
import lk.tenderease.tender.dto.template.TenderTemplateResponse;
import lk.tenderease.tender.service.TenderTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tender-templates")
@RequiredArgsConstructor
@Tag(name = "Tender Template API", description = "Endpoints for managing dynamic tender form templates")
public class TenderTemplateController {

    private final TenderTemplateService tenderTemplateService;

    @PostMapping
    @Operation(summary = "Create a new template draft")
    public ResponseEntity<TenderTemplateResponse> createTemplate(@Valid @RequestBody TenderTemplateRequest request) {
        return new ResponseEntity<>(tenderTemplateService.createTemplate(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a draft or clone a published version")
    public ResponseEntity<TenderTemplateResponse> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody TenderTemplateRequest request) {
        return ResponseEntity.ok(tenderTemplateService.updateTemplate(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a template by ID")
    public ResponseEntity<TenderTemplateResponse> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderTemplateService.getTemplate(id));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all templates (including drafts)")
    public ResponseEntity<List<TenderTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(tenderTemplateService.getAllTemplates());
    }

    @GetMapping
    @Operation(summary = "Get all active published templates")
    public ResponseEntity<List<TenderTemplateResponse>> getActiveTemplates() {
        return ResponseEntity.ok(tenderTemplateService.getActiveTemplates());
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish a draft template")
    public ResponseEntity<TenderTemplateResponse> publishTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderTemplateService.publishTemplate(id));
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a template")
    public ResponseEntity<Void> archiveTemplate(@PathVariable UUID id) {
        tenderTemplateService.archiveTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
