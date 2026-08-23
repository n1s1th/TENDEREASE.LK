package lk.tenderease.tender.controller;

import lk.tenderease.tender.dto.request.ClarificationAnswerRequestDTO;
import lk.tenderease.tender.dto.request.ClarificationRequestDTO;
import lk.tenderease.tender.dto.response.AddendumVersionResponse;
import lk.tenderease.tender.dto.response.ClarificationDTO;
import lk.tenderease.tender.dto.response.ContactDTO;
import lk.tenderease.tender.dto.response.TenderAmendmentDTO;
import lk.tenderease.tender.dto.response.TenderDetailsDTO;
import lk.tenderease.tender.dto.response.TenderDocumentDTO;
import lk.tenderease.tender.dto.response.TenderSummaryDTO;
import lk.tenderease.tender.dto.response.TimelineDTO;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.CurrentBidderEmailResolver;
import lk.tenderease.tender.service.TenderService;
import lk.tenderease.tender.enums.ProcurementType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
public class PublicTenderController {

    private final TenderService tenderService;
    private final CurrentBidderEmailResolver currentBidderEmailResolver;
    private final lk.tenderease.tender.service.S3Service s3Service;

    @GetMapping
    public Page<TenderSummaryDTO> getAllTenders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TenderStatus status,
            @RequestParam(required = false) ProcurementType procurementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String dateType) {
        
        String[] sortParams = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        String sortProperty = sortParams[0];
        
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortProperty));
        String query = search != null ? search : keyword;
        return tenderService.getAllPublishedTenders(query, status, procurementType, fromDate, toDate, dateType, pageable);
    }

    @GetMapping("/{id}")
    public TenderDetailsDTO getTenderById(@PathVariable UUID id) {
        return tenderService.getPublicTenderById(id);
    }

    @GetMapping("/{id}/documents")
    public List<TenderDocumentDTO> getDocuments(@PathVariable UUID id) {
        return tenderService.getDocuments(id);
    }

    @GetMapping("/{id}/addenda")
    public List<TenderAmendmentDTO> getAddenda(@PathVariable UUID id) {
        return tenderService.getAddenda(id);
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions")
    public List<AddendumVersionResponse> getAddendumVersionHistory(
            @PathVariable UUID id,
            @PathVariable Long addendumId) {
        return tenderService.getAddendumVersionHistory(id, addendumId);
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions/current")
    public AddendumVersionResponse getCurrentAddendumVersion(
            @PathVariable UUID id,
            @PathVariable Long addendumId) {
        return tenderService.getCurrentAddendumVersion(id, addendumId);
    }

    @GetMapping("/{id}/addenda/{addendumId}/versions/{versionNumber}")
    public AddendumVersionResponse getAddendumVersion(
            @PathVariable UUID id,
            @PathVariable Long addendumId,
            @PathVariable Integer versionNumber) {
        return tenderService.getAddendumVersion(id, addendumId, versionNumber);
    }

    @GetMapping("/{id}/clarifications")
    public List<ClarificationDTO> getClarifications(@PathVariable UUID id) {
        return tenderService.getClarifications(id);
    }

    @PostMapping("/{id}/clarifications")
    public ResponseEntity<Void> submitClarification(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader,
            @RequestBody ClarificationRequestDTO request) {
        String bidderEmail = currentBidderEmailResolver.resolve(authorizationHeader, userEmailHeader)
                .orElse(null);
        tenderService.submitClarification(id, request, bidderEmail);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/clarifications/{clarificationId}/response")
    public ResponseEntity<ClarificationDTO> answerClarification(
            @PathVariable UUID id,
            @PathVariable Long clarificationId,
            @RequestBody ClarificationAnswerRequestDTO request) {
        return ResponseEntity.ok(tenderService.answerClarification(id, clarificationId, request));
    }

    @GetMapping("/{id}/timeline")
    public List<TimelineDTO> getTimeline(@PathVariable UUID id) {
        return tenderService.getTimeline(id);
    }

    @PostMapping("/{id}/timeline")
    public ResponseEntity<Void> addTimelineEvent(
            @PathVariable UUID id,
            @RequestBody TimelineDTO request) {
        tenderService.addTimelineEvent(id, request.getEventType(), request.getDescription(), request.getCreatedBy(), request.getCreatorRole());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/contact")
    public List<ContactDTO> getContacts(@PathVariable UUID id) {
        return tenderService.getContacts(id);
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable String filename) {
        try {
            java.io.InputStream is = s3Service.downloadFile(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.InputStreamResource(is);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Download failed", e);
        }
    }

    @GetMapping("/{id}/documents/download-all")
    public ResponseEntity<byte[]> downloadAll(@PathVariable UUID id) {
        try {
            List<TenderDocumentDTO> documents = tenderService.getDocuments(id);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            try (ZipOutputStream zos = new ZipOutputStream(baos)) {
                for (TenderDocumentDTO doc : documents) {
                    if (doc.getDownloadUrl() == null) {
                        continue;
                    }
                    
                    String[] parts = doc.getDownloadUrl().split("/");
                    String filename = parts[parts.length - 1];
                    
                    try {
                        java.io.InputStream is = s3Service.downloadFile(filename);
                        ZipEntry entry = new ZipEntry(doc.getDocumentName() + "_" + filename);
                        zos.putNextEntry(entry);
                        
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = is.read(buffer)) > 0) {
                            zos.write(buffer, 0, len);
                        }
                        zos.closeEntry();
                        is.close();
                    } catch (Exception e) {
                        // Skip file if download fails
                        System.err.println("Failed to download file " + filename + " for zip: " + e.getMessage());
                    }
                }
            }

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"documents_" + id + ".zip\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/zip"))
                    .body(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Download all failed", e);
        }
    }

    // ── Saved Tenders ────────────────────────────────────────────────────────

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveTender(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        tenderService.saveTender(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveTender(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        tenderService.unsaveTender(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    public Page<TenderSummaryDTO> getSavedTenders(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort) {
            
        String[] sortParams = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
        String sortProperty = sortParams[0];
        
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortProperty));
        
        return tenderService.getSavedTenders(userId, pageable);
    }
}
