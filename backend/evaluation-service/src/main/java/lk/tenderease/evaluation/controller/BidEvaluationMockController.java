package lk.tenderease.evaluation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/evaluations/mock")
@Tag(name = "Mock Bid Evaluation API", description = "Mock APIs for frontend development of the Bid Evaluation panel")
public class BidEvaluationMockController {

    // In-memory database mapping: tenderNo -> (bidderId -> BidderEvaluationState)
    private static final Map<String, Map<String, BidderEvaluationState>> tenderStates = new ConcurrentHashMap<>();

    // Static structures representing criteria definitions
    public static class Criterion {
        public String id;
        public String name;
        public String description;
        public int weight; // weight percentage (e.g. 30 for 30%)
        public double score; // 0-100
        public String comment;

        public Criterion() {
        }

        public Criterion(String id, String name, String description, int weight, double score, String comment) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.weight = weight;
            this.score = score;
            this.comment = comment;
        }
    }

    public static class BidderEvaluationState {
        public String bidderId;
        public String bidderName;
        public String status; // "Submitted", "In Progress", "Not Started"
        public String complianceStatus; // "PASS", "FAIL", "PENDING"
        public List<String> documents;
        public List<Criterion> technicalCriteria;
        public List<Criterion> financialCriteria;
        public String evaluationNotes;
        public String evaluatorName;
        public String evaluatorRole;
        public String lastSaved;

        public BidderEvaluationState() {
        }

        public BidderEvaluationState(String bidderId, String bidderName, String status, String complianceStatus) {
            this.bidderId = bidderId;
            this.bidderName = bidderName;
            this.status = status;
            this.complianceStatus = complianceStatus;

            // Set standard documents
            this.documents = Arrays.asList(
                    "Technical Proposal.pdf",
                    "Financial Offer.pdf",
                    "Company Profile.pdf",
                    "Compliance Checklist.pdf");

            // Default Technical Criteria
            this.technicalCriteria = new ArrayList<>(Arrays.asList(
                    new Criterion("tech_1", "Technical Approach", "Methodology and solution alignment", 30, 0, ""),
                    new Criterion("tech_2", "Team Qualifications", "CVs and relevant experience", 25, 0, ""),
                    new Criterion("tech_3", "Implementation Plan", "Timeline, milestones, risk management", 25, 0, ""),
                    new Criterion("tech_4", "Past Performance", "References and case studies", 20, 0, "")));

            // Default Financial Criteria
            this.financialCriteria = new ArrayList<>(Arrays.asList(
                    new Criterion("fin_1", "Bid Price Competitiveness", "Relative to lowest compliant bid", 50, 0, ""),
                    new Criterion("fin_2", "Payment Terms", "Milestone structure and flexibility", 30, 0, ""),
                    new Criterion("fin_3", "Value-Added Services", "Training, support, warranty", 20, 0, "")));

            this.evaluationNotes = "";
            this.evaluatorName = "Jane Doe";
            this.evaluatorRole = "Senior Designer";
            this.lastSaved = "Never";
        }
    }

    public static class TenderEvaluationData {
        public String tenderNo;
        public String tenderTitle;
        public String department;
        public String weighting;
        public String dueDate;
        public int threshold;
        public List<BidderEvaluationState> bidders;
    }

    private UUID resolveTenderUuid(String tenderNo) {
        UUID tenderUuid = null;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String tenderServiceUrl = "http://localhost:8082/api/tenders/" + tenderNo;
            Map<?, ?> tenderDetail = restTemplate.getForObject(tenderServiceUrl, Map.class);
            if (tenderDetail != null && tenderDetail.get("id") != null) {
                tenderUuid = UUID.fromString(tenderDetail.get("id").toString());
            }
        } catch (Exception e) {
            // ignore
        }

        if (tenderUuid == null) {
            try {
                tenderUuid = UUID.fromString(tenderNo);
            } catch (Exception e) {
                tenderUuid = UUID.nameUUIDFromBytes(tenderNo.getBytes());
            }
        }
        return tenderUuid;
    }

    // Helper to get or create initial states for a tender
    private Map<String, BidderEvaluationState> getOrCreateTenderState(String tenderNo) {
        Map<String, BidderEvaluationState> states = tenderStates.computeIfAbsent(tenderNo, k -> {
            Map<String, BidderEvaluationState> initialStates = new LinkedHashMap<>();

            // Only 1 Bidder for evaluation for display purposes
            BidderEvaluationState bid1 = new BidderEvaluationState("BID-001", "Apex Build Ltd.", "In Progress", "PASS");

            bid1.technicalCriteria.get(0).score = 70;
            bid1.technicalCriteria.get(0).comment = "Clear methodology and diagrams.";
            bid1.technicalCriteria.get(1).score = 68;
            bid1.technicalCriteria.get(1).comment = "Good experience, lack of senior roles.";
            bid1.technicalCriteria.get(2).score = 72;
            bid1.technicalCriteria.get(2).comment = "Feasible schedule.";
            bid1.technicalCriteria.get(3).score = 64;
            bid1.technicalCriteria.get(3).comment = "Standard client references.";

            bid1.financialCriteria.get(0).score = 75;
            bid1.financialCriteria.get(0).comment = "Price is competitive.";
            bid1.financialCriteria.get(1).score = 68;
            bid1.financialCriteria.get(1).comment = "Standard milestone split.";
            bid1.financialCriteria.get(2).score = 70;
            bid1.financialCriteria.get(2).comment = "1-year warranty plus training.";

            bid1.evaluationNotes = "Solid proposal. Compliant with technical specs.";
            bid1.lastSaved = "10 Feb 2026, 11:00";

            states.put("BID-001", bid1);

            return states;
        });
    }

    @GetMapping("/{tenderNo}/data")
    @Operation(summary = "Get full evaluation mockup data for a tender")
    public ResponseEntity<ApiResponse<TenderEvaluationData>> getEvaluationData(@PathVariable String tenderNo) {
        Map<String, BidderEvaluationState> bidderStates = getOrCreateTenderState(tenderNo);

        TenderEvaluationData data = new TenderEvaluationData();
        data.tenderNo = tenderNo;
        data.tenderTitle = tenderNo.equals("TND-0041") ? "ERP System Upgrade"
                : "Infrastructure Enhancement Procurement";
        data.department = "IT & Software";
        data.weighting = "Technical 70% / Financial 30%";
        data.dueDate = "28 Feb 2026";
        data.threshold = 75;
        data.bidders = new ArrayList<>(bidderStates.values());

        return ResponseEntity.ok(ApiResponse.success(data, "Mock data retrieved successfully"));
    }

    // Save structure
    public static class SaveEvaluationRequest {
        public String bidderId;
        public List<Criterion> technicalCriteria;
        public List<Criterion> financialCriteria;
        public String notes;
        public String status; // Optional status update
        public String evaluatorName;
        public String evaluatorRole;
    }

    @PostMapping("/{tenderNo}/save")
    @Operation(summary = "Save draft evaluation scores for a bidder")
    public ResponseEntity<ApiResponse<BidderEvaluationState>> saveDraft(
            @PathVariable String tenderNo,
            @RequestBody SaveEvaluationRequest request) {

        Map<String, BidderEvaluationState> bidderStates = getOrCreateTenderState(tenderNo);
        BidderEvaluationState bidder = bidderStates.get(request.bidderId);

        if (bidder == null) {
            UUID bidUuid;
            try {
                bidUuid = UUID.fromString(request.bidderId);
                String bidderName = "Bidder " + request.bidderId.substring(0, 8);
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    String bidUrl = "http://localhost:8083/api/bids/" + request.bidderId;
                    Map<?, ?> bidResponse = restTemplate.getForObject(bidUrl, Map.class);
                    if (bidResponse != null && bidResponse.get("data") != null) {
                        Map<?, ?> bidData = (Map<?, ?>) bidResponse.get("data");
                        bidderName = bidData.get("companyName") != null ? bidData.get("companyName").toString()
                                : (bidData.get("bidderName") != null ? bidData.get("bidderName").toString()
                                        : bidderName);
                    }
                } catch (Exception e) {
                    // ignore
                }
                bidder = new BidderEvaluationState(request.bidderId, bidderName, "In Progress", "PENDING");
                bidderStates.put(request.bidderId, bidder);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }

        if (request.technicalCriteria != null) {
            bidder.technicalCriteria = request.technicalCriteria;
        }
        if (request.financialCriteria != null) {
            bidder.financialCriteria = request.financialCriteria;
        }
        if (request.notes != null) {
            bidder.evaluationNotes = request.notes;
        }
        if (request.evaluatorName != null) {
            bidder.evaluatorName = request.evaluatorName;
        }
        if (request.evaluatorRole != null) {
            bidder.evaluatorRole = request.evaluatorRole;
        }
        if (request.status != null) {
            bidder.status = request.status;
        } else if (bidder.status.equals("Not Started")) {
            bidder.status = "In Progress";
        }

        // Update last saved timestamp
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                .ofPattern("dd MMM yyyy, HH:mm");
        bidder.lastSaved = now.format(formatter);

        // ══════════════════════════════════════════════════════════════════════════
        // PERSIST DRAFT EVALUATION TO DATABASE
        // ══════════════════════════════════════════════════════════════════════════
        UUID tenderUuid = resolveTenderUuid(tenderNo);

        UUID bidUuid;
        try {
            bidUuid = UUID.fromString(request.bidderId);
        } catch (Exception e) {
            bidUuid = UUID.nameUUIDFromBytes(request.bidderId.getBytes());
        }
        UUID evaluatorUuid = UUID.fromString("00000000-0000-0000-0000-000000000001");

        try {
            Evaluation evaluation = evaluationRepository.findByBidIdAndEvaluatorId(bidUuid, evaluatorUuid)
                    .orElse(new Evaluation());
            evaluation.setTenderId(tenderUuid);
            evaluation.setBidId(bidUuid);
            evaluation.setEvaluatorId(evaluatorUuid);
            evaluation.setStatus(EvaluationStatus.IN_PROGRESS);
            evaluation.setIsFlagged(false);
            evaluation.setEvaluatorName(bidder.evaluatorName);
            evaluation.setEvaluatorRole(bidder.evaluatorRole);

            double techSubtotal = 0;
            for (Criterion c : bidder.technicalCriteria) {
                techSubtotal += c.score * (c.weight / 100.0);
            }
            evaluation.setComplianceStatus(techSubtotal >= 75 ? ComplianceStatus.COMPLIANT : ComplianceStatus.PENDING);
            evaluation.setTotalScore(BigDecimal.valueOf(techSubtotal));
            evaluation.setRemarks(bidder.evaluationNotes);
            evaluation.setEvaluatedAt(now);

            Evaluation savedEvaluation = evaluationRepository.save(evaluation);

            List<EvaluationCriteria> dbCriteria = evaluationCriteriaRepository.findByTenderId(tenderUuid);
            for (Criterion c : bidder.technicalCriteria) {
                saveScoreForCriterion(savedEvaluation, c, dbCriteria, tenderUuid);
            }
            for (Criterion c : bidder.financialCriteria) {
                saveScoreForCriterion(savedEvaluation, c, dbCriteria, tenderUuid);
            }
        } catch (Exception e) {
            System.err.println("Failed to persist draft evaluation to database: " + e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(bidder, "Draft saved successfully"));
    }

    @PostMapping("/{tenderNo}/submit")
    @Operation(summary = "Submit final evaluation scores for a bidder")
    public ResponseEntity<ApiResponse<BidderEvaluationState>> submitEvaluation(
            @PathVariable String tenderNo,
            @RequestBody SaveEvaluationRequest request) {

        Map<String, BidderEvaluationState> bidderStates = getOrCreateTenderState(tenderNo);
        BidderEvaluationState bidder = bidderStates.get(request.bidderId);

        if (bidder == null) {
            UUID bidUuid;
            try {
                bidUuid = UUID.fromString(request.bidderId);
                String bidderName = "Bidder " + request.bidderId.substring(0, 8);
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    String bidUrl = "http://localhost:8083/api/bids/" + request.bidderId;
                    Map<?, ?> bidResponse = restTemplate.getForObject(bidUrl, Map.class);
                    if (bidResponse != null && bidResponse.get("data") != null) {
                        Map<?, ?> bidData = (Map<?, ?>) bidResponse.get("data");
                        bidderName = bidData.get("companyName") != null ? bidData.get("companyName").toString()
                                : (bidData.get("bidderName") != null ? bidData.get("bidderName").toString()
                                        : bidderName);
                    }
                } catch (Exception e) {
                    // ignore
                }
                bidder = new BidderEvaluationState(request.bidderId, bidderName, "In Progress", "PENDING");
                bidderStates.put(request.bidderId, bidder);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }

        if (request.technicalCriteria != null) {
            bidder.technicalCriteria = request.technicalCriteria;
        }
        if (request.financialCriteria != null) {
            bidder.financialCriteria = request.financialCriteria;
        }
        if (request.notes != null) {
            bidder.evaluationNotes = request.notes;
        }
        if (request.evaluatorName != null) {
            bidder.evaluatorName = request.evaluatorName;
        }
        if (request.evaluatorRole != null) {
            bidder.evaluatorRole = request.evaluatorRole;
        }

        bidder.status = "COMPLETED";

        // Update compliance status based on score
        double techSubtotal = 0;
        for (Criterion c : bidder.technicalCriteria) {
            techSubtotal += c.score * (c.weight / 100.0);
        }
        bidder.complianceStatus = techSubtotal >= 75 ? "PASS" : "FAIL";

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                .ofPattern("dd MMM yyyy, HH:mm");
        bidder.lastSaved = now.format(formatter);

        return ResponseEntity.ok(ApiResponse.success(bidder, "Evaluation submitted successfully"));
    }
}
