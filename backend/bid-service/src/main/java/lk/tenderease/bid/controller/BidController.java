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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@Tag(name = "Bid Management", description = "APIs for managing bids")
public class BidController {

    private final BidService bidService;
    private final S3Service s3Service;

    @GetMapping("/count")
    @Operation(summary = "Get total bid count", description = "Returns the total number of bids across all tenders")
    public ResponseEntity<Map<String, Object>> getTotalBidCount() {
        log.info("Fetching total bid count");
        long count = bidService.getTotalBidCount();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count));
    }

    @GetMapping("/tender/{tenderId}/count")
    @Operation(summary = "Get bid count for a tender", description = "Returns the number of bids for a specific tender")
    public ResponseEntity<Map<String, Object>> getBidCountByTender(@PathVariable UUID tenderId) {
        log.info("Fetching bid count for tender: {}", tenderId);
        long count = bidService.getBidCountByTender(tenderId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count));
    }

    @GetMapping("/tender/{tenderId}")
    @Operation(summary = "Get bids for a tender", description = "Returns all bids submitted for a specific tender")
    public ResponseEntity<Map<String, Object>> getBidsByTender(@PathVariable UUID tenderId) {
        log.info("Fetching bids for tender: {}", tenderId);
        List<BidResponse> bids = bidService.getBidsByTender(tenderId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bids));
    }

    @GetMapping("/tender/{tenderId}/has-bid")
    @Operation(summary = "Check if user has bid on a tender", description = "Returns true if the current user has already submitted a bid for this tender")
    public ResponseEntity<Map<String, Object>> hasUserBid(
            @PathVariable UUID tenderId,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {
        log.info("Checking if user {} has bid on tender: {}", emailHeader, tenderId);
        if (emailHeader == null || emailHeader.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("success", true, "data", false));
        }
        boolean hasBid = bidService.hasUserBid(tenderId, emailHeader);
        return ResponseEntity.ok(Map.of("success", true, "data", hasBid));
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
                "data", bids));
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
                "data", bidResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a bid by ID", description = "Returns a single bid by its unique identifier")
    public ResponseEntity<Map<String, Object>> getBidById(@PathVariable UUID id) {
        log.info("Fetching bid with ID: {}", id);
        BidResponse bidResponse = bidService.getBidById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bidResponse));
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
                "data", bidResponse));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a bid document", description = "Uploads a document (PDF) for a bid submission")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Uploading file: {}", file.getOriginalFilename());
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            String key = "tenderease/bids/" + filename;

            s3Service.uploadFile(key, file);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "filePath", "http://localhost:8083/api/bids/files/" + filename));
        } catch (Exception e) {
            log.error("File upload failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/files/{filename}")
    @Operation(summary = "Download a bid document", description = "Serves uploaded bid documents")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            String key = "tenderease/bids/" + filename;
            java.io.InputStream inputStream = s3Service.downloadFile(key);
            Resource resource = new org.springframework.core.io.InputStreamResource(inputStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download file from S3: {}", filename, e);
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "File not found: " + filename);
        }
    }
}
