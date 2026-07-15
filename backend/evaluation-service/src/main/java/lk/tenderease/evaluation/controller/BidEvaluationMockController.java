package lk.tenderease.evaluation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.tenderease.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lk.tenderease.evaluation.entity.Evaluation;
import lk.tenderease.evaluation.entity.EvaluationCriteria;
import lk.tenderease.evaluation.entity.EvaluationScore;
import lk.tenderease.evaluation.entity.EvaluationResult;
import lk.tenderease.evaluation.entity.RecommendationNote;
import lk.tenderease.evaluation.repository.EvaluationRepository;
import lk.tenderease.evaluation.repository.EvaluationCriteriaRepository;
import lk.tenderease.evaluation.repository.EvaluationScoreRepository;
import lk.tenderease.evaluation.repository.EvaluationResultRepository;
import lk.tenderease.evaluation.repository.RecommendationNoteRepository;
import lk.tenderease.common.constant.EvaluationStatus;
import lk.tenderease.common.constant.ComplianceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/evaluations/mock")
@Tag(name = "Mock Bid Evaluation API", description = "Mock APIs for frontend development of the Bid Evaluation panel")
public class BidEvaluationMockController {

    // In-memory database mapping: tenderNo -> (bidderId -> BidderEvaluationState)
    private static final Map<String, Map<String, BidderEvaluationState>> tenderStates = new ConcurrentHashMap<>();

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private EvaluationCriteriaRepository evaluationCriteriaRepository;

    @Autowired
    private EvaluationScoreRepository evaluationScoreRepository;

    @Autowired
    private EvaluationResultRepository evaluationResultRepository;

    @Autowired
    private RecommendationNoteRepository recommendationNoteRepository;

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
            
            if (tenderNo.equals("TND-0041")) {
                // Bidder 1: Technical Passed (Technical scored >= 75, Financial all 0)
                BidderEvaluationState bid1 = new BidderEvaluationState("BID-001", "Apex Build Ltd.", "In Progress", "PASS");
                bid1.technicalCriteria.get(0).score = 80;
                bid1.technicalCriteria.get(0).comment = "Clear methodology and diagrams.";
                bid1.technicalCriteria.get(1).score = 80;
                bid1.technicalCriteria.get(1).comment = "Good experience.";
                bid1.technicalCriteria.get(2).score = 80;
                bid1.technicalCriteria.get(2).comment = "Feasible schedule.";
                bid1.technicalCriteria.get(3).score = 80;
                bid1.technicalCriteria.get(3).comment = "Standard client references.";
                
                bid1.evaluationNotes = "Solid technical proposal.";
                bid1.lastSaved = "10 Feb 2026, 11:00";
                initialStates.put("BID-001", bid1);

                // Bidder 2: Financial Passed (Technical scored >= 75, Financial scored >= 75)
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
                initialStates.put("BID-002", bid2);
            } else if (tenderNo.equals("TND-0042")) {
                // Bidder 3: Financial Failed (Technical scored >= 75, Financial scored < 75)
                BidderEvaluationState bid3 = new BidderEvaluationState("BID-003", "BuildCo", "Submitted", "PASS");
                bid3.technicalCriteria.get(0).score = 80;
                bid3.technicalCriteria.get(1).score = 80;
                bid3.technicalCriteria.get(2).score = 80;
                bid3.technicalCriteria.get(3).score = 80;
                
                bid3.financialCriteria.get(0).score = 40;
                bid3.financialCriteria.get(0).comment = "Extremely high bid price.";
                bid3.financialCriteria.get(1).score = 30;
                bid3.financialCriteria.get(1).comment = "Rigid payment term requirements.";
                bid3.financialCriteria.get(2).score = 50;
                bid3.financialCriteria.get(2).comment = "Basic warranty support.";
                
                bid3.evaluationNotes = "Technical proposal is good, but pricing is extremely high.";
                bid3.lastSaved = "15 Feb 2026, 09:15";
                initialStates.put("BID-003", bid3);

                // Bidder 4: Not Reviewed (Not Started)
                BidderEvaluationState bid4 = new BidderEvaluationState("BID-004", "Green Spaces Ltd.", "Not Started", "PENDING");
                initialStates.put("BID-004", bid4);
            } else {
                // Bidder 5: Evaluation Failed (Technical scored < 75)
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
                initialStates.put("BID-005", bid5);

                // Bidder 6: Not Reviewed (Not Started)
                BidderEvaluationState bid6 = new BidderEvaluationState("BID-006", "DataSafe", "Not Started", "PENDING");
                initialStates.put("BID-006", bid6);
            }
            
