package lk.tenderease.bid.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.bid.dto.BidResponse;
import lk.tenderease.bid.service.BidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, Object>> getAllBids() {
        log.info("Fetching all bids");
        List<BidResponse> bids = bidService.getAllBids();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bids
        ));
    }
}
