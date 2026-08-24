package lk.tenderease.bid.service;

import lk.tenderease.bid.dto.BidResponse;
import lk.tenderease.bid.dto.BidRequest;
import lk.tenderease.bid.dto.BidEvaluationRequest;
import lk.tenderease.bid.entity.Bid;
import lk.tenderease.bid.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    @org.springframework.beans.factory.annotation.Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${tender.service.url:http://localhost:8082}")
    private String tenderServiceUrl;

    /**
     * Returns the total count of all bids in the system.
     * Used by the Officer Dashboard KPI cards.
     */
    public long getTotalBidCount() {
        long count = bidRepository.count();
        log.info("Total bid count: {}", count);
        return count;
    }

    /**
     * Returns the number of bids for a specific tender.
     */
    public long getBidCountByTender(UUID tenderId) {
        return bidRepository.countByTenderId(tenderId);
    }

    /**
     * Returns all bids for a specific tender.
     */
    public List<BidResponse> getBidsByTender(UUID tenderId) {
        return bidRepository.findByTenderId(tenderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all bids in the system.
     */
    public List<BidResponse> getAllBids() {
        return bidRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all bids submitted by a specific bidder email.
     */
    public List<BidResponse> getBidsByBidderEmail(String bidderEmail) {
        log.info("Fetching bids for bidder: {}", bidderEmail);
        return bidRepository.findByBidderEmail(bidderEmail).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Submits a new bid with regulatory compliance validations.
     */
    @org.springframework.transaction.annotation.Transactional
    public BidResponse submitBid(BidRequest request, String bidderEmail) {
        log.info("Starting bid submission for tender: {} by bidder: {}", request.getTenderId(), bidderEmail);

        // 1. Fetch vendor profile from user-service
        String vendorUrl = userServiceUrl + "/api/v1/vendors/email/" + bidderEmail;
        Map<String, Object> vendorProfile = null;
        try {
            vendorProfile = restTemplate.getForObject(vendorUrl, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch vendor profile: {}", e.getMessage());
            throw new RuntimeException("Bidder is not a registered vendor on the platform. (Error: " + e.getMessage() + " - URL: " + vendorUrl + ")");
        }

        if (vendorProfile == null) {
            throw new RuntimeException("Vendor profile not found for email: " + bidderEmail);
        }

        String vendorStatus = (String) vendorProfile.get("status");
        if (!"APPROVED".equalsIgnoreCase(vendorStatus)) {
            throw new RuntimeException("Vendor account status is '" + vendorStatus + "'. Only APPROVED vendors can submit bids.");
        }

        String vendorCidaGrade = (String) vendorProfile.get("cidaGrade");

        // 2. Fetch tender detail from tender-service
        String tenderUrl = tenderServiceUrl + "/api/tenders/" + request.getTenderId();
        Map<String, Object> tenderDetail = null;
        try {
            tenderDetail = restTemplate.getForObject(tenderUrl, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch tender details: {}", e.getMessage());
            throw new RuntimeException("Tender not found with ID: " + request.getTenderId() + ". (Error: " + e.getMessage() + " - URL: " + tenderUrl + ")");
        }

        if (tenderDetail == null) {
            throw new RuntimeException("Tender details not found for ID: " + request.getTenderId());
        }

        // 3. Perform regulatory validation checks
        Map<String, Object> bidData = request.getBidData();
        if (bidData == null) {
            throw new RuntimeException("Bid data (forms, schedules, and uploads) is required.");
        }

        // A. PCA 3 registration check (for bid amount >= LKR 5,000,000)
        if (request.getBidAmount() != null && request.getBidAmount().compareTo(new BigDecimal("5000000")) >= 0) {
            String pca3File = (String) bidData.get("pca3File");
            if (pca3File == null || pca3File.trim().isEmpty()) {
                throw new RuntimeException("Under the Sri Lanka Public Contracts Act, a PCA 3 Registration Certificate is mandatory for projects valued at LKR 5,000,000 or above.");
            }
        }

        // B. Procurement Type conditional checks
        String procurementType = (String) tenderDetail.get("procurementType");
        Map<String, Object> tenderDynamicData = (Map<String, Object>) tenderDetail.get("dynamicData");

        if ("WORKS".equalsIgnoreCase(procurementType)) {
            // Validate CIDA certification files
            String cidaFile = (String) bidData.get("cidaFile");
            String cidaHistoryBookFile = (String) bidData.get("cidaHistoryBookFile");
            if (cidaFile == null || cidaFile.trim().isEmpty()) {
                throw new RuntimeException("CIDA Registration Certificate is required for construction works.");
            }
            if (cidaHistoryBookFile == null || cidaHistoryBookFile.trim().isEmpty()) {
                throw new RuntimeException("CIDA History Record Book is required for construction works.");
            }

            // Validate CIDA grade compliance
            if (tenderDynamicData != null) {
                String requiredCidaGrade = (String) tenderDynamicData.get("minCidaGrade");
                if (requiredCidaGrade != null && !requiredCidaGrade.trim().isEmpty()) {
                    if (vendorCidaGrade == null || vendorCidaGrade.trim().isEmpty()) {
                        throw new RuntimeException("Tender requires a minimum CIDA Grade of " + requiredCidaGrade + ", but the bidder has no registered CIDA grade.");
                    }
                    validateCidaGrade(vendorCidaGrade, requiredCidaGrade);
                }
            }
        } else if ("GOODS".equalsIgnoreCase(procurementType) || "SERVICES".equalsIgnoreCase(procurementType)) {
            // Validate MAF
            if (tenderDynamicData != null) {
                Object mafRequired = tenderDynamicData.get("mafRequired");
                if (mafRequired != null && (Boolean.TRUE.equals(mafRequired) || "true".equalsIgnoreCase(mafRequired.toString()))) {
                    String mafFile = (String) bidData.get("mafFile");
                    if (mafFile == null || mafFile.trim().isEmpty()) {
                        throw new RuntimeException("Manufacturer Authorization Form (MAF) is mandatory for this procurement.");
                    }
                }
            }

            // Validate technical specifications compliance matrix
            Object techComplianceMatrix = bidData.get("techComplianceMatrix");
            if (techComplianceMatrix == null) {
                throw new RuntimeException("Technical specifications compliance matrix is required.");
            }
        }

        // 4. Save bid to database
        UUID tenderUuid = null;
        if (tenderDetail.get("id") != null) {
            try {
                tenderUuid = UUID.fromString(tenderDetail.get("id").toString());
            } catch (Exception e) {
                log.error("Failed to parse tender UUID from tenderDetail: {}", e.getMessage());
            }
        }
        if (tenderUuid == null) {
            tenderUuid = UUID.fromString(request.getTenderId());
        }

        Bid bid = Bid.builder()
                .tenderId(tenderUuid)
                .bidderName(request.getBidderName())
                .bidderEmail(bidderEmail)
                .companyName(request.getCompanyName())
                .bidAmount(request.getBidAmount())
                .currency(request.getCurrency())
                .status("SUBMITTED")
                .submittedAt(LocalDateTime.now())
                .notes(request.getNotes())
                .bidData(bidData)
                .build();

        Bid saved = bidRepository.save(bid);
        log.info("Bid successfully submitted with ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    private void validateCidaGrade(String vendorGrade, String requiredGrade) {
        int vNum = parseCidaGradeNumber(vendorGrade);
        int rNum = parseCidaGradeNumber(requiredGrade);
        if (vNum > rNum) {
            throw new RuntimeException("Vendor CIDA Grade (" + vendorGrade + ") does not meet the minimum CIDA Grade requirement (" + requiredGrade + ") for this tender.");
        }
    }

    private int parseCidaGradeNumber(String grade) {
        if (grade == null) return 99;
        String clean = grade.replaceAll("[^0-9]", "");
        if (clean.isEmpty()) return 99;
        try {
            return Integer.parseInt(clean);
        } catch (NumberFormatException e) {
            return 99;
        }
    }

    /**
     * Evaluates a bid by updating scores and compliance state.
     */
    @org.springframework.transaction.annotation.Transactional
    public BidResponse evaluateBid(UUID bidId, BidEvaluationRequest request) {
        log.info("Evaluating bid: {} with techScore: {}, finScore: {}, status: {}", 
                bidId, request.getTechnicalScore(), request.getFinancialScore(), request.getStatus());
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        
        if (request.getTechnicalScore() != null) {
            bid.setTechnicalScore(request.getTechnicalScore());
        }
        if (request.getFinancialScore() != null) {
            bid.setFinancialScore(request.getFinancialScore());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            bid.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            bid.setNotes(request.getNotes());
        }
        bid.setUpdatedAt(LocalDateTime.now());
        Bid saved = bidRepository.save(bid);
        return mapToResponse(saved);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public BidResponse getBidById(UUID bidId) {
        log.info("Fetching bid: {}", bidId);
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        return mapToResponse(bid);
    }

    private BidResponse mapToResponse(Bid bid) {
        return BidResponse.builder()
                .id(bid.getId().toString())
                .tenderId(bid.getTenderId().toString())
                .bidderName(bid.getBidderName())
                .bidderEmail(bid.getBidderEmail())
                .companyName(bid.getCompanyName())
                .bidAmount(bid.getBidAmount())
                .currency(bid.getCurrency())
                .status(bid.getStatus())
                .submittedAt(bid.getSubmittedAt() != null ? bid.getSubmittedAt().format(DATE_FMT) : null)
                .bidData(bid.getBidData())
                .build();
    }
}
