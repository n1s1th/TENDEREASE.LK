"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Search, Lock, Unlock, FileText, CheckCircle2, AlertTriangle, 
  X, Download, Save, FileSpreadsheet, ChevronRight, HelpCircle, ArrowLeft, Loader2
} from "lucide-react";
import TenderLayout from "@/components/tender/TenderLayout";

// Interface definitions mirroring backend
interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  comment: string;
}

interface BidderState {
  bidderId: string;
  bidderName: string;
  status: "Submitted" | "In Progress" | "Not Started" | string;
  complianceStatus: "PASS" | "FAIL" | "PENDING" | string;
  documents: string[];
  technicalCriteria: Criterion[];
  financialCriteria: Criterion[];
  evaluationNotes: string;
  evaluatorName: string;
  evaluatorRole: string;
  lastSaved: string;
}

interface TenderData {
  tenderNo: string;
  tenderTitle: string;
  department: string;
  weighting: string;
  dueDate: string;
  threshold: number;
  bidders: BidderState[];
}

// Full offline fallback data ensuring the page renders completely even if the backend is offline
const INITIAL_MOCK_DATA: TenderData = {
  tenderNo: "TND-0041",
  tenderTitle: "ERP System Upgrade",
  department: "IT & Software",
  weighting: "Technical 70% / Financial 30%",
  dueDate: "28 Feb 2026",
  threshold: 60,
  bidders: [
    {
      bidderId: "BID-001",
      bidderName: "Apex Build Ltd.",
      status: "Submitted",
      complianceStatus: "PASS",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf", "Company Profile.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 70, comment: "Clear methodology and diagrams." },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 68, comment: "Good experience, lack of senior roles." },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 72, comment: "Feasible schedule." },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 64, comment: "Standard client references." }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 75, comment: "Price is competitive." },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 68, comment: "Standard milestone split." },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 70, comment: "1-year warranty plus training." }
      ],
      evaluationNotes: "Solid proposal. Compliant with technical specs.",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "10 Feb 2026, 11:00"
    },
    {
      bidderId: "BID-002",
      bidderName: "ClearTech Solutions",
      status: "In Progress",
      complianceStatus: "PASS",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf", "Company Profile.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 72, comment: "Solution is well-structured. ERP mapping is clear." },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 75, comment: "3 senior engineers with ERP certs provided." },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 65, comment: "Timeline is feasible. Risk register is minimal." },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 55, comment: "Only 2 references. No large-scale government projects." }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 80, comment: "Price is within 8% of lowest bid. Competitive." },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 70, comment: "Reasonable milestone split. Advance payment is 20%." },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 65, comment: "2-year warranty offered. Training for 10 staff." }
      ],
      evaluationNotes: "Overall satisfactory response. Recommended with standard adjustments.",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "11 Feb 2026, 14:32"
    },
    {
      bidderId: "BID-003",
      bidderName: "DataSphere Inc.",
      status: "Not Started",
      complianceStatus: "PENDING",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 0, comment: "" },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 0, comment: "" },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 0, comment: "" },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 0, comment: "" }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 0, comment: "" },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 0, comment: "" },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 0, comment: "" }
      ],
      evaluationNotes: "",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "Never"
    },
    {
      bidderId: "BID-004",
      bidderName: "GridX Enterprise",
      status: "Submitted",
      complianceStatus: "PASS",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf", "Company Profile.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 77, comment: "High quality software design." },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 72, comment: "Good credentials, experienced PM." },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 80, comment: "Thorough risk register." },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 74, comment: "Several government projects listed." }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 81, comment: "Pricing is in line with expectations." },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 80, comment: "Favorable milestone terms." },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 84, comment: "Excellent support terms." }
      ],
      evaluationNotes: "Highly qualified. Exceptional technical design.",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "10 Feb 2026, 11:00"
    },
    {
      bidderId: "BID-005",
      bidderName: "Helix Networks",
      status: "Not Started",
      complianceStatus: "PENDING",
      documents: ["Technical Proposal.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 0, comment: "" },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 0, comment: "" },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 0, comment: "" },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 0, comment: "" }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 0, comment: "" },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 0, comment: "" },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 0, comment: "" }
      ],
      evaluationNotes: "",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "Never"
    },
    {
      bidderId: "BID-006",
      bidderName: "Innosoft Group",
      status: "In Progress",
      complianceStatus: "PENDING",
      documents: ["Technical Proposal.pdf", "Company Profile.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 62, comment: "Simple architecture." },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 58, comment: "Understaffed proposal." },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 60, comment: "Brief schedule." },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 62, comment: "Relevant past clients." }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 0, comment: "" },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 0, comment: "" },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 0, comment: "" }
      ],
      evaluationNotes: "Technical vetting in progress. Needs review on manpower.",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "12 Feb 2026, 09:15"
    },
    {
      bidderId: "BID-007",
      bidderName: "NovaPrime Co.",
      status: "Not Started",
      complianceStatus: "PENDING",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 0, comment: "" },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 0, comment: "" },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 0, comment: "" },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 0, comment: "" }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 0, comment: "" },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 0, comment: "" },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 0, comment: "" }
      ],
      evaluationNotes: "",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "Never"
    },
    {
      bidderId: "BID-008",
      bidderName: "Omega Management",
      status: "Submitted",
      complianceStatus: "PASS",
      documents: ["Technical Proposal.pdf", "Financial Offer.pdf", "Company Profile.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 82, comment: "Comprehensive methodology." },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 77, comment: "High numbers of certified professionals." },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 85, comment: "Excellent phase tracking." },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 79, comment: "Extensive regional experience." }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 79, comment: "Highly competitive pricing." },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 76, comment: "Flexible milestones." },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 82, comment: "3-year premium support package." }
      ],
      evaluationNotes: "Outstanding proposal. Strong team credentials.",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "10 Feb 2026, 11:00"
    },
    {
      bidderId: "BID-009",
      bidderName: "SkyRoute Systems",
      status: "Not Started",
      complianceStatus: "PENDING",
      documents: ["Technical Proposal.pdf", "Compliance Checklist.pdf"],
      technicalCriteria: [
        { id: "tech_1", name: "Technical Approach", description: "Methodology and solution alignment", weight: 30, score: 0, comment: "" },
        { id: "tech_2", name: "Team Qualifications", description: "CVs and relevant experience", weight: 25, score: 0, comment: "" },
        { id: "tech_3", name: "Implementation Plan", description: "Timeline, milestones, risk management", weight: 25, score: 0, comment: "" },
        { id: "tech_4", name: "Past Performance", description: "References and case studies", weight: 20, score: 0, comment: "" }
      ],
      financialCriteria: [
        { id: "fin_1", name: "Bid Price Competitiveness", description: "Relative to lowest compliant bid", weight: 50, score: 0, comment: "" },
        { id: "fin_2", name: "Payment Terms", description: "Milestone structure and flexibility", weight: 30, score: 0, comment: "" },
        { id: "fin_3", name: "Value-Added Services", description: "Training, support, warranty", weight: 20, score: 0, comment: "" }
      ],
      evaluationNotes: "",
      evaluatorName: "Jane Doe",
      evaluatorRole: "Senior Designer",
      lastSaved: "Never"
    }
  ]
};

