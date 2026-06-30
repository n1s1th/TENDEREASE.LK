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
        
        public Criterion() {}
        
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
        
        public BidderEvaluationState() {}

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
                "Compliance Checklist.pdf"
            );

            // Default Technical Criteria
            this.technicalCriteria = new ArrayList<>(Arrays.asList(
                new Criterion("tech_1", "Technical Approach", "Methodology and solution alignment", 30, 0, ""),
                new Criterion("tech_2", "Team Qualifications", "CVs and relevant experience", 25, 0, ""),
                new Criterion("tech_3", "Implementation Plan", "Timeline, milestones, risk management", 25, 0, ""),
                new Criterion("tech_4", "Past Performance", "References and case studies", 20, 0, "")
            ));

            // Default Financial Criteria
            this.financialCriteria = new ArrayList<>(Arrays.asList(
                new Criterion("fin_1", "Bid Price Competitiveness", "Relative to lowest compliant bid", 50, 0, ""),
                new Criterion("fin_2", "Payment Terms", "Milestone structure and flexibility", 30, 0, ""),
                new Criterion("fin_3", "Value-Added Services", "Training, support, warranty", 20, 0, "")
            ));

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

    // Helper to get or create initial states for a tender
    private Map<String, BidderEvaluationState> getOrCreateTenderState(String tenderNo) {
        return tenderStates.computeIfAbsent(tenderNo, k -> {
            Map<String, BidderEvaluationState> states = new LinkedHashMap<>();
            
            if (tenderNo.equals("TND-0041")) {
                // Bidder 1: Technical Passed (Technical scored >= 60, Financial all 0)
                BidderEvaluationState bid1 = new BidderEvaluationState("BID-001", "Apex Build Ltd.", "In Progress", "PASS");
                bid1.technicalCriteria.get(0).score = 70;
                bid1.technicalCriteria.get(0).comment = "Clear methodology and diagrams.";
                bid1.technicalCriteria.get(1).score = 68;
                bid1.technicalCriteria.get(1).comment = "Good experience, lack of senior roles.";
                bid1.technicalCriteria.get(2).score = 72;
                bid1.technicalCriteria.get(2).comment = "Feasible schedule.";
                bid1.technicalCriteria.get(3).score = 64;
                bid1.technicalCriteria.get(3).comment = "Standard client references.";
                
                bid1.evaluationNotes = "Solid technical proposal.";
                bid1.lastSaved = "10 Feb 2026, 11:00";
                states.put("BID-001", bid1);

                // Bidder 2: Financial Passed (Technical scored >= 60, Financial scored >= 60)
                BidderEvaluationState bid2 = new BidderEvaluationState("BID-002", "Vertex Solutions", "Submitted", "PASS");
                bid2.technicalCriteria.get(0).score = 80;
                bid2.technicalCriteria.get(1).score = 85;
                bid2.technicalCriteria.get(2).score = 75;
                bid2.technicalCriteria.get(3).score = 80;
                
                bid2.financialCriteria.get(0).score = 85;
                bid2.financialCriteria.get(0).comment = "Highly competitive pricing.";
                bid2.financialCriteria.get(1).score = 80;
                bid2.financialCriteria.get(1).comment = "Acceptable payment milestones.";
                bid2.financialCriteria.get(2).score = 90;
                bid2.financialCriteria.get(2).comment = "Excellent warranty and support SLA.";
                
                bid2.evaluationNotes = "Excellent in both technical and financial criteria.";
                bid2.lastSaved = "12 Feb 2026, 14:30";
                states.put("BID-002", bid2);
            } else if (tenderNo.equals("TND-0042")) {
                // Bidder 3: Financial Failed (Technical scored >= 60, Financial scored < 60)
                BidderEvaluationState bid3 = new BidderEvaluationState("BID-003", "BuildCo", "Submitted", "PASS");
                bid3.technicalCriteria.get(0).score = 75;
                bid3.technicalCriteria.get(1).score = 70;
                bid3.technicalCriteria.get(2).score = 75;
                bid3.technicalCriteria.get(3).score = 70;
                
                bid3.financialCriteria.get(0).score = 40;
                bid3.financialCriteria.get(0).comment = "Extremely high bid price.";
                bid3.financialCriteria.get(1).score = 30;
                bid3.financialCriteria.get(1).comment = "Rigid payment term requirements.";
                bid3.financialCriteria.get(2).score = 50;
                bid3.financialCriteria.get(2).comment = "Basic warranty support.";
                
                bid3.evaluationNotes = "Technical proposal is good, but pricing is extremely high.";
                bid3.lastSaved = "15 Feb 2026, 09:15";
                states.put("BID-003", bid3);

                // Bidder 4: Not Reviewed (Not Started)
                BidderEvaluationState bid4 = new BidderEvaluationState("BID-004", "Green Spaces Ltd.", "Not Started", "PENDING");
                states.put("BID-004", bid4);
            } else {
                // Bidder 5: Evaluation Failed (Technical scored < 60)
                BidderEvaluationState bid5 = new BidderEvaluationState("BID-005", "Cloudify", "Submitted", "FAIL");
                bid5.technicalCriteria.get(0).score = 40;
                bid5.technicalCriteria.get(0).comment = "Unclear methodology description.";
                bid5.technicalCriteria.get(1).score = 50;
                bid5.technicalCriteria.get(1).comment = "Inadequate CV profiles.";
                bid5.technicalCriteria.get(2).score = 45;
                bid5.technicalCriteria.get(2).comment = "Schedules are not realistic.";
                bid5.technicalCriteria.get(3).score = 35;
                bid5.technicalCriteria.get(3).comment = "Poor references.";
                
                bid5.evaluationNotes = "Failed to meet minimum technical threshold.";
                bid5.lastSaved = "18 Feb 2026, 16:45";
                states.put("BID-005", bid5);

                // Bidder 6: Not Reviewed (Not Started)
                BidderEvaluationState bid6 = new BidderEvaluationState("BID-006", "DataSafe", "Not Started", "PENDING");
                states.put("BID-006", bid6);
            }
            
            return states;
        });
    }

    @GetMapping("/{tenderNo}/data")
    @Operation(summary = "Get full evaluation mockup data for a tender")
    public ResponseEntity<ApiResponse<TenderEvaluationData>> getEvaluationData(@PathVariable String tenderNo) {
        Map<String, BidderEvaluationState> bidderStates = getOrCreateTenderState(tenderNo);
        
        TenderEvaluationData data = new TenderEvaluationData();
        data.tenderNo = tenderNo;
        data.tenderTitle = tenderNo.equals("TND-0041") ? "ERP System Upgrade" : "Infrastructure Enhancement Procurement";
        data.department = "IT & Software";
        data.weighting = "Technical 70% / Financial 30%";
        data.dueDate = "28 Feb 2026";
        data.threshold = 60;
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
    }

    @PostMapping("/{tenderNo}/save")
    @Operation(summary = "Save draft evaluation scores for a bidder")
    public ResponseEntity<ApiResponse<BidderEvaluationState>> saveDraft(
            @PathVariable String tenderNo,
            @RequestBody SaveEvaluationRequest request) {
        
        Map<String, BidderEvaluationState> bidderStates = getOrCreateTenderState(tenderNo);
        BidderEvaluationState bidder = bidderStates.get(request.bidderId);
        
        if (bidder == null) {
            return ResponseEntity.notFound().build();
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
        if (request.status != null) {
            bidder.status = request.status;
        } else if (bidder.status.equals("Not Started")) {
            bidder.status = "In Progress";
        }
        
        // Update last saved timestamp
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        bidder.lastSaved = now.format(formatter);

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
            return ResponseEntity.notFound().build();
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
        
        bidder.status = "Submitted";
        
        // Update compliance status based on score
        double techSubtotal = 0;
        for (Criterion c : bidder.technicalCriteria) {
            techSubtotal += c.score * (c.weight / 100.0);
        }
        bidder.complianceStatus = techSubtotal >= 60 ? "PASS" : "FAIL";

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        bidder.lastSaved = now.format(formatter);

        return ResponseEntity.ok(ApiResponse.success(bidder, "Evaluation submitted successfully"));
    }

    public static class StatusCountsResponse {
        public int technicalPassed;
        public int financialPassed;
        public int financialFailed;
        public int evaluationFailed;
        public int notReviewed;

        public StatusCountsResponse(int technicalPassed, int financialPassed, int financialFailed, int evaluationFailed, int notReviewed) {
            this.technicalPassed = technicalPassed;
            this.financialPassed = financialPassed;
            this.financialFailed = financialFailed;
            this.evaluationFailed = evaluationFailed;
            this.notReviewed = notReviewed;
        }
    }

    @GetMapping("/dashboard/status-counts")
    @Operation(summary = "Get evaluation status counts for the dashboard")
    public ResponseEntity<ApiResponse<StatusCountsResponse>> getStatusCounts() {
        // Ensure default tenders are pre-populated in tenderStates map
        getOrCreateTenderState("TND-0041");
        getOrCreateTenderState("TND-0042");
        getOrCreateTenderState("TND-0043");

        int technicalPassed = 0;
        int financialPassed = 0;
        int financialFailed = 0;
        int evaluationFailed = 0;
        int notReviewed = 0;

        for (Map<String, BidderEvaluationState> bidders : tenderStates.values()) {
            for (BidderEvaluationState bidder : bidders.values()) {
                if (bidder.status.equals("Not Started")) {
                    notReviewed++;
                    continue;
                }

                // Calculate sub-scores
                double techSubtotal = 0;
                for (Criterion c : bidder.technicalCriteria) {
                    techSubtotal += c.score * (c.weight / 100.0);
                }

                double finSubtotal = 0;
                boolean hasFinancialScores = false;
                for (Criterion c : bidder.financialCriteria) {
                    finSubtotal += c.score * (c.weight / 100.0);
                    if (c.score > 0) {
                        hasFinancialScores = true;
                    }
                }

                if (techSubtotal < 60 || bidder.complianceStatus.equals("FAIL")) {
                    evaluationFailed++;
                } else {
                    // techSubtotal >= 60 (Passed technical)
                    if (!hasFinancialScores) {
                        technicalPassed++;
                    } else {
                        if (finSubtotal >= 60) {
                            financialPassed++;
                        } else {
                            financialFailed++;
                        }
                    }
                }
            }
        }

        StatusCountsResponse counts = new StatusCountsResponse(
                technicalPassed,
                financialPassed,
                financialFailed,
                evaluationFailed,
                notReviewed
        );

        return ResponseEntity.ok(ApiResponse.success(counts, "Status counts retrieved successfully"));
    }
}
