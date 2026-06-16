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
            
            // 9 Bidders as defined in the wireframes
            states.put("BID-001", new BidderEvaluationState("BID-001", "Apex Build Ltd.", "Submitted", "PASS"));
            states.put("BID-002", new BidderEvaluationState("BID-002", "ClearTech Solutions", "In Progress", "PASS"));
            states.put("BID-003", new BidderEvaluationState("BID-003", "DataSphere Inc.", "Not Started", "PENDING"));
            states.put("BID-004", new BidderEvaluationState("BID-004", "GridX Enterprise", "Submitted", "PASS"));
            states.put("BID-005", new BidderEvaluationState("BID-005", "Helix Networks", "Not Started", "PENDING"));
            states.put("BID-006", new BidderEvaluationState("BID-006", "Innosoft Group", "In Progress", "PENDING"));
            states.put("BID-007", new BidderEvaluationState("BID-007", "NovaPrime Co.", "Not Started", "PENDING"));
            states.put("BID-008", new BidderEvaluationState("BID-008", "Omega Management", "Submitted", "PASS"));
            states.put("BID-009", new BidderEvaluationState("BID-009", "SkyRoute Systems", "Not Started", "PENDING"));

            // Pre-fill some default wireframe values for BID-002
            BidderEvaluationState bid2 = states.get("BID-002");
            bid2.technicalCriteria.get(0).score = 72;
            bid2.technicalCriteria.get(0).comment = "Solution is well-structured. ERP mapping is clear.";
            bid2.technicalCriteria.get(1).score = 75;
            bid2.technicalCriteria.get(1).comment = "3 senior engineers with ERP certs provided.";
            bid2.technicalCriteria.get(2).score = 65;
            bid2.technicalCriteria.get(2).comment = "Timeline is feasible. Risk register is minimal.";
            bid2.technicalCriteria.get(3).score = 55;
            bid2.technicalCriteria.get(3).comment = "Only 2 references. No large-scale government projects.";
            
            bid2.financialCriteria.get(0).score = 80;
            bid2.financialCriteria.get(0).comment = "Price is within 8% of lowest bid. Competitive.";
            bid2.financialCriteria.get(1).score = 70;
            bid2.financialCriteria.get(1).comment = "Reasonable milestone split. Advance payment is 20%.";
            bid2.financialCriteria.get(2).score = 65;
            bid2.financialCriteria.get(2).comment = "2-year warranty offered. Training for 10 staff.";

            bid2.evaluationNotes = "Overall satisfactory response. Recommended with standard adjustments.";
            bid2.lastSaved = "11 Feb 2026, 14:32";
            
            // Pre-fill other submitted bidders' scores to make them realistic
            fillMockSubmitted(states.get("BID-001"), 68, 70);
            fillMockSubmitted(states.get("BID-004"), 75, 82);
            fillMockSubmitted(states.get("BID-008"), 80, 78);

            return states;
        });
    }

    private void fillMockSubmitted(BidderEvaluationState bidder, double techBase, double finBase) {
        bidder.technicalCriteria.get(0).score = techBase + 2;
        bidder.technicalCriteria.get(1).score = techBase - 3;
        bidder.technicalCriteria.get(2).score = techBase + 5;
        bidder.technicalCriteria.get(3).score = techBase - 1;
        
        bidder.financialCriteria.get(0).score = finBase + 1;
        bidder.financialCriteria.get(1).score = finBase - 2;
        bidder.financialCriteria.get(2).score = finBase + 4;
        bidder.lastSaved = "10 Feb 2026, 11:00";
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
}