export default function BidEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const tenderNo = (params?.id as string) || "TND-0041";

  // State initialized with offline fallback dataset so it renders immediately
  const [data, setData] = useState<TenderData>(INITIAL_MOCK_DATA);
  const [selectedBidderId, setSelectedBidderId] = useState<string>("BID-002");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModal, setActiveModal] = useState<null | "download" | "draft" | "submit" | "notes">(null);
  const [downloadFormat, setDownloadFormat] = useState<null | "pdf" | "excel">(null);
  const [notesText, setNotesText] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"technical" | "financial">("technical");
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // BASE URL for evaluation service API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

  // Fetch initial evaluation data from backend
  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/data`);
      if (!res.ok) throw new Error("Failed to fetch evaluation data");
      
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        
        // Find notes for active bidder to pre-populate notes text
        const activeBidder = json.data.bidders.find((b: BidderState) => b.bidderId === selectedBidderId) || json.data.bidders[0];
        if (activeBidder) {
          setNotesText(activeBidder.evaluationNotes || "");
        }
      }
    } catch (err) {
      console.log("Offline or backend unreachable - using rich local mock state.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenderNo]);

  // Handle bidder selection
  const handleSelectBidder = (bidderId: string) => {
    setSelectedBidderId(bidderId);
    if (data) {
      const bidder = data.bidders.find(b => b.bidderId === bidderId);
      if (bidder) {
        setNotesText(bidder.evaluationNotes || "");
      }
    }
  };

  // Toast Helper
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Get active bidder state
  const getActiveBidder = (): BidderState | null => {
    if (!data) return null;
    return data.bidders.find(b => b.bidderId === selectedBidderId) || null;
  };

  const activeBidder = getActiveBidder();

  // Score modifiers
  const handleScoreChange = (type: "technical" | "financial", criterionId: string, value: string) => {
    if (!data || !activeBidder) return;
    if (activeBidder.status === "Submitted") return; // Read-only

    // Limit value to range 0-100 or empty
    let scoreNum = value === "" ? 0 : parseFloat(value);
    if (isNaN(scoreNum)) scoreNum = 0;
    if (scoreNum > 100) scoreNum = 100;
    if (scoreNum < 0) scoreNum = 0;

    const updatedBidders = data.bidders.map(bidder => {
      if (bidder.bidderId === selectedBidderId) {
        if (type === "technical") {
          return {
            ...bidder,
            technicalCriteria: bidder.technicalCriteria.map(c => 
              c.id === criterionId ? { ...c, score: scoreNum } : c
            )
          };
        } else {
          return {
            ...bidder,
            financialCriteria: bidder.financialCriteria.map(c => 
              c.id === criterionId ? { ...c, score: scoreNum } : c
            )
          };
        }
      }
      return bidder;
    });

    setData({ ...data, bidders: updatedBidders });
  };

  // Comment modifiers
  const handleCommentChange = (type: "technical" | "financial", criterionId: string, value: string) => {
    if (!data || !activeBidder) return;
    if (activeBidder.status === "Submitted") return; // Read-only

    const updatedBidders = data.bidders.map(bidder => {
      if (bidder.bidderId === selectedBidderId) {
        if (type === "technical") {
          return {
            ...bidder,
            technicalCriteria: bidder.technicalCriteria.map(c => 
              c.id === criterionId ? { ...c, comment: value } : c
            )
          };
        } else {
          return {
            ...bidder,
            financialCriteria: bidder.financialCriteria.map(c => 
              c.id === criterionId ? { ...c, comment: value } : c
            )
          };
        }
      }
      return bidder;
    });

    setData({ ...data, bidders: updatedBidders });
  };

  // Calculations
  const calculateSubtotal = (criteria: Criterion[]): number => {
    if (!criteria) return 0;
    const total = criteria.reduce((sum, c) => {
      const weighted = c.score * (c.weight / 100);
      return sum + weighted;
    }, 0);
    return Math.round(total * 100) / 100; // 2 decimal places
  };

  const techSubtotal = activeBidder ? calculateSubtotal(activeBidder.technicalCriteria) : 0;
  const isTechPassed = techSubtotal >= (data?.threshold || 60);

  const finSubtotal = activeBidder ? calculateSubtotal(activeBidder.financialCriteria) : 0;

  // Composite score: Tech * 0.7 + Fin * 0.3
  const compositeScore = Math.round((techSubtotal * 0.7 + (isTechPassed ? finSubtotal * 0.3 : 0.0)) * 10) / 10;

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!activeBidder) return;
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderId: selectedBidderId,
          technicalCriteria: activeBidder.technicalCriteria,
          financialCriteria: activeBidder.financialCriteria,
          notes: notesText,
          status: "In Progress"
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Draft for ${activeBidder.bidderName} saved successfully!`, "success");
        // Update local status if it was Not Started
        const updatedBidders = data.bidders.map(b => {
          if (b.bidderId === selectedBidderId) {
            return {
              ...b,
              status: "In Progress",
              lastSaved: json.data.lastSaved
            };
          }
          return b;
        });
        setData({ ...data, bidders: updatedBidders });
        setActiveModal(null);
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      // Offline fallback: save locally and update timestamp
      const now = new Date();
      const formatter = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const updatedBidders = data.bidders.map(b => {
        if (b.bidderId === selectedBidderId) {
          return {
            ...b,
            status: "In Progress",
            evaluationNotes: notesText,
            lastSaved: formatter
          };
        }
        return b;
      });
      setData({ ...data, bidders: updatedBidders });
      showToast(`Draft for ${activeBidder.bidderName} saved successfully (Local State Only)!`, "success");
      setActiveModal(null);
    } finally {
      setSaving(false);
    }
  };

  // Submit Final Evaluation Action
  const handleSubmitEvaluation = async () => {
    if (!activeBidder) return;
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderId: selectedBidderId,
          technicalCriteria: activeBidder.technicalCriteria,
          financialCriteria: activeBidder.financialCriteria,
          notes: notesText
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Evaluation for ${activeBidder.bidderName} has been submitted and locked!`, "success");
        const updatedBidders = data.bidders.map(b => {
          if (b.bidderId === selectedBidderId) {
            return {
              ...b,
              status: "Submitted",
              complianceStatus: techSubtotal >= 60 ? "PASS" : "FAIL",
              lastSaved: json.data.lastSaved
            };
          }
          return b;
        });
        setData({ ...data, bidders: updatedBidders });
        setActiveModal(null);
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      // Offline fallback
      const now = new Date();
      const formatter = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const updatedBidders = data.bidders.map(b => {
        if (b.bidderId === selectedBidderId) {
          return {
            ...b,
            status: "Submitted",
            complianceStatus: techSubtotal >= 60 ? "PASS" : "FAIL",
            evaluationNotes: notesText,
            lastSaved: formatter
          };
        }
        return b;
      });
      setData({ ...data, bidders: updatedBidders });
      showToast(`Evaluation for ${activeBidder.bidderName} submitted & locked (Local State Only)!`, "success");
      setActiveModal(null);
    } finally {
      setSaving(false);
    }
  };

  // Save Notes Action
  const handleSaveNotes = () => {
    if (!activeBidder) return;
    const updatedBidders = data.bidders.map(b => {
      if (b.bidderId === selectedBidderId) {
        return {
          ...b,
          evaluationNotes: notesText
        };
      }
      return b;
    });
    setData({ ...data, bidders: updatedBidders });
    showToast("Notes updated in current state. Remember to click 'Save Draft' to persist changes.", "info");
    setActiveModal(null);
  };

  // Mock score sheet download
  const handleDownloadScoreSheet = () => {
    if (!activeBidder || !downloadFormat) return;
    showToast(`Downloading score sheet in ${downloadFormat.toUpperCase()} format...`, "success");
    setActiveModal(null);
    setDownloadFormat(null);
  };

  // Filter Bidders
  const filteredBidders = data.bidders.filter(b => 
    b.bidderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bidderId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compositeScore / 100) * circumference;

  return (
    <TenderLayout>
      <div className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-16 font-inter">
        
        {/* --- HEADER --- */}
        <div className="mb-8 px-2">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            <button onClick={() => router.push("/officer-dashboard")} className="hover:text-[#953002] transition-colors flex items-center gap-1">
              <ArrowLeft size={12} />
              OFFICER DASHBOARD
            </button>
            <ChevronRight className="w-3 h-3" />
            <span>{tenderNo}</span>
            <ChevronRight className="w-3 h-3 text-[#953002]" />
            <span className="text-[#953002]">BID EVALUATION</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-16 bg-[#953002] rounded-full mt-1"></div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                  Unified Bid Evaluation
                </h1>
                <p className="text-sm text-gray-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
                  <span>Tender: <strong className="text-gray-700">{tenderNo}</strong></span>
                  <span>•</span>
                  <span>Title: <strong className="text-gray-700">{data.tenderTitle}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-gray-700">{data.department}</strong></span>
                  <span>•</span>
                  <span>Weighting: <strong className="text-gray-700">{data.weighting}</strong></span>
                </p>
              </div>
            </div>

            {/* Badges container */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Due Date</span>
                <span className="text-xs font-extrabold text-gray-700">{data.dueDate}</span>
              </div>
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Total Bids</span>
                <span className="text-xs font-extrabold text-[#953002]">{data.bidders.length} Received</span>
              </div>
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Threshold</span>
                <span className="text-xs font-extrabold text-gray-700">{data.threshold} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOAST NOTIFICATION --- */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform scale-100 ${
            toast.type === "success" ? "bg-green-600 text-white" :
            toast.type === "error" ? "bg-red-600 text-white" :
            "bg-[#953002] text-white"
          }`}>
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5" />}
            {toast.type === "info" && <HelpCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-12 gap-8">

          {/* 1. BIDDERS SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-bold text-gray-800">Bidders</h2>
              <span className="bg-[#FFF7ED] text-[#953002] text-xs font-bold px-2 py-0.5 rounded-md">
                {data.bidders.length} total
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bidder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#953002] focus:bg-white transition-all text-gray-800"
              />
            </div>

            {/* Bidders List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 no-scrollbar animate-in fade-in duration-300">
              {filteredBidders.map((bidder) => {
                const isActive = bidder.bidderId === selectedBidderId;
                const initials = bidder.bidderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2);

                return (
                  <button
                    key={bidder.bidderId}
                    onClick={() => handleSelectBidder(bidder.bidderId)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                      isActive
                        ? "bg-[#FFF7ED] border-[#FFF7ED] shadow-sm"
                        : "bg-white border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      {/* Circle Initials */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-colors shrink-0 ${
                        isActive 
                          ? "bg-[#953002] text-white" 
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }`}>
                        {initials}
                      </div>

                      {/* Name & ID */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-gray-900 truncate">
                          {bidder.bidderName}
                        </h4>
                        <span className="text-xs text-gray-400 font-semibold uppercase block truncate">
                          {bidder.bidderId}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 ${
                      bidder.status === "Submitted"
                        ? "bg-red-50 text-[#953002] border border-[#953002]/10"
                        : bidder.status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/40"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}>
                      {bidder.status}
                    </span>
                  </button>
                );
              })}

              {filteredBidders.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No bidders found matching search
                </div>
              )}
            </div>
          </div>

          {/* 2. MIDDLE CONTENT SECTION */}
          {activeBidder && (
            <div className="col-span-12 lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
              
              {/* --- BID DOCUMENTS --- */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span>Bid Documents — {activeBidder.bidderName} ({activeBidder.bidderId})</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {activeBidder.documents.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => showToast(`Opening document: ${doc}`, "info")}
                      className="border border-gray-200 hover:border-[#953002] bg-[#FAF9F6] px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:text-[#953002] hover:bg-[#FFF7ED] transition-all"
                    >
                      <span>{doc}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => showToast(`Showing all 7 files for ${activeBidder.bidderName}`, "info")}
                    className="text-xs font-bold text-[#953002] hover:underline px-2 py-1"
                  >
                    View All (7)
                  </button>
                </div>
              </div>

              {/* --- EVALUATION WORKSPACE (TECHNICAL / FINANCIAL TABS) --- */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                
                {/* Tabs Header */}
                <div className="grid grid-cols-2 border-b border-gray-100 -mx-6 mb-6">
                  <button
                    onClick={() => setActiveTab("technical")}
                    className={`pb-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all relative ${
                      activeTab === "technical"
                        ? "border-[#953002] text-[#953002]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      activeTab === "technical" ? "bg-[#FFF7ED] text-[#953002]" : "bg-gray-100 text-gray-500"
                    }`}>1</span>
                    <span>Technical Evaluation</span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                      70%
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("financial")}
                    className={`pb-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all relative ${
                      activeTab === "financial"
                        ? "border-[#953002] text-[#953002]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      activeTab === "financial" ? "bg-[#FFF7ED] text-[#953002]" : "bg-gray-100 text-gray-500"
                    }`}>2</span>
                    <span>Financial Evaluation</span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                      30%
                    </span>
                    {!isTechPassed && (
                      <Lock size={12} className="text-[#953002] shrink-0" />
                    )}
                  </button>
                </div>

                {/* Technical Evaluation Tab Content */}
                {activeTab === "technical" && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FFF7ED] text-[#953002] text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg">
                          Technical Evaluation
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Max score: 100 pts
                      </span>
                    </div>

                    {/* Technical Score Progress Bar / PASS Badge */}
                    <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="w-full sm:w-2/3">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                          <span>Technical Score</span>
                          <span>{techSubtotal} / 100</span>
                        </div>
                        {/* Progress Track */}
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                          {/* Threshold Tick */}
                          <div className="absolute left-[60%] top-0 w-0.5 h-full bg-gray-400 z-10" title="Threshold: 60"></div>
                          <div 
                            className="h-full rounded-full transition-all duration-500 bg-[#27AE60]"
                            style={{ width: `${techSubtotal}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-[#E8F8F0] text-[#27AE60]">
                          PASS
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Threshold: 60
                        </span>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Criterion</th>
                            <th className="pb-3 text-center font-semibold">Weight</th>
                            <th className="pb-3 text-center font-semibold w-24">Score (0-100)</th>
                            <th className="pb-3 font-semibold">Evaluator Comment</th>
                            <th className="pb-3 text-right font-semibold">Weighted Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                          {activeBidder.technicalCriteria.map((c) => {
                            const weightedScore = Math.round(c.score * (c.weight / 100) * 100) / 100;
                            return (
                              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 pr-3 font-medium">
                                  <span className="block text-gray-800 font-bold">{c.name}</span>
                                  <span className="text-xs text-gray-400 font-normal">{c.description}</span>
                                </td>
                                <td className="py-4 text-center">
                                  <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                                    {c.weight}%
                                  </span>
                                </td>
                                <td className="py-4 text-center px-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={activeBidder.status === "Submitted"}
                                    value={c.score || ""}
                                    onChange={(e) => handleScoreChange("technical", c.id, e.target.value)}
                                    className="w-16 bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-center outline-none focus:border-[#953002] focus:bg-white disabled:opacity-60 text-gray-800"
                                  />
                                </td>
                                <td className="py-4 pr-3">
                                  <input
                                    type="text"
                                    disabled={activeBidder.status === "Submitted"}
                                    placeholder="Enter comment..."
                                    value={c.comment || ""}
                                    onChange={(e) => handleCommentChange("technical", c.id, e.target.value)}
                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#953002] py-1 px-1 outline-none text-gray-700 placeholder-gray-300 disabled:bg-transparent disabled:border-none"
                                  />
                                </td>
                                <td className="py-4 text-right font-extrabold text-gray-800">
                                  {weightedScore}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Subtotal */}
                          <tr className="bg-gray-50/50 font-bold">
                            <td colSpan={4} className="py-3.5 pl-3 font-bold text-gray-800">Technical Subtotal</td>
                            <td className="py-3.5 text-right font-black text-[#953002] pr-2 text-sm">
                              {techSubtotal} / 100
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Financial Evaluation Tab Content */}
                {activeTab === "financial" && (
                  <div className="relative min-h-[350px] animate-in fade-in duration-300">
                    
                    {/* Locked overlay cover - scoped to content only */}
                    {!isTechPassed && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-[1.5px] z-20 flex flex-col items-center justify-center p-8 text-center transition-all duration-300 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center shadow-md mb-4 text-[#953002] border border-[#FFF7ED]">
                          <Lock className="w-6 h-6 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">Financial Panel Locked</h4>
                        <p className="text-xs text-gray-400 max-w-sm mb-3">
                          This bidder failed to meet the required technical threshold of <strong>{data.threshold} / 100</strong>.
                        </p>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg">
                          Current Technical Score: {techSubtotal}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        {isTechPassed ? (
                          <span className="flex items-center gap-1 bg-[#E8F8F0] text-[#27AE60] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                            Unlocked — Technical threshold met
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-red-50 text-[#953002] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                            Locked — Technical threshold not met
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Max score: 100 pts
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Criterion</th>
                            <th className="pb-3 text-center font-semibold">Weight</th>
                            <th className="pb-3 text-center font-semibold w-24">Score (0-100)</th>
                            <th className="pb-3 font-semibold">Evaluator Comment</th>
                            <th className="pb-3 text-right font-semibold">Weighted Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                          {activeBidder.financialCriteria.map((c) => {
                            const weightedScore = Math.round(c.score * (c.weight / 100) * 100) / 100;
                            return (
                              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 pr-3 font-medium">
                                  <span className="block text-gray-800 font-bold">{c.name}</span>
                                  <span className="text-xs text-gray-400 font-normal">{c.description}</span>
                                </td>
                                <td className="py-4 text-center">
                                  <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                                    {c.weight}%
                                  </span>
                                </td>
                                <td className="py-4 text-center px-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={activeBidder.status === "Submitted"}
                                    value={c.score || ""}
                                    onChange={(e) => handleScoreChange("financial", c.id, e.target.value)}
                                    className="w-16 bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-center outline-none focus:border-[#953002] focus:bg-white disabled:opacity-60 text-gray-800"
                                  />
                                </td>
                                <td className="py-4 pr-3">
                                  <input
                                    type="text"
                                    disabled={activeBidder.status === "Submitted"}
                                    placeholder="Enter comment..."
                                    value={c.comment || ""}
                                    onChange={(e) => handleCommentChange("financial", c.id, e.target.value)}
                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#953002] py-1 px-1 outline-none text-gray-700 placeholder-gray-300 disabled:bg-transparent disabled:border-none"
                                  />
                                </td>
                                <td className="py-4 text-right font-extrabold text-gray-800">
                                  {weightedScore}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Subtotal */}
                          <tr className="bg-gray-50/50 font-bold">
                            <td colSpan={4} className="py-3.5 pl-3 font-bold text-gray-800">Financial Subtotal</td>
                            <td className="py-3.5 text-right font-black text-[#953002] pr-2 text-sm">
                              {finSubtotal} / 100
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SCORE SUMMARY SIDEBAR */}
          {activeBidder && (
            <div className="col-span-12 lg:col-span-3 xl:col-span-3 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-6 h-fit animate-in fade-in slide-in-from-right-3 duration-500">
              <div>
                <h3 className="text-md font-bold text-gray-800 mb-1.5">Score Summary</h3>

                {/* Gauge Chart (Semi-circle speedometer gauge) */}
                <div className="flex flex-col items-center justify-center p-3 border border-gray-50 rounded-2xl mb-4 bg-gray-50/30">
                  <div className="relative w-36 h-24 flex items-end justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 104 70">
                      {/* Background Track */}
                      <path
                        d="M 12 60 A 40 40 0 0 1 92 60"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Active Score Gauge */}
                      <path
                        d="M 12 60 A 40 40 0 0 1 92 60"
                        fill="none"
                        stroke="#953002"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="125.66"
                        strokeDashoffset={125.66 - (compositeScore / 100) * 125.66}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    
                    {/* Centered composite score */}
                    <div className="absolute text-center pb-1">
                      <span className="block text-2xl font-black text-gray-800 leading-none">
                        {compositeScore}
                      </span>
                      <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mt-1.5 block">
                        Composite
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score details */}
                <div className="space-y-3 text-xs">
                  <div className="border-b border-gray-50 pb-2">
                    <div className="flex justify-between text-gray-700 font-bold mb-1">
                      <span>Technical Score</span>
                      <span>{techSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>70% weight</span>
                      <span>→ Weighted (×0.70): {(techSubtotal * 0.7).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-50 pb-2">
                    <div className="flex justify-between text-gray-700 font-bold mb-1">
                      <span>Financial Score</span>
                      <span>{isTechPassed ? finSubtotal : "0.0"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>30% weight</span>
                      <span>→ Weighted (×0.30): {(isTechPassed ? finSubtotal * 0.3 : 0.0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-sm text-[#953002] pt-1">
                    <span>Final Composite Score</span>
                    <span>{compositeScore}</span>
                  </div>

                  <p className="text-xs text-gray-400 font-medium leading-relaxed bg-yellow-50/50 p-2.5 rounded-xl border border-yellow-100/50">
                    Formula: (Tech × 0.70) + (Fin × 0.30)<br/>
                    Scores update live as you enter values.
                  </p>
                </div>
              </div>

              {/* Evaluation Info */}
              <div className="border-t border-gray-50 pt-5 space-y-3.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Evaluation Info
                </h4>

                <div className="space-y-2.5 text-xs text-gray-700">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Evaluator</span>
                    <span className="font-extrabold">{activeBidder.evaluatorName}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Role</span>
                    <span className="font-extrabold">{activeBidder.evaluatorRole}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Bidder</span>
                    <span className="font-extrabold">{activeBidder.bidderName}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-black uppercase text-xs ${
                      activeBidder.status === "Submitted" ? "text-[#953002]" : "text-amber-600"
                    }`}>
                      {activeBidder.status}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Last Saved</span>
                    <span className="text-gray-500 font-bold">{activeBidder.lastSaved}</span>
                  </div>
                </div>

                {/* Overall Notes Button */}
                <button
                  onClick={() => {
                    setNotesText(activeBidder.evaluationNotes || "");
                    setActiveModal("notes");
                  }}
                  className="w-full text-center border border-gray-200 hover:border-[#953002] py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-[#953002] transition-colors"
                >
                  {activeBidder.evaluationNotes ? "Edit Evaluation Notes" : "Add Evaluation Notes"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-50 !mt-2.5 pt-2.5 space-y-2">
                {activeBidder.status !== "Submitted" ? (
                  <>
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="w-full flex items-center justify-center border border-[#953002]/20 hover:border-[#953002] bg-white hover:bg-[#FFF7ED] py-3 rounded-2xl text-xs font-bold text-[#953002] transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Draft"}
                    </button>
                    
                    <button
                      onClick={() => setActiveModal("submit")}
                      disabled={saving}
                      className="w-full flex items-center justify-center bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white shadow-md shadow-[#953002]/15 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {saving ? "Submitting..." : "Submit Evaluation"}
                    </button>
                  </>
                ) : (
                  <div className="bg-[#E8F8F0] border border-green-200 text-[#27AE60] p-3 rounded-2xl text-xs font-semibold text-center">
                    Evaluation Submitted & Locked
                  </div>
                )}

                <button
                  onClick={() => setActiveModal("download")}
                  className="w-full flex items-center justify-center border border-gray-200 hover:border-gray-300 bg-[#FAF9F6] py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Download Score Sheet
                </button>

                <p className="text-xs text-gray-400 font-semibold leading-relaxed text-center">
                  Once submitted, inputs become read-only until unlocked by the committee chair.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- MODALS LAYOUT --- */}

        {/* 1. DOWNLOAD SCORE SHEET MODAL */}
        {activeModal === "download" && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Close */}
              <button 
                onClick={() => { setActiveModal(null); setDownloadFormat(null); }}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Title Block */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-md font-extrabold text-gray-800">Download Score Sheet</h3>
              </div>

              {/* Body */}
              <p className="text-xs font-semibold text-gray-600 mb-4">
                Select your preferred format for the score sheet:
              </p>

              {/* Format grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                {/* PDF */}
                <button
                  onClick={() => setDownloadFormat("pdf")}
                  className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${
                    downloadFormat === "pdf"
                      ? "bg-[#FFF7ED] border-[#953002] text-[#953002] shadow-sm"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <FileText className="w-10 h-10 mb-3 opacity-80 text-[#953002]" />
                  <span className="text-xs font-bold text-gray-800 mb-0.5">PDF Format</span>
                  <span className="text-xs text-gray-400 font-semibold">Best for printing</span>
                </button>

                {/* Excel */}
                <button
                  onClick={() => setDownloadFormat("excel")}
                  className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${
                    downloadFormat === "excel"
                      ? "bg-[#FFF7ED] border-[#953002] text-[#953002] shadow-sm"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <FileSpreadsheet className="w-10 h-10 mb-3 opacity-80 text-green-600" />
                  <span className="text-xs font-bold text-gray-800 mb-0.5">Excel Format</span>
                  <span className="text-xs text-gray-400 font-semibold">Best for analysis</span>
                </button>
              </div>

              {/* Action */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadScoreSheet}
                  disabled={!downloadFormat}
                  className="w-full bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white disabled:opacity-50 transition-all shadow-md shadow-[#953002]/15"
                >
                  Download
                </button>
                <button
                  onClick={() => { setActiveModal(null); setDownloadFormat(null); }}
                  className="w-full border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SAVE DRAFT MODAL */}
        {activeModal === "draft" && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-md font-extrabold text-gray-800">Save Draft</h3>
              </div>

              <p className="text-xs font-semibold text-gray-600 mb-5 leading-relaxed">
                Your evaluation progress will be saved as a draft. You can continue editing later.
              </p>

              <div className="bg-[#FFF7ED] border border-[#FFF7ED]/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#953002] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#953002]/85 leading-relaxed">
                  Drafts are automatically saved every 5 minutes
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex-1 bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SUBMIT EVALUATION MODAL */}
        {activeModal === "submit" && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-md font-extrabold text-gray-800">Submit Evaluation</h3>
              </div>

              <p className="text-xs font-bold text-gray-700 mb-3">
                Are you sure you want to submit this evaluation? This action will:
              </p>

              <ul className="list-disc list-inside text-xs font-semibold text-gray-500 space-y-2 mb-5 pl-1">
                <li>Lock all scores and prevent further edits</li>
                <li>Submit to the committee chair for review</li>
                <li>Generate an official evaluation record</li>
              </ul>

              <div className="bg-[#FFF7ED] border border-[#FFF7ED]/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-4.5 h-4.5 text-[#953002] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#953002]/85 leading-relaxed">
                  Once submitted, changes require chairperson approval.
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  disabled={saving}
                  className="flex-1 bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. EVALUATION NOTES MODAL */}
        {activeModal === "notes" && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-md font-extrabold text-gray-800">Evaluation Notes</h3>
              </div>

              <div className="bg-[#FFF7ED] border border-[#FFF7ED]/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <HelpCircle className="w-4.5 h-4.5 text-[#953002] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#953002]/85 leading-relaxed">
                  Add overall evaluation comments and justification. These notes will be included in the official evaluation record.
                </span>
              </div>

              {/* Textarea */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-gray-700">Overall Evaluation Notes</label>
                <textarea
                  placeholder="Enter your overall evaluation notes, recommendations, and any additional comments..."
                  value={notesText}
                  maxLength={1000}
                  onChange={(e) => setNotesText(e.target.value)}
                  disabled={activeBidder?.status === "Submitted"}
                  rows={6}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#953002] text-gray-800 placeholder-gray-300 resize-none disabled:opacity-70"
                />
                <div className="flex justify-between text-xs text-gray-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Unlock size={11} />
                    These notes are visible to all committee members
                  </span>
                  <span>{notesText.length} / 1000 characters</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={activeBidder?.status === "Submitted"}
                  className="flex-1 bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TenderLayout>
  );
}
