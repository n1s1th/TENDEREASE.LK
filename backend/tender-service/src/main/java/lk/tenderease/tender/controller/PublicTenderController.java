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
import lk.tenderease.tender.enums.ProcurementType;
import lk.tenderease.tender.enums.TenderStatus;
import lk.tenderease.tender.service.CurrentBidderEmailResolver;
import lk.tenderease.tender.service.CurrentUserResolver;
import lk.tenderease.tender.service.S3Service;
import lk.tenderease.tender.service.TenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
public class PublicTenderController {

    /** Only objects under this prefix may be served by the public file endpoint. */
    private static final String TENDER_PREFIX = "tenders";

    private final TenderService tenderService;
    private final S3Service s3Service;
    private final CurrentBidderEmailResolver currentBidderEmailResolver;
    private final CurrentUserResolver currentUserResolver;

    @GetMapping
    public Page<TenderSummaryDTO> getAllTenders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TenderStatus status,
            @RequestParam(required = false) ProcurementType procurementType,
            @RequestParam(required = false) String tab) {
        Pageable pageable = PageRequest.of(page, size);
        String query = search != null ? search : keyword;
        return tenderService.getAllPublishedTenders(query, status, procurementType, tab, pageable);
    }

    @GetMapping("/{id}")
    public TenderDetailsDTO getTenderById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader) {
        // Tender details (documents, contacts, clarifications) are for signed-in users
        // only. The tender list at GET /api/tenders stays public.
        requireSignedIn(authorizationHeader, userEmailHeader);

        try {
            UUID uuid = UUID.fromString(id);
            return tenderService.getPublicTenderById(uuid);
        } catch (IllegalArgumentException e) {
            return tenderService.getPublicTenderByNumber(id);
        }
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

    @GetMapping("/files/{*key}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable("key") String key,
            @RequestParam(name = "download", defaultValue = "false") boolean download) {
        String s3Key = normalizeKey(key);

        ResponseInputStream<GetObjectResponse> stream;
        try {
            stream = s3Service.openStream(s3Key);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found: " + s3Key);
        }

        GetObjectResponse metadata = stream.response();
        String filename = s3Key.substring(s3Key.lastIndexOf('/') + 1);
        MediaType contentType = metadata.contentType() != null
                ? MediaType.parseMediaType(metadata.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        (download ? "attachment" : "inline") + "; filename=\"" + filename + "\"")
                .contentType(contentType);

        if (metadata.contentLength() != null) {
            response.contentLength(metadata.contentLength());
        }

        return response.body(new InputStreamResource(stream));
    }

    @GetMapping("/{id}/documents/download-all")
    public ResponseEntity<byte[]> downloadAll(@PathVariable UUID id) {
        byte[] archive = tenderService.getDocumentsArchive(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"documents.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(archive.length)
                .body(archive);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SAVED TENDERS (BOOKMARKS)
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/saved")
    public Page<TenderSummaryDTO> getSavedTenders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader) {
        String userId = requireSignedIn(authorizationHeader, userEmailHeader);
        return tenderService.getSavedTenders(userId, PageRequest.of(page, size));
    }

    @GetMapping("/saved/ids")
    public List<UUID> getSavedTenderIds(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader) {
        String userId = requireSignedIn(authorizationHeader, userEmailHeader);
        return tenderService.getSavedTenderIds(userId);
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveTender(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader) {
        String userId = requireSignedIn(authorizationHeader, userEmailHeader);
        tenderService.saveTender(userId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveTender(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader) {
        String userId = requireSignedIn(authorizationHeader, userEmailHeader);
        tenderService.unsaveTender(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the caller's identifier, or fails with 401 when the request carries no
     * usable identity. Used by endpoints that must not serve anonymous visitors.
     */
    private String requireSignedIn(String authorizationHeader, String userEmailHeader) {
        return currentUserResolver.resolve(authorizationHeader, userEmailHeader)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Sign in to view tender details"));
    }

    /**
     * Turns the wildcard path segment into an S3 key and refuses anything outside the
     * tender namespace, so this public endpoint cannot be used to read vendor or bid files.
     */
    private String normalizeKey(String rawKey) {
        String key = rawKey == null ? "" : rawKey;
        while (key.startsWith("/")) {
            key = key.substring(1);
        }
        if (key.isBlank() || key.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
        }
        if (!key.startsWith(TENDER_PREFIX + "/")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Key is outside the tender document namespace");
        }
        return key;
    }
}
