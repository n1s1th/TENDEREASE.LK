package lk.tenderease.bid.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.bid.dto.BidResponse;
import lk.tenderease.bid.dto.BidRequest;
import lk.tenderease.bid.dto.BidEvaluationRequest;
import lk.tenderease.bid.service.BidService;
import lk.tenderease.bid.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@Tag(name = "Bid Management", description = "APIs for managing bids")
public class BidController {

    /** Every bid document lives under this prefix in the shared S3 bucket. */
    private static final String BID_PREFIX = "bids";

    private final BidService bidService;
    private final S3Service s3Service;

    @Value("${app.public-base-url:http://localhost:8083}")
    private String publicBaseUrl;

    @GetMapping("/count")
    @Operation(summary = "Get total bid count", description = "Returns the total number of bids across all tenders")
    public ResponseEntity<Map<String, Object>> getTotalBidCount() {
        log.info("Fetching total bid count");
        long count = bidService.getTotalBidCount();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count
        ));
    }

    @GetMapping("/tender/{tenderId}/count")
    @Operation(summary = "Get bid count for a tender", description = "Returns the number of bids for a specific tender")
    public ResponseEntity<Map<String, Object>> getBidCountByTender(@PathVariable UUID tenderId) {
        log.info("Fetching bid count for tender: {}", tenderId);
        long count = bidService.getBidCountByTender(tenderId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count
        ));
    }

    @GetMapping("/tender/{tenderId}")
    @Operation(summary = "Get bids for a tender", description = "Returns all bids submitted for a specific tender")
    public ResponseEntity<Map<String, Object>> getBidsByTender(@PathVariable UUID tenderId) {
        log.info("Fetching bids for tender: {}", tenderId);
        List<BidResponse> bids = bidService.getBidsByTender(tenderId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bids
        ));
    }

    @GetMapping
    @Operation(summary = "Get all bids", description = "Returns all bids in the system")
    public ResponseEntity<Map<String, Object>> getAllBids(
            @RequestParam(required = false) String bidderEmail) {
        log.info("Fetching all bids. BidderEmail: {}", bidderEmail);
        List<BidResponse> bids;
        if (bidderEmail != null && !bidderEmail.trim().isEmpty()) {
            bids = bidService.getBidsByBidderEmail(bidderEmail);
        } else {
            bids = bidService.getAllBids();
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bids
        ));
    }

    @PostMapping
    @Operation(summary = "Submit a new bid", description = "Submits a new bid with all regulatory compliance validations")
    public ResponseEntity<Map<String, Object>> submitBid(
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader,
            @RequestBody BidRequest request) {
        String bidderEmail = emailHeader;
        if (bidderEmail == null || bidderEmail.trim().isEmpty()) {
            bidderEmail = request.getBidderEmail(); // Fallback if header not present in dev
        }
        if (bidderEmail == null || bidderEmail.trim().isEmpty()) {
            bidderEmail = "vendor@gmail.com"; // Default test email for dev
        }
        log.info("Submitting bid for tender {} by email {}", request.getTenderId(), bidderEmail);
        BidResponse bidResponse = bidService.submitBid(request, bidderEmail);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bidResponse
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a bid by ID", description = "Returns a single bid by its unique identifier")
    public ResponseEntity<Map<String, Object>> getBidById(@PathVariable UUID id) {
        log.info("Fetching bid with ID: {}", id);
        BidResponse bidResponse = bidService.getBidById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bidResponse
        ));
    }

    @PutMapping("/{id}/evaluation")
    @Operation(summary = "Evaluate and score a bid", description = "Updates technical and financial scores and status of a bid")
    public ResponseEntity<Map<String, Object>> evaluateBid(
            @PathVariable UUID id,
            @RequestBody BidEvaluationRequest request) {
        log.info("Evaluating bid ID: {}", id);
        BidResponse bidResponse = bidService.evaluateBid(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bidResponse
        ));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a bid document",
            description = "Uploads a document (PDF) for a bid submission to S3 under bids/{tenderId}/")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tenderId", required = false) String tenderId) {
        log.info("Uploading bid document '{}' for tender {}", file.getOriginalFilename(), tenderId);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "File is empty"
            ));
        }

        try {
            String key = S3Service.buildKey(
                    BID_PREFIX,
                    tenderId != null && !tenderId.isBlank() ? tenderId : "unassigned",
                    file.getOriginalFilename());

            s3Service.uploadFile(key, file);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "key", key,
                    "filePath", publicBaseUrl + "/api/bids/files/" + key
            ));
        } catch (Exception e) {
            log.error("Bid document upload failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage() != null ? e.getMessage() : "Upload failed"
            ));
        }
    }

    @GetMapping("/files/{*key}")
    @Operation(summary = "Download a bid document", description = "Streams an uploaded bid document from S3")
    public ResponseEntity<Resource> getFile(
            @PathVariable("key") String key,
            @RequestParam(name = "download", defaultValue = "false") boolean download) {
        String s3Key = normalizeKey(key);
        log.info("Serving bid document from S3: {}", s3Key);

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

    /**
     * Turns the wildcard path segment into an S3 key and refuses anything outside the
     * bid namespace, so this public endpoint cannot be used to read other services' files.
     */
    private String normalizeKey(String rawKey) {
        String key = rawKey == null ? "" : rawKey;
        while (key.startsWith("/")) {
            key = key.substring(1);
        }
        if (key.isBlank() || key.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
        }
        if (!key.startsWith(BID_PREFIX + "/")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Key is outside the bid document namespace");
        }
        return key;
    }
}