            return initialStates;
        });

        // Query database and enrich/override in-memory states
        UUID tenderUuid = resolveTenderUuid(tenderNo);

        try {
            List<Evaluation> dbEvaluations = evaluationRepository.findByTenderId(tenderUuid);
            for (Evaluation eval : dbEvaluations) {
                String bidIdStr = eval.getBidId().toString();
                BidderEvaluationState bidderState = states.get(bidIdStr);
                if (bidderState == null) {
                    String bidderName = "Bidder " + bidIdStr.substring(0, 8);
                    try {
                        RestTemplate restTemplate = new RestTemplate();
                        String bidUrl = "http://localhost:8083/api/bids/" + eval.getBidId();
                        Map<?, ?> bidResponse = restTemplate.getForObject(bidUrl, Map.class);
                        if (bidResponse != null && bidResponse.get("data") != null) {
                            Map<?, ?> bidData = (Map<?, ?>) bidResponse.get("data");
                            bidderName = bidData.get("companyName") != null ? bidData.get("companyName").toString() : 
                                         (bidData.get("bidderName") != null ? bidData.get("bidderName").toString() : bidderName);
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                    bidderState = new BidderEvaluationState(bidIdStr, bidderName, 
                            eval.getStatus() == EvaluationStatus.COMPLETED ? "Submitted" : "In Progress", 
                            eval.getComplianceStatus() != null ? eval.getComplianceStatus().toString() : "PENDING");
                    states.put(bidIdStr, bidderState);
                }

                bidderState.status = eval.getStatus() == EvaluationStatus.COMPLETED ? "Submitted" : "In Progress";
                bidderState.complianceStatus = eval.getComplianceStatus() != null ? eval.getComplianceStatus().toString() : "PENDING";
                bidderState.evaluationNotes = eval.getRemarks() != null ? eval.getRemarks() : "";

                if (eval.getEvaluatedAt() != null) {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
                    bidderState.lastSaved = eval.getEvaluatedAt().format(formatter);
                }

                // Load scores
                List<EvaluationScore> scores = evaluationScoreRepository.findByEvaluationId(eval.getId());
                for (EvaluationScore score : scores) {
                    String criteriaName = score.getCriteria().getName();
                    double val = score.getScore() != null ? score.getScore().doubleValue() : 0.0;
                    String comment = score.getComment() != null ? score.getComment() : "";

                    // Find in technical criteria
                    for (Criterion c : bidderState.technicalCriteria) {
                        if (c.name.equalsIgnoreCase(criteriaName)) {
                            c.score = val;
                            c.comment = comment;
                        }
                    }
                    // Find in financial criteria
                    for (Criterion c : bidderState.financialCriteria) {
                        if (c.name.equalsIgnoreCase(criteriaName)) {
                            c.score = val;
                            c.comment = comment;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error enriching states from database for tender " + tenderNo + ": " + e.getMessage());
        }

        return states;
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
                        bidderName = bidData.get("companyName") != null ? bidData.get("companyName").toString() : 
                                     (bidData.get("bidderName") != null ? bidData.get("bidderName").toString() : bidderName);
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
        if (request.status != null) {
            bidder.status = request.status;
        } else if (bidder.status.equals("Not Started")) {
            bidder.status = "In Progress";
        }
        
        // Update last saved timestamp
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
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
                        bidderName = bidData.get("companyName") != null ? bidData.get("companyName").toString() : 
                                     (bidData.get("bidderName") != null ? bidData.get("bidderName").toString() : bidderName);
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
        
        bidder.status = "Submitted";
        
        // Update compliance status based on score
        double techSubtotal = 0;
        for (Criterion c : bidder.technicalCriteria) {
            techSubtotal += c.score * (c.weight / 100.0);
        }
        bidder.complianceStatus = techSubtotal >= 75 ? "PASS" : "FAIL";

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        bidder.lastSaved = now.format(formatter);

        // ══════════════════════════════════════════════════════════════════════════
        // PERSIST EVALUATION TO DATABASE FOR AWARD PROCESSING
        // ══════════════════════════════════════════════════════════════════════════
        UUID tenderUuid = resolveTenderUuid(tenderNo);
        String tenderTitle = "ERP System Upgrade";
        String departmentName = "IT & Software";
        BigDecimal estimatedBudget = BigDecimal.valueOf(10000000);
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String tenderServiceUrl = "http://localhost:8082/api/tenders/" + tenderNo;
            Map<?, ?> tenderDetail = restTemplate.getForObject(tenderServiceUrl, Map.class);
            if (tenderDetail != null) {
                if (tenderDetail.get("title") != null) {
                    tenderTitle = tenderDetail.get("title").toString();
                }
                if (tenderDetail.get("departmentName") != null) {
                    departmentName = tenderDetail.get("departmentName").toString();
                }
                if (tenderDetail.get("estimatedBudget") != null) {
                    estimatedBudget = new BigDecimal(tenderDetail.get("estimatedBudget").toString());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch tender details in submitEvaluation: " + e.getMessage());
        }

        // Fetch bids from bid-service
        UUID bidUuid = null;
        try {
            bidUuid = UUID.fromString(request.bidderId);
        } catch (Exception e) {
            // request.bidderId is not a valid UUID (e.g. mock ID "BID-001")
        }

        BigDecimal bidAmount = BigDecimal.ZERO;
        String currency = "LKR";
        List<?> bidsList = null;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String bidServiceUrl = "http://localhost:8083/api/bids/tender/" + tenderUuid;
            Map<?, ?> bidsResponse = restTemplate.getForObject(bidServiceUrl, Map.class);
            if (bidsResponse != null && bidsResponse.get("data") != null) {
                bidsList = (List<?>) bidsResponse.get("data");
                
                // If we parsed the bid UUID successfully, try to match it directly
                if (bidUuid != null) {
                    for (Object bidObj : bidsList) {
                        if (bidObj instanceof Map) {
                            Map<?, ?> bidMap = (Map<?, ?>) bidObj;
                            UUID currentBidId = UUID.fromString(bidMap.get("id").toString());
                            if (currentBidId.equals(bidUuid)) {
                                if (bidMap.get("bidAmount") != null) {
                                    bidAmount = new BigDecimal(bidMap.get("bidAmount").toString());
                                }
                                if (bidMap.get("currency") != null) {
                                    currency = bidMap.get("currency").toString();
                                }
                                break;
                            }
                        }
                    }
                } else {
                    // Try name matching or index matching fallback for mock/non-UUID bidder IDs
                    for (Object bidObj : bidsList) {
                        if (bidObj instanceof Map) {
                            Map<?, ?> bidMap = (Map<?, ?>) bidObj;
                            String companyName = bidMap.get("companyName") != null ? bidMap.get("companyName").toString() : "";
                            String bidderName = bidMap.get("bidderName") != null ? bidMap.get("bidderName").toString() : "";
                            if (companyName.equalsIgnoreCase(bidder.bidderName) || bidderName.equalsIgnoreCase(bidder.bidderName)) {
                                bidUuid = UUID.fromString(bidMap.get("id").toString());
                                if (bidMap.get("bidAmount") != null) {
                                    bidAmount = new BigDecimal(bidMap.get("bidAmount").toString());
                                }
                                if (bidMap.get("currency") != null) {
                                    currency = bidMap.get("currency").toString();
                                }
                                break;
                            }
                        }
                    }
                    
                    // Fallback to match by index if no name match
                    if (bidUuid == null && !bidsList.isEmpty()) {
                        int index = 0;
                        if (request.bidderId.startsWith("BID-")) {
                            try {
                                index = Integer.parseInt(request.bidderId.substring(4)) - 1;
                            } catch (Exception ignored) {}
                        }
                        if (index < 0) index = 0;
                        if (index >= bidsList.size()) index = bidsList.size() - 1;
                        
                        Object bidObj = bidsList.get(index);
                        if (bidObj instanceof Map) {
                            Map<?, ?> bidMap = (Map<?, ?>) bidObj;
                            bidUuid = UUID.fromString(bidMap.get("id").toString());
                            if (bidMap.get("bidAmount") != null) {
                                bidAmount = new BigDecimal(bidMap.get("bidAmount").toString());
                            }
                            if (bidMap.get("currency") != null) {
                                currency = bidMap.get("currency").toString();
                            }
                        }
                    }
                }
            }
        } catch (Exception fetchBidsEx) {
            System.err.println("Failed to fetch bids in submitEvaluation: " + fetchBidsEx.getMessage());
        }

        if (bidUuid == null) {
            try {
                bidUuid = UUID.fromString(request.bidderId);
            } catch (Exception parseUuidEx) {
                bidUuid = UUID.nameUUIDFromBytes(request.bidderId.getBytes());
            }
        }

        double finSubtotal = 0;
        for (Criterion c : bidder.financialCriteria) {
            finSubtotal += c.score * (c.weight / 100.0);
        }
        double compositeScore = techSubtotal * 0.7 + (techSubtotal >= 75 ? finSubtotal * 0.3 : 0.0);

        // Save Evaluation entity
        UUID evaluatorUuid = UUID.fromString("00000000-0000-0000-0000-000000000001");
        Evaluation evaluation = evaluationRepository.findByBidIdAndEvaluatorId(bidUuid, evaluatorUuid)
                .orElse(new Evaluation());
        evaluation.setTenderId(tenderUuid);
        evaluation.setBidId(bidUuid);
        evaluation.setEvaluatorId(evaluatorUuid);
        evaluation.setStatus(EvaluationStatus.COMPLETED);
        evaluation.setIsFlagged(false);
        evaluation.setComplianceStatus(techSubtotal >= 75 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT);
        evaluation.setTotalScore(BigDecimal.valueOf(compositeScore));
        evaluation.setRemarks(request.notes != null ? request.notes : "");
        evaluation.setEvaluatedAt(LocalDateTime.now());
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        // Save EvaluationScores and Criteria
        List<EvaluationCriteria> dbCriteria = evaluationCriteriaRepository.findByTenderId(tenderUuid);
        
        for (Criterion c : bidder.technicalCriteria) {
            saveScoreForCriterion(savedEvaluation, c, dbCriteria, tenderUuid);
        }
        for (Criterion c : bidder.financialCriteria) {
            saveScoreForCriterion(savedEvaluation, c, dbCriteria, tenderUuid);
        }

        // Determine winning bidder
        List<Evaluation> allEvaluations = evaluationRepository.findByTenderId(tenderUuid);
        UUID winningBidId = null;
        BigDecimal maxScore = BigDecimal.ZERO;
        String winningBidderName = bidder.bidderName;
        BigDecimal winningBidAmount = bidAmount;
        
        for (Evaluation eval : allEvaluations) {
            if (eval.getComplianceStatus() == ComplianceStatus.COMPLIANT) {
                if (eval.getTotalScore() != null && eval.getTotalScore().compareTo(maxScore) > 0) {
                    maxScore = eval.getTotalScore();
                    winningBidId = eval.getBidId();
                }
            }
        }
        
        if (winningBidId != null) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String bidUrl = "http://localhost:8083/api/bids/tender/" + tenderUuid;
                Map<?, ?> bidsResponse = restTemplate.getForObject(bidUrl, Map.class);
                if (bidsResponse != null && bidsResponse.get("data") != null) {
                    List<?> winnerBidsList = (List<?>) bidsResponse.get("data");
                    for (Object bidObj : winnerBidsList) {
                        if (bidObj instanceof Map) {
                            Map<?, ?> bidMap = (Map<?, ?>) bidObj;
                            UUID currentBidId = UUID.fromString(bidMap.get("id").toString());
                            if (currentBidId.equals(winningBidId)) {
                                winningBidderName = bidMap.get("companyName") != null ? bidMap.get("companyName").toString() : 
                                                    (bidMap.get("bidderName") != null ? bidMap.get("bidderName").toString() : winningBidderName);
                                if (bidMap.get("bidAmount") != null) {
                                    winningBidAmount = new BigDecimal(bidMap.get("bidAmount").toString());
                                }
                                break;
                            }
                        }
                    }
                }
            } catch (Exception fetchWinningBidEx) {
                System.err.println("Failed to fetch winning bid details: " + fetchWinningBidEx.getMessage());
            }
            
            // Save EvaluationResult
            EvaluationResult evalResult = evaluationResultRepository.findByTenderId(tenderUuid)
                    .orElse(new EvaluationResult());
            evalResult.setTenderId(tenderUuid);
            evalResult.setWinningBidId(winningBidId);
            evalResult.setFinalScore(maxScore);
            evalResult.setStatus("FINALIZED");
            evalResult.setApprovedAt(LocalDateTime.now());
            evaluationResultRepository.save(evalResult);

            // Save RecommendationNote
            RecommendationNote recNote = recommendationNoteRepository.findAllByOrderByCreatedAtDesc().stream()
                    .filter(rn -> rn.getTenderId().equals(tenderNo))
                    .findFirst()
                    .orElse(new RecommendationNote());
            
            recNote.setTenderId(tenderNo);
            recNote.setTenderName(tenderTitle);
            recNote.setDepartment(departmentName);
            recNote.setEstimatedBudget(estimatedBudget);
            recNote.setBidderName(winningBidderName);
            recNote.setRecommendedValue(winningBidAmount);
            recNote.setFinalScore(maxScore.doubleValue());
            recNote.setJustification(request.notes != null ? request.notes : "Recommended based on scoring criteria.");
            recNote.setStatus(RecommendationNote.RecommendationStatus.PENDING);
            recommendationNoteRepository.save(recNote);
        }

        // Determine if all bids have been evaluated
        boolean allEvaluated = false;
        if (bidsList != null && !bidsList.isEmpty()) {
            long completedCount = allEvaluations.stream()
                    .filter(ev -> ev.getStatus() == EvaluationStatus.COMPLETED)
                    .count();
            if (completedCount >= bidsList.size()) {
                allEvaluated = true;
            }
        } else {
            // Fallback: check in-memory status map
            boolean allSubmitted = true;
            for (BidderEvaluationState s : bidderStates.values()) {
                if (!"Submitted".equalsIgnoreCase(s.status)) {
                    allSubmitted = false;
                    break;
                }
            }
            allEvaluated = allSubmitted;
        }

        // Update tender status to CLOSED (which maps to COMPLETED) or EVALUATION in tender-service
        try {
            RestTemplate restTemplate = new RestTemplate();
            String statusToSet = allEvaluated ? "CLOSED" : "EVALUATION";
            String updateUrl = "http://localhost:8082/api/v1/tenders/" + tenderUuid + "/status?status=" + statusToSet;
            restTemplate.put(updateUrl, null);
        } catch (Exception tenderUpdateEx) {
            System.err.println("Failed to update tender status: " + tenderUpdateEx.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(bidder, "Evaluation submitted successfully"));
    }

    private void saveScoreForCriterion(Evaluation evaluation, Criterion c, List<EvaluationCriteria> dbCriteria, UUID tenderId) {
        EvaluationCriteria criteria = null;
        for (EvaluationCriteria ec : dbCriteria) {
            if (ec.getName().equalsIgnoreCase(c.name)) {
                criteria = ec;
                break;
            }
        }
        
        if (criteria == null) {
            criteria = new EvaluationCriteria();
            criteria.setTenderId(tenderId);
            criteria.setName(c.name);
            criteria.setDescription(c.description != null ? c.description : "");
            criteria.setWeight(BigDecimal.valueOf(c.weight));
            criteria = evaluationCriteriaRepository.save(criteria);
        }
        
        final UUID criteriaId = criteria.getId();
        List<EvaluationScore> scores = evaluationScoreRepository.findByEvaluationId(evaluation.getId());
        EvaluationScore score = null;
        for (EvaluationScore es : scores) {
            if (es.getCriteria().getId().equals(criteriaId)) {
                score = es;
                break;
            }
        }
        if (score == null) {
            score = new EvaluationScore();
        }
                
        score.setEvaluation(evaluation);
        score.setCriteria(criteria);
        score.setScore(BigDecimal.valueOf(c.score));
        score.setComment(c.comment != null ? c.comment : "");
        evaluationScoreRepository.save(score);
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

                if (techSubtotal < 75 || bidder.complianceStatus.equals("FAIL")) {
                    evaluationFailed++;
                } else {
                    // techSubtotal >= 75 (Passed technical)
                    if (!hasFinancialScores) {
                        technicalPassed++;
                    } else {
                        if (finSubtotal >= 75) {
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
