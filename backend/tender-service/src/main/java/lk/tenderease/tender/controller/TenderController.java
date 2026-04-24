package lk.tenderease.tender.controller;

import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.dto.response.*;
import lk.tenderease.tender.service.CurrentBidderEmailResolver;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
@CrossOrigin // allow frontend calls
public class TenderController {

    private final TenderService tenderService;
    private final CurrentBidderEmailResolver currentBidderEmailResolver;

    // 🔥 1. LIST PAGE (Homepage / Search)
    @GetMapping
    public Page<TenderSummaryDTO> getAllTenders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) lk.tenderease.tender.enums.TenderStatus status) {
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
    public org.springframework.http.ResponseEntity<?> submitClarification(@PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader,
            @RequestBody ClarificationRequestDTO request) {
        try {
            String bidderEmail = currentBidderEmailResolver.resolve(authorizationHeader, userEmailHeader)
                    .orElse(null);
            tenderService.submitClarification(id, request, bidderEmail);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace(); // Print to backend console
            return org.springframework.http.ResponseEntity.status(500)
                    .body("Error: " + e.getMessage() + " | Cause: " + e.getCause());
        }
    }

    @PostMapping("/{id}/clarifications/{clarificationId}/response")
    public ResponseEntity<ClarificationDTO> answerClarification(
            @PathVariable UUID id,
            @PathVariable Long clarificationId,
            @RequestBody ClarificationAnswerRequestDTO request) {
        return ResponseEntity.ok(tenderService.answerClarification(id, clarificationId, request));
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

    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", filename);

            System.out.println("Downloading file from: " + filePath.toAbsolutePath());

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found: " + filename);
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 VERY IMPORTANT
            throw new RuntimeException("Download failed");
        }
    }

    @GetMapping("/{id}/documents/download-all")
    public ResponseEntity<byte[]> downloadAll(@PathVariable UUID id) {
        try {
            List<TenderDocumentDTO> documents = tenderService.getDocuments(id);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            for (TenderDocumentDTO doc : documents) {
                if (doc.getDownloadUrl() == null)
                    continue;

                Path filePath = Paths.get(System.getProperty("user.dir"), "uploads",
                        doc.getDownloadUrl().substring(doc.getDownloadUrl().lastIndexOf("/") + 1));

                if (!Files.exists(filePath))
                    continue;

                ZipEntry zipEntry = new ZipEntry(doc.getDocumentName() + ".pdf");
                zos.putNextEntry(zipEntry);

                Files.copy(filePath, zos);
                zos.closeEntry();
            }

            zos.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"documents.zip\"")
                    .body(baos.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("ZIP download failed");
        }
    }

}
