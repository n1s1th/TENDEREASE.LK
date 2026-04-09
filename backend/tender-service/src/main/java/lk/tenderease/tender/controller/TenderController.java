package lk.tenderease.tender.controller;

import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
@CrossOrigin // allow frontend calls
public class TenderController {

    private final TenderService tenderService;

    // 🔥 1. LIST PAGE (Homepage / Search)
    @GetMapping
    public Page<TenderSummaryDTO> getAllTenders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) lk.tenderease.tender.enums.TenderStatus status
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return tenderService.getAllPublishedTenders(search, status, pageable);
    }

    // 🔥 2. MAIN TENDER DETAILS PAGE
    @GetMapping("/{id}")
    public TenderDetailsDTO getTenderById(@PathVariable UUID id) {
        return tenderService.getTenderById(id);
    }

    // 🔥 3. DOCUMENTS TAB
    @GetMapping("/{id}/documents")
    public List<TenderDocumentDTO> getDocuments(@PathVariable UUID id) {
        return tenderService.getDocuments(id);
    }

    // 🔥 4. ADDENDA TAB
    @GetMapping("/{id}/addenda")
    public List<TenderAmendmentDTO> getAddenda(@PathVariable UUID id) {
        return tenderService.getAddenda(id);
    }

    // 🔥 5. CLARIFICATIONS TAB
    @GetMapping("/{id}/clarifications")
    public List<ClarificationDTO> getClarifications(@PathVariable UUID id) {
        return tenderService.getClarifications(id);
    }

    @PostMapping("/{id}/clarifications")
    public org.springframework.http.ResponseEntity<?> submitClarification(@PathVariable UUID id, @RequestBody ClarificationRequestDTO request) {
        try {
            tenderService.submitClarification(id, request);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace(); // Print to backend console
            return org.springframework.http.ResponseEntity.status(500).body("Error: " + e.getMessage() + " | Cause: " + e.getCause());
        }
    }

    // 🔥 6. TIMELINE TAB
    @GetMapping("/{id}/timeline")
    public List<TimelineDTO> getTimeline(@PathVariable UUID id) {
        return tenderService.getTimeline(id);
    }

    // 🔥 7. CONTACT TAB
    @GetMapping("/{id}/contact")
    public List<ContactDTO> getContacts(@PathVariable UUID id) {
        return tenderService.getContacts(id);
    }
}