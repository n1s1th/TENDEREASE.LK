"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Search, Lock, Unlock, FileText, CheckCircle2, AlertTriangle,
  X, Download, Save, FileSpreadsheet, ChevronRight, ChevronDown, HelpCircle, ArrowLeft, Loader2, Ban, Eye, EyeOff, ShieldCheck, Check
} from "lucide-react";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { getTenderById, updateTenderStatus, addTimelineEvent } from "@/services/tender.service";
import { getBidsByTender } from "@/services/bid.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOfficerByEmail } from "@/lib/api/officerApi";
import * as XLSX from "xlsx";

// Interface definitions mirroring backend
const SecureIframe = ({ src, className, style }: { src: string, className?: string, style?: React.CSSProperties }) => {
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [showFallback, setShowFallback] = useState<boolean>(false);

  useEffect(() => {
    if (!src) return;
    let isMounted = true;
    let objectUrl = "";
    
    // Fallback timer: if document takes longer than 8 seconds, show the fallback button
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setShowFallback(true);
    }, 8000);

    const fetchBlob = async () => {
      try {
        setLoading(true);
        setError(false);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s hard timeout
        
        const res = await fetch(src, { signal: controller.signal }).catch(e => {
          throw new Error("Network error or CORS blocked");
        });
        
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const blob = await res.blob();
        if (blob.size === 0) throw new Error("Empty file received");

        // Force MIME type so browser uses inline PDF viewer instead of downloading
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdfBlob);
        
        if (isMounted) {
          setBlobUrl(objectUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error("SecureIframe fetch error:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    
    if (src.startsWith('blob:') || src.startsWith('data:')) {
       setBlobUrl(src);
       setLoading(false);
       clearTimeout(fallbackTimer);
    } else {
       fetchBlob();
    }

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const FallbackAction = () => (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-[10px] text-gray-400 font-medium">Taking too long or viewer blocked?</p>
      <a href={src} target="_blank" rel="noopener noreferrer" className="bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span>Open Document Directly</span>
      </a>
    </div>
  );

  if (loading) return (
    <div className={`flex flex-col items-center justify-center bg-gray-50 ${className}`} style={style}>
      <Loader2 className="w-8 h-8 animate-spin text-[#953002] mb-3" />
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Document...</span>
      {showFallback && <FallbackAction />}
    </div>
  );
  
  if (error) return (
    <div className={`flex flex-col items-center justify-center bg-red-50 text-red-500 ${className}`} style={style}>
      <Ban className="w-8 h-8 mb-3" />
      <span className="text-xs font-bold uppercase tracking-widest">Failed to load inline viewer</span>
      <FallbackAction />
    </div>
  );
  
  return <iframe src={blobUrl} className={className} style={style} />;
};

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
  documents: any[];
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
  threshold: 75,
  bidders: [
    {
      bidderId: "BID-001",
      bidderName: "Apex Build Ltd.",
      status: "Not Started",
      complianceStatus: "PENDING",
      documents: [],
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
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bidIdParam = searchParams ? searchParams.get("bidId") : null;
  const tenderNo = (params?.id as string) || "TND-0041";

  // State initialized with offline fallback dataset so it renders immediately
  const [data, setData] = useState<TenderData>(INITIAL_MOCK_DATA);
  const [selectedBidderId, setSelectedBidderId] = useState<string>("BID-001");
  const [loading, setLoading] = useState<boolean>(true);

  const formatBidderId = (id: string) => {
    return id.length > 10 ? id.substring(0, 8).toUpperCase() : id;
  };
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [tenderDocs, setTenderDocs] = useState<Array<{ name: string; url: string; size?: string }>>([
    { name: "RFP Specification.pdf", url: "", size: "2.4 MB" },
    { name: "Terms of Reference (TOR).pdf", url: "", size: "1.8 MB" },
    { name: "BOQ Schedule.pdf", url: "", size: "950 KB" },
    { name: "Bidding Instructions.pdf", url: "", size: "1.1 MB" },
  ]);
  const [activeModal, setActiveModal] = useState<null | "download" | "draft" | "submit" | "notes" | "documents" | "tenderDocuments" | "unlock">(null);
  const [downloadFormat, setDownloadFormat] = useState<null | "pdf" | "excel">(null);
  const [notesText, setNotesText] = useState<string>("");
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [unlocking, setUnlocking] = useState<boolean>(false);
  const [unlockPin, setUnlockPin] = useState<string>( "");
  const [showUnlockPin, setShowUnlockPin] = useState<boolean>(false);
  const [unlockPinError, setUnlockPinError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"technical" | "financial">("technical");
  const [previewBidDoc, setPreviewBidDoc] = useState<{ name: string; url: string } | null>(null);
  const [previewTenderDoc, setPreviewTenderDoc] = useState<{ name: string; url: string } | null>(null);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }[]>([]);

  const [mounted, setMounted] = useState<boolean>(false);
  const [downloadingDocs, setDownloadingDocs] = useState<string[]>([]);
  const [downloadedDocs, setDownloadedDocs] = useState<string[]>([]);
  const ignorePollUntilRef = React.useRef<number>(0);
  const [tenderUuid, setTenderUuid] = useState<string>("");
  const [dbOfficerRole, setDbOfficerRole] = useState<string>("Procurement Officer");

  useEffect(() => {
    if (user?.email) {
      getOfficerByEmail(user.email)
        .then(res => {
          if (res && res.liaisonOfficer && res.liaisonOfficer.designation) {
            setDbOfficerRole(res.liaisonOfficer.designation);
          }
        })
        .catch(err => {
          console.warn("Failed to fetch officer designation from database:", err);
        });
    }
  }, [user]);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        const msg = "You have unsaved changes. Please save your draft before leaving.";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // BASE URL for evaluation service API
  const RAW_BASE = process.env.NEXT_PUBLIC_EVALUATION_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
  const BASE_URL = RAW_BASE.includes("/api/v1") ? RAW_BASE.replace("/api/v1", "") : RAW_BASE;

  // Fetch initial evaluation data from backend
  const fetchData = async (silent = false) => {
    if (isDirty || unlocking) return;
    if (!silent) setLoading(true);
    let baseData = { ...INITIAL_MOCK_DATA };
    try {
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/data?t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) {
        baseData = json.data;
      }
    } catch (err) {
      console.log("Offline or backend unreachable - using rich local mock state.");
    }

    let tenderDetails: any = null;
    // Now, fetch the real tender details from database (tender-service) and overlay them
    try {
      tenderDetails = await getTenderById(tenderNo);
      if (tenderDetails) {
        baseData.tenderTitle = tenderDetails.title || baseData.tenderTitle;
        baseData.tenderNo = tenderDetails.tenderNumber || baseData.tenderNo;
        baseData.department = tenderDetails.departmentName || baseData.department || "Procurement Department";
        setTenderUuid(tenderDetails.id);

        const rawDocs = tenderDetails.documents || tenderDetails.biddingDocuments || tenderDetails.dynamicData?.biddingDocuments;
        if (rawDocs && Array.isArray(rawDocs) && rawDocs.length > 0) {
          const parsed = rawDocs.map((d: any) => {
            const docName = typeof d === "string" ? d : (d.documentName || d.name || "Tender Specification.pdf");
            let docUrl = typeof d === "string" ? "" : (d.fileUrl || d.downloadUrl || d.url || "");
            const docSize = typeof d === "string" ? "1.5 MB" : (d.fileSize || d.size || "1.5 MB");

            // Rewrite localhost to production URL if needed
            if (docUrl && docUrl.includes("localhost:") && process.env.NEXT_PUBLIC_API_URL) {
              try {
                const urlObj = new URL(docUrl);
                const baseObj = new URL(process.env.NEXT_PUBLIC_API_URL);
                urlObj.protocol = baseObj.protocol;
                urlObj.hostname = baseObj.hostname;
                urlObj.port = baseObj.port;
                docUrl = urlObj.toString();
              } catch(e) {}
            }
            return { name: docName, url: docUrl, size: docSize };
          });
          setTenderDocs(parsed);
        }
      }
    } catch (tenderErr) {
      console.warn("Could not fetch real tender info from database:", tenderErr);
    }

    // Fetch the real bids from database (bid-service) and construct BidderState
    try {
      const resolvedTenderId = tenderDetails?.id || tenderNo;
      const bids = await getBidsByTender(resolvedTenderId);
      if (bids && bids.length > 0) {
        const dbBidders = bids.map((bid: any) => {
          // Parse documents from bidData
          const docs: any[] = [];
          const getFileUrl = (fileKey: string) => {
            if (!fileKey) return "";
            if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
              if (fileKey.includes("localhost:") && process.env.NEXT_PUBLIC_API_URL) {
                try {
                  const urlObj = new URL(fileKey);
                  const baseObj = new URL(process.env.NEXT_PUBLIC_API_URL);
                  urlObj.protocol = baseObj.protocol;
                  urlObj.hostname = baseObj.hostname;
                  urlObj.port = baseObj.port;
                  return urlObj.toString();
                } catch(e) {}
              }
              return fileKey;
            }
            const rawBidUrl = process.env.NEXT_PUBLIC_BID_SERVICE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/bids` : "http://localhost:8083/api/bids");
            const bidApiBase = rawBidUrl.endsWith("/api/bids") ? rawBidUrl : `${rawBidUrl.replace(/\/+$/, "")}/api/bids`;
            return `${bidApiBase}/files/${fileKey}`;
          };

          if (bid.bidData) {
            if (bid.bidData.cvsFile) docs.push({ name: "CV Document.pdf", url: getFileUrl(bid.bidData.cvsFile) });
            if (bid.bidData.pca3File) docs.push({ name: "PCA 3 Form.pdf", url: getFileUrl(bid.bidData.pca3File) });
            if (bid.bidData.ganttChartFile) docs.push({ name: "Gantt Chart.pdf", url: getFileUrl(bid.bidData.ganttChartFile) });
            if (bid.bidData.methodologyFile) docs.push({ name: "Methodology.pdf", url: getFileUrl(bid.bidData.methodologyFile) });
            if (bid.bidData.pastExperienceFile) docs.push({ name: "Past Experience.pdf", url: getFileUrl(bid.bidData.pastExperienceFile) });
            
            const bidSec = bid.bidData.bidSecurity;
            if (bidSec && (bidSec.fileUrl || bidSec.file)) {
              docs.push({ name: "Bid Security.pdf", url: getFileUrl(bidSec.fileUrl || bidSec.file) });
            }
          }
          if (docs.length === 0) {
            docs.push({ name: "Technical Proposal.pdf", url: "" });
            docs.push({ name: "Financial Proposal.pdf", url: "" });
          }


          // Find if we already have mock/saved evaluation state for this bidder
          // Match by exact bidderId OR by string-comparison of the UUID to handle
          // format differences between bid-service and mock state keys.
          const existingBidder = baseData.bidders?.find((b: any) =>
            b.bidderId === bid.id ||
            b.bidderId?.toLowerCase() === bid.id?.toLowerCase() ||
            b.bidderId === String(bid.id)
          );

          // Initial criteria
          const technicalCriteria = [
            { 
              id: "tech_1", 
              name: "Technical Approach", 
              description: "Methodology and solution alignment", 
              weight: 30, 
              score: existingBidder?.technicalCriteria?.[0]?.score ?? (bid.technicalScore ? Number(bid.technicalScore) : 0), 
              comment: existingBidder?.technicalCriteria?.[0]?.comment ?? "" 
            },
            { 
              id: "tech_2", 
              name: "Team Qualifications", 
              description: "CVs and relevant experience", 
              weight: 25, 
              score: existingBidder?.technicalCriteria?.[1]?.score ?? 0, 
              comment: existingBidder?.technicalCriteria?.[1]?.comment ?? "" 
            },
            { 
              id: "tech_3", 
              name: "Implementation Plan", 
              description: "Timeline, milestones, risk management", 
              weight: 25, 
              score: existingBidder?.technicalCriteria?.[2]?.score ?? 0, 
              comment: existingBidder?.technicalCriteria?.[2]?.comment ?? "" 
            },
            { 
              id: "tech_4", 
              name: "Past Performance", 
              description: "References and case studies", 
              weight: 20, 
              score: existingBidder?.technicalCriteria?.[3]?.score ?? 0, 
              comment: existingBidder?.technicalCriteria?.[3]?.comment ?? "" 
            }
          ];

          const financialCriteria = [
            { 
              id: "fin_1", 
              name: "Bid Price Competitiveness", 
              description: "Relative to lowest compliant bid", 
              weight: 50, 
              score: existingBidder?.financialCriteria?.[0]?.score ?? (bid.financialScore ? Number(bid.financialScore) : 0), 
              comment: existingBidder?.financialCriteria?.[0]?.comment ?? "" 
            },
            { 
              id: "fin_2", 
              name: "Payment Terms", 
              description: "Milestone structure and flexibility", 
              weight: 30, 
              score: existingBidder?.financialCriteria?.[1]?.score ?? 0, 
              comment: existingBidder?.financialCriteria?.[1]?.comment ?? "" 
            },
            { 
              id: "fin_3", 
              name: "Value-Added Services", 
              description: "Training, support, warranty", 
              weight: 20, 
              score: existingBidder?.financialCriteria?.[2]?.score ?? 0, 
              comment: existingBidder?.financialCriteria?.[2]?.comment ?? "" 
            }
          ];

          return {
            bidderId: bid.id,
            bidderName: bid.companyName || bid.bidderName || "Unknown Bidder",
            status: existingBidder?.status ?? (bid.status === "FLAGGED" ? "COMPLETED" : bid.status || "COMPLETED"),
            complianceStatus: existingBidder?.complianceStatus ?? (bid.status === "FLAGGED" ? "FAIL" : "PENDING"),
            documents: docs,
            technicalCriteria,
            financialCriteria,
            evaluationNotes: existingBidder?.evaluationNotes ?? (bid.notes || ""),
            evaluatorName: (existingBidder?.lastSaved && existingBidder.lastSaved !== "Never")
              ? existingBidder.evaluatorName
              : (user?.name || existingBidder?.evaluatorName || "Jane Doe"),
            evaluatorRole: (existingBidder?.lastSaved && existingBidder.lastSaved !== "Never")
              ? existingBidder.evaluatorRole
              : (dbOfficerRole || existingBidder?.evaluatorRole || "Procurement Officer"),
            lastSaved: existingBidder?.lastSaved ?? "Never"
          };
        });

        baseData.bidders = dbBidders;
      } else if (!baseData.bidders || baseData.bidders.length === 0) {
        baseData.bidders = [];
      }
    } catch (bidsErr) {
      if (!baseData.bidders || baseData.bidders.length === 0) {
        baseData.bidders = [];
      }
      console.warn("Could not fetch real bids from database:", bidsErr);
    }

    if (Date.now() < ignorePollUntilRef.current) {
      console.log("Ignoring background poll result during transition.");
      return;
    }
    setData(baseData);

    // Automatically select the correct bidder
    if (baseData.bidders && baseData.bidders.length > 0) {
      const savedBidderId = typeof window !== 'undefined' ? localStorage.getItem(`lastSelectedBidder_${tenderNo}`) : null;
      const matchedBidder = bidIdParam 
        ? baseData.bidders.find((b: BidderState) => b.bidderId === bidIdParam) 
        : (savedBidderId ? baseData.bidders.find((b: BidderState) => b.bidderId === savedBidderId) : null);
      if (matchedBidder) {
        setSelectedBidderId(matchedBidder.bidderId);
        setNotesText(matchedBidder.evaluationNotes || "");
        if (typeof window !== 'undefined') {
          localStorage.setItem(`lastSelectedBidder_${tenderNo}`, matchedBidder.bidderId);
        }
      } else {
        const firstBidder = baseData.bidders[0];
        setSelectedBidderId(firstBidder.bidderId);
        setNotesText(firstBidder.evaluationNotes || "");
        if (typeof window !== 'undefined') {
          localStorage.setItem(`lastSelectedBidder_${tenderNo}`, firstBidder.bidderId);
        }
      }
    }
    
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [tenderNo, bidIdParam, isDirty]);

  // Handle bidder selection
  const handleSelectBidder = (bidderId: string) => {
    if (isDirty) {
      showToast("You have unsaved changes. Please save your draft before switching bidders.", "warning");
      return;
    }
    setSelectedBidderId(bidderId);
    setIsDirty(false);
    setActiveTab("technical"); // always reset to technical tab when switching bidders
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lastSelectedBidder_${tenderNo}`, bidderId);
    }
    setIsSidebarOpen(false);
    if (data) {
      const bidder = data.bidders.find(b => b.bidderId === bidderId);
      if (bidder) {
        setNotesText(bidder.evaluationNotes || "");
      }
    }
  };

  // Toast Helper
  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
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
    setIsDirty(true);

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
    setIsDirty(true);

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
  const isTechPassed = techSubtotal >= (data?.threshold || 75);

  const finSubtotal = activeBidder ? calculateSubtotal(activeBidder.financialCriteria) : 0;
  const isFinPassed = finSubtotal >= (data?.threshold || 75);

  // Composite score: Tech * 0.7 + Fin * 0.3
  const compositeScore = Math.round((techSubtotal * 0.7 + (isTechPassed ? finSubtotal * 0.3 : 0.0)) * 100) / 100;

  // Confirm & Unlock action for submitted evaluations
  const handleConfirmUnlock = async () => {
    if (unlockPin === "ABC123") {
      if (!data || !activeBidder) return;
      try {
        ignorePollUntilRef.current = Date.now() + 6000;
        setUnlocking(true);
        const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bidderId: selectedBidderId,
            technicalCriteria: activeBidder.technicalCriteria,
            financialCriteria: activeBidder.financialCriteria,
            notes: activeBidder.evaluationNotes || notesText,
            status: "In Progress",
            evaluatorName: user?.name || activeBidder.evaluatorName || "Officer",
            evaluatorRole: dbOfficerRole || activeBidder.evaluatorRole || "Procurement Officer"
          })
        });

        if (res.ok) {
          const json = await res.json();
          const updatedBidders = data.bidders.map(b => {
            if (b.bidderId === selectedBidderId) {
              return {
                ...b,
                status: "In Progress",
                lastSaved: json.data?.lastSaved || b.lastSaved
              };
            }
            return b;
          });
          setData({ ...data, bidders: updatedBidders });
          setActiveModal(null);
          setUnlockPin("");
          setUnlockPinError(false);
          showToast(`Unlocked evaluation for ${activeBidder.bidderName}. You can now edit and resubmit.`, "success");
        } else {
          showToast("Failed to unlock evaluation on the server.", "error");
        }
      } catch (err) {
        console.error("Unlock error:", err);
        showToast("Error connecting to server to unlock evaluation.", "error");
      } finally {
        setUnlocking(false);
      }
    } else {
      setUnlockPinError(true);
    }
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!activeBidder) return;
    try {
      setSavingDraft(true);
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderId: selectedBidderId,
          technicalCriteria: activeBidder.technicalCriteria,
          financialCriteria: activeBidder.financialCriteria,
          notes: notesText,
          status: "In Progress",
          evaluatorName: user?.name || activeBidder.evaluatorName || "Officer",
          evaluatorRole: dbOfficerRole || activeBidder.evaluatorRole || "Procurement Officer"
        })
      });

      const json = await res.json();
      if (res.ok) {
        try {
          const targetId = tenderUuid || tenderNo;
          await updateTenderStatus(targetId, "EVALUATION");
          console.log(`Tender status set to EVALUATION for ${targetId}`);
        } catch (statusErr) {
          console.warn("Failed to set tender status to EVALUATION:", statusErr);
        }
        showToast(`Draft saved successfully for ${activeBidder.bidderName}!`, "success");
        setIsDirty(false);
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
      console.error("Failed to save draft:", err);
      showToast("Failed to save draft. Please check your connection and try again.", "error");
    } finally {
      setSavingDraft(false);
    }
  };

  // Submit Final Evaluation Action
  const handleSubmitEvaluation = async () => {
    if (!activeBidder) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/api/evaluations/mock/${tenderNo}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderId: selectedBidderId,
          technicalCriteria: activeBidder.technicalCriteria,
          financialCriteria: activeBidder.financialCriteria,
          notes: notesText,
          evaluatorName: user?.name || activeBidder.evaluatorName || "Officer",
          evaluatorRole: dbOfficerRole || activeBidder.evaluatorRole || "Procurement Officer"
        })
      });

      const json = await res.json();
      if (res.ok) {
        showToast(`Evaluation submitted and locked for ${activeBidder.bidderName}!`, "success");
        setIsDirty(false);
        const updatedBidders = data.bidders.map(b => {
          if (b.bidderId === selectedBidderId) {
            return {
              ...b,
              status: "COMPLETED",
              complianceStatus: techSubtotal >= (data?.threshold || 75) ? "PASS" : "FAIL",
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
      console.error("Failed to submit evaluation:", err);
      showToast("Failed to submit evaluation. Please check your connection and try again.", "error");
    } finally {
      setSubmitting(false);
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
    showToast("Notes updated! Remember to click 'Save Draft' to persist changes.", "warning");
    setActiveModal(null);
  };
  // Download file implementation (actual vs fallback simulation)
  const downloadDocument = async (docName: string, docUrl: string) => {
    if (!activeBidder) return;
    try {
      if (docUrl) {
        // Fetch the actual file from backend
        const response = await fetch(docUrl);
        if (!response.ok) throw new Error("File download failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = docName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to mock text blob
        const blob = new Blob([`Mock content of ${docName} for evaluation and review purposes.`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = docName.endsWith(".pdf") ? docName : `${docName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      showToast(`Downloaded ${docName} successfully!`, "success");
      const key = `${activeBidder.bidderId}::${docName}`;
      setDownloadedDocs(prev => [...prev, key]);
    } catch (e) {
      showToast(`Failed to download ${docName}`, "error");
    }
  };

  const handleDownloadDoc = (docName: string) => {
    if (!activeBidder) return;
    const doc = activeBidder.documents.find(d => (typeof d === "string" ? d : d.name) === docName);
    const docUrl = doc && typeof doc !== "string" ? doc.url : "";

    const key = `${activeBidder.bidderId}::${docName}`;
    setDownloadingDocs(prev => [...prev, key]);
    setTimeout(() => {
      downloadDocument(docName, docUrl);
      setDownloadingDocs(prev => prev.filter(d => d !== key));
    }, 850);
  };

  const downloadAllDocuments = () => {
    if (!activeBidder) return;
    activeBidder.documents.forEach((doc, idx) => {
      const docName = typeof doc === "string" ? doc : doc.name;
      const docUrl = typeof doc === "string" ? "" : doc.url;
      const key = `${activeBidder.bidderId}::${docName}`;
      setDownloadingDocs(prev => [...prev, key]);
      setTimeout(() => {
        downloadDocument(docName, docUrl);
        setDownloadingDocs(prev => prev.filter(d => d !== key));
      }, idx * 300 + 500);
    });
  };

  const handleDownloadTenderDoc = (docName: string, docUrl?: string) => {
    const key = `tender::${docName}`;
    setDownloadingDocs(prev => [...prev, key]);
    setTimeout(() => {
      downloadDocument(docName, docUrl || "");
      setDownloadingDocs(prev => prev.filter(d => d !== key));
      setDownloadedDocs(prev => [...prev, key]);
    }, 850);
  };

  const downloadAllTenderDocuments = () => {
    tenderDocs.forEach((doc, idx) => {
      const docName = doc.name;
      const docUrl = doc.url;
      const key = `tender::${docName}`;
      setDownloadingDocs(prev => [...prev, key]);
      setTimeout(() => {
        downloadDocument(docName, docUrl);
        setDownloadingDocs(prev => prev.filter(d => d !== key));
        setDownloadedDocs(prev => [...prev, key]);
      }, idx * 300 + 500);
    });
  };
  // PDF and Excel score sheet download
  const handleDownloadScoreSheet = () => {
    if (!activeBidder || !downloadFormat) return;

    // Log report generation event in timeline
    if (tenderUuid) {
      const formatLabel = downloadFormat === "pdf" ? "PDF" : "Excel";
      addTimelineEvent(
        tenderUuid,
        "REPORT_GENERATED",
        `Report Generated: Bid Evaluation Score Sheet for ${activeBidder.bidderName} downloaded as ${formatLabel}.`,
        user?.name || "Officer",
        dbOfficerRole || "Procurement Officer"
      ).catch(err => console.warn("Failed to log report generation:", err));
    }

    if (downloadFormat === "pdf") {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Watermark background
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(242, 238, 236); // Very light watermark
        const stepX = 75;
        const stepY = 50;
        for (let x = -20; x < pageWidth + 80; x += stepX) {
          for (let y = -20; y < pageHeight + 80; y += stepY) {
            doc.text("TENDEREASE.LK", x, y, {
              align: "center",
              angle: 30
            });
          }
        }

        // 2. Header Section
        // Logo branding (fallback to stylized text if not found)
        try {
          doc.addImage("/logo.png", "PNG", 14, 8, 41.2, 18);
        } catch (e) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(149, 48, 2); // #953002
          doc.text("TenderEase.lk", 14, 18);
          
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(120, 120, 120);
          doc.text("SRI LANKA GOVERNMENT TENDERING PLATFORM", 14, 23);
        }

        // Divider line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, 27, pageWidth - 14, 27);

        // Header Metadata details (top right)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(`Tender Ref: ${data.tenderNo || "-"}`, pageWidth - 14, 12, { align: "right" });
        doc.text(`Tender Title: ${data.tenderTitle || "-"}`, pageWidth - 14, 17, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.text(`Generated On: ${new Date().toLocaleString("en-GB").replace(", ", ", at ")}`, pageWidth - 14, 22, { align: "right" });

        // 3. Document Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text("TECHNICAL EVALUATION REPORT", pageWidth / 2, 38, { align: "center" });

        // 4. Metadata Box
        doc.setDrawColor(240, 235, 230);
        doc.setFillColor(253, 251, 247);
        doc.roundedRect(14, 44, pageWidth - 28, 28, 4, 4, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(149, 48, 2); // Brand color
        doc.text("EVALUATION & BIDDER DETAILS", 18, 50);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);

        // Helper to format compliance status properly
        const getComplianceDisplay = (status: string) => {
          if (!status) return "PENDING";
          const upper = status.toUpperCase().trim();
          if (upper === "PASS" || upper === "PASSED") return "PASSED";
          if (upper === "FAIL" || upper === "FAILED") return "FAILED";
          return upper;
        };

        const formattedCompliance = getComplianceDisplay(activeBidder.complianceStatus);

        // Columns in meta box
        doc.text(`Bidder Name: ${activeBidder.bidderName}`, 18, 56);
        doc.text(`Bidder ID: ${activeBidder.bidderId}`, 18, 61);
        doc.text(`Compliance: ${formattedCompliance}`, 18, 66);

        const evaluatorName = user?.name || activeBidder.evaluatorName || "Jane Doe";
        const evaluatorRole = activeBidder.evaluatorRole || dbOfficerRole || "Senior Evaluator";
        doc.text(`Evaluator: ${evaluatorName}`, pageWidth / 2 + 10, 56);
        doc.text(`Evaluator Role: ${evaluatorRole}`, pageWidth / 2 + 10, 61);
        doc.text(`Evaluation Status: ${activeBidder.status}`, pageWidth / 2 + 10, 66);

        let currentY = 78;

        // 5. Technical Criteria Table
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Technical Criteria Evaluation Summary", 14, currentY);
        currentY += 4;

        const techRows = activeBidder.technicalCriteria.map(c => [
          c.name,
          `${c.weight}%`,
          c.score.toFixed(1),
          `${(c.score * (c.weight / 100)).toFixed(2)}`,
          c.comment || "No comment provided"
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Criterion Name", "Weight", "Score (0-100)", "Weighted Score", "Evaluator Comments"]],
          body: techRows,
          foot: [["Total Technical Score", "", "", `${techSubtotal.toFixed(2)} / 100`, ""]],
          theme: "striped",
          headStyles: { fillColor: [149, 48, 2], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
          footStyles: { fillColor: [253, 245, 235], textColor: [149, 48, 2], fontStyle: "bold", fontSize: 8.5 },
          bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = data.cursor.y;
          }
        });

        currentY += 10;

        // Check page overflow
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 20;
        }

        // 6. Financial Criteria Table
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Financial Criteria Evaluation Summary", 14, currentY);
        currentY += 4;

        const finRows = activeBidder.financialCriteria.map(c => [
          c.name,
          `${c.weight}%`,
          c.score.toFixed(1),
          `${(c.score * (c.weight / 100)).toFixed(2)}`,
          c.comment || "No comment provided"
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Criterion Name", "Weight", "Score (0-100)", "Weighted Score", "Evaluator Comments"]],
          body: finRows,
          foot: [["Total Financial Score", "", "", `${finSubtotal.toFixed(2)} / 100`, ""]],
          theme: "striped",
          headStyles: { fillColor: [149, 48, 2], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
          footStyles: { fillColor: [253, 245, 235], textColor: [149, 48, 2], fontStyle: "bold", fontSize: 8.5 },
          bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = data.cursor.y;
          }
        });

        currentY += 10;

        // Check page overflow
        if (currentY > pageHeight - 70) {
          doc.addPage();
          currentY = 20;
        }

        // 7. Composite Scores Summary
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Composite Score Summary & Compliance Status", 14, currentY);
        currentY += 4;

        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(14, currentY, pageWidth - 28, 22, 3, 3, "FD");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(`Weighted Technical Score (70%): ${(techSubtotal * 0.7).toFixed(2)}`, 18, currentY + 6);
        doc.text(`Weighted Financial Score (30%): ${(isTechPassed ? finSubtotal * 0.3 : 0.0).toFixed(2)}`, 18, currentY + 12);
        doc.text(`Compliance Result: ${formattedCompliance}`, 18, currentY + 18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(149, 48, 2);
        doc.text(`COMPOSITE SCORE: ${compositeScore.toFixed(2)} / 100`, pageWidth - 85, currentY + 12);

        currentY += 30;

        // Check page overflow
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = 20;
        }

        // 8. Evaluation Notes
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Evaluation Notes / Comments", 14, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const notes = activeBidder.evaluationNotes || notesText || "No evaluation notes provided.";
        const splitNotes = doc.splitTextToSize(notes, pageWidth - 28);
        doc.text(splitNotes, 14, currentY);

        currentY += (splitNotes.length * 4) + 15;

        // Check page overflow for signatures
        if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = 25;
        }

        // 9. Signatures Block
        doc.setDrawColor(200, 200, 200);
        doc.line(14, currentY, 70, currentY);
        doc.line(pageWidth - 70, currentY, pageWidth - 14, currentY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Evaluator Signature", 14, currentY + 5);
        doc.text("Authorized Verification", pageWidth - 70, currentY + 5);

        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 14, currentY + 10);
        doc.text("TenderEase Security Seal Verified", pageWidth - 70, currentY + 10);
        // Page Footer (Page Numbers)
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${i} of ${pageCount}  •  Confidential Procurement System Tenderease.lk © 2026. All Rights reserved.`,
            pageWidth / 2,
            pageHeight - 8,
            { align: "center" }
          );
        }

        // Save PDF file
        const fileName = `Technical_Evaluation_Report_${activeBidder.bidderName.replace(/\s+/g, "_")}_${data.tenderNo}.pdf`;
        doc.save(fileName);
        showToast("Score sheet PDF report downloaded successfully!", "success");
      } catch (pdfErr) {
        console.error("PDF generation error:", pdfErr);
        showToast("Failed to generate PDF. Please try again.", "error");
      }
    } else if (downloadFormat === "excel") {
      try {
        showToast("Downloading score sheet in Excel format...", "success");

        const getComplianceDisplay = (status: string) => {
          if (!status) return "PENDING";
          const upper = status.toUpperCase().trim();
          if (upper === "PASS" || upper === "PASSED") return "PASSED";
          if (upper === "FAIL" || upper === "FAILED") return "FAILED";
          return upper;
        };

        const formattedCompliance = getComplianceDisplay(activeBidder.complianceStatus);
        const evaluatorName = user?.name || activeBidder.evaluatorName || "Jane Doe";
        const evaluatorRole = activeBidder.evaluatorRole || dbOfficerRole || "Senior Evaluator";

        // Headers & metadata
        const wsData: any[][] = [
          ["TENDEREASE.LK - Sri Lanka Public Procurement Platform"],
          ["TECHNICAL EVALUATION REPORT"],
          [`Tender Ref: ${data.tenderNo || "-"}`, `Tender Title: ${data.tenderTitle || "-"}`, `Generated On: ${new Date().toLocaleString("en-GB").replace(", ", ", at ")}`],
          [],
          ["EVALUATION & BIDDER DETAILS"],
          ["Bidder Name", activeBidder.bidderName, "Evaluator Name", evaluatorName],
          ["Bidder ID", activeBidder.bidderId, "Evaluator Role", evaluatorRole],
          ["Compliance Status", formattedCompliance, "Evaluation Status", activeBidder.status],
          [],
          ["TECHNICAL CRITERIA EVALUATION"],
          ["Criterion Name", "Weight", "Score (0-100)", "Weighted Score", "Evaluator Comments"]
        ];

        // Add tech rows
        activeBidder.technicalCriteria.forEach(c => {
          wsData.push([
            c.name,
            `${c.weight}%`,
            c.score,
            (c.score * (c.weight / 100)).toFixed(2),
            c.comment || ""
          ]);
        });
        wsData.push(["Total Technical Score", "", "", techSubtotal.toFixed(2), ""]);
        
        wsData.push([]);
        wsData.push(["FINANCIAL CRITERIA EVALUATION"]);
        wsData.push(["Criterion Name", "Weight", "Score (0-100)", "Weighted Score", "Evaluator Comments"]);

        // Add fin rows
        activeBidder.financialCriteria.forEach(c => {
          wsData.push([
            c.name,
            `${c.weight}%`,
            c.score,
            (c.score * (c.weight / 100)).toFixed(2),
            c.comment || ""
          ]);
        });
        wsData.push(["Total Financial Score", "", "", finSubtotal.toFixed(2), ""]);

        wsData.push([]);
        wsData.push(["COMPOSITE SCORE SUMMARY"]);
        wsData.push(["Weighted Technical Score (70%)", (techSubtotal * 0.7).toFixed(2)]);
        wsData.push(["Weighted Financial Score (30%)", (isTechPassed ? finSubtotal * 0.3 : 0.0).toFixed(2)]);
        wsData.push(["Compliance Result", formattedCompliance]);
        wsData.push(["Composite Score", compositeScore.toFixed(2)]);

        wsData.push([]);
        wsData.push(["EVALUATION NOTES / COMMENTS"]);
        wsData.push([activeBidder.evaluationNotes || notesText || "No notes provided."]);
        wsData.push([]);
        wsData.push(["Confidential Procurement System Tenderease.lk © 2026. All Rights reserved."]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!cols"] = [
          { wch: 30 },
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 40 }
        ];

        // Merge headers
        ws["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Evaluation Report");

        const fileName = `Technical_Evaluation_Report_${activeBidder.bidderName.replace(/\s+/g, "_")}_${data.tenderNo}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showToast("Score sheet Excel report downloaded successfully!", "success");
      } catch (xlErr) {
        console.error("Excel generation error:", xlErr);
        showToast("Failed to generate Excel report. Please try again.", "error");
      }
    }

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

  if (loading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Bid Evaluation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-inter flex flex-col">
      {/* --- Breadcrumbs / Sub-Navigation --- */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500 whitespace-nowrap">
          <button
            onClick={() => {
              if (isDirty) {
                showToast("You have unsaved changes. Please save your draft before leaving.", "warning");
              } else {
                router.push(`/tenders/${params?.id}/bid-opening`);
              }
            }}
            className="flex items-center gap-2 hover:text-[#953002] transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Bid Opening & Attendance Screen
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      {/* --- Main Content Section --- */}
      <main className="relative flex-grow w-full max-w-[1200px] mx-auto px-6 py-10">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">

          {/* --- HEADER --- */}
          <div className="mb-8">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              <button 
                onClick={() => {
                  if (isDirty) {
                    showToast("You have unsaved changes. Please save your draft before leaving.", "warning");
                  } else {
                    window.location.href = "https://www.tenderease.me/officer-dashboard";
                  }
                }} 
                className="hover:text-[#953002] transition-colors flex items-center gap-1"
              >
                OFFICER DASHBOARD
              </button>
              <ChevronRight className="w-3 h-3" />
              <span>{data?.tenderNo ? `${data.tenderTitle} (${data.tenderNo})` : tenderNo}</span>
              <ChevronRight className="w-3 h-3 text-[#953002]" />
              <span className="text-[#953002]">BID EVALUATION</span>
            </div>

            {/* Title row: uses same 12-col grid as main content so cards align with Score Summary */}
            <div className="grid grid-cols-12 gap-8 items-start">

              {/* Left col-span-8: Brown bar + title block */}
              <div className="col-span-12 lg:col-span-8 flex items-start gap-3 min-w-0">
                <div style={{ width: 4, height: 60, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }} className="shrink-0"></div>
                <div className="min-w-0">
                  <h1 style={{
                    fontSize: "1.85rem",
                    fontWeight: 800,
                    color: "#1e293b",
                    letterSpacing: "0.01em",
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    Unified Bid Evaluation
                  </h1>
                  <p className="text-sm text-gray-500 font-medium flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                    <span>Tender: <strong className="text-gray-700">{data?.tenderTitle || tenderNo}</strong></span>
                    {data?.tenderNo && (
                      <>
                        <span>•</span>
                        <span>Ref No: <strong className="text-gray-700">{data.tenderNo}</strong></span>
                      </>
                    )}
                    {activeBidder && (
                      <>
                        <span>•</span>
                        <span>Bid Ref No: <strong className="text-gray-700">{formatBidderId(activeBidder.bidderId)}</strong></span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right col-span-4: Select Bidder Button aligned with score summary box, pushed lower */}
              {/* Right col-span-4: Select Bidder Button aligned with score summary box, pushed lower */}
              <div className="col-span-12 lg:col-span-4 flex flex-col items-end justify-start lg:pt-8 relative">

                <button
                  onClick={() => setIsSidebarOpen(true)}
                  disabled={!data?.bidders || data.bidders.length === 0}
                  className="flex items-center gap-1.5 bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search size={13} />
                  Select Bidder
                </button>
              </div>

            </div>

          </div>

          {/* Unsaved Changes Banner */}
          {isDirty && (
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-orange-200 bg-[#FFF7ED] text-[#953002] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#953002]" />
                <span className="text-[13px] font-bold tracking-tight">You have unsaved changes in this evaluation. Please save draft before leaving or refreshing.</span>
              </div>
              <button
                onClick={handleSaveDraft}
                className="bg-[#953002] hover:bg-[#7a2702] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Save size={13} />
                <span>Save Draft Now</span>
              </button>
            </div>
          )}

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-12 gap-8 items-start">

            {(!data?.bidders || data.bidders.length === 0) && (
              <div className="col-span-12 bg-white border border-gray-100 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#953002] mb-2">
                  <Ban size={30} />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">No Bids to Evaluate</h3>
                <p className="text-xs font-bold text-gray-400 max-w-md uppercase tracking-wider leading-relaxed">
                  There are no bids to evaluate for the tender.
                </p>
              </div>
            )}

            {/* 1. MIDDLE CONTENT SECTION */}
            {activeBidder && (
              <div key={selectedBidderId} className="col-span-12 lg:col-span-8 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

                {/* --- DOCUMENTS SECTION: BID DOCUMENTS & TENDER DOCUMENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BID DOCUMENTS */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 uppercase tracking-widest">
                        <span>Bid Documents</span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 mt-1">
                        {activeBidder.documents.length} Submitted File{activeBidder.documents.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal("documents")}
                      className="bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 shrink-0"
                    >
                      <span>Bid Documents</span>
                    </button>
                  </div>

                  {/* TENDER DOCUMENTS */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 uppercase tracking-widest">
                        <span>Tender Documents</span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 mt-1">
                        {tenderDocs.length} Specification File{tenderDocs.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal("tenderDocuments")}
                      className="bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 shrink-0"
                    >
                      <span>Tender Documents</span>
                    </button>
                  </div>
                </div>

                {/* --- EVALUATION WORKSPACE (TECHNICAL / FINANCIAL TABS) --- */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">

                  {/* Tabs Header */}
                  <div className="grid grid-cols-2 border-b border-gray-100 -mx-6 -mt-6 mb-6">
                    <button
                      onClick={() => setActiveTab("technical")}
                      className={`py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all relative cursor-pointer ${activeTab === "technical"
                        ? "border-[#953002] text-[#953002] bg-gray-50"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${activeTab === "technical" ? "bg-white text-[#953002]" : "bg-gray-100 text-gray-500"
                        }`}>1</span>
                      <span>Technical Evaluation</span>
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border transition-all ${
                        activeTab === "technical"
                          ? "bg-orange-50 text-[#953002] border-[#953002]/15"
                          : "bg-gray-50 text-gray-400 border-transparent"
                      }`}>
                        70%
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("financial")}
                      className={`py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all relative cursor-pointer ${activeTab === "financial"
                        ? "border-[#953002] text-[#953002] bg-gray-50"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${activeTab === "financial" ? "bg-white text-[#953002]" : "bg-gray-100 text-gray-500"
                        }`}>2</span>
                      <span>Financial Evaluation</span>
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border transition-all ${
                        activeTab === "financial"
                          ? "bg-orange-50 text-[#953002] border-[#953002]/15"
                          : "bg-gray-50 text-gray-400 border-transparent"
                      }`}>
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
                      {/* Technical Score Progress Bar / PASS Badge */}
                      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-2/3">
                          <div className="flex justify-between text-[13px] font-bold text-gray-500 mb-2">
                            <span>Technical Score</span>
                            <span>{techSubtotal} / 100</span>
                          </div>
                          {/* Progress Track */}
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                            {/* Threshold Tick */}
                            <div className="absolute top-0 w-[2px] h-full bg-black z-10" style={{ left: `${data?.threshold || 75}%` }} title={`Threshold: ${data?.threshold || 75}`}></div>
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-[#953002]"
                              style={{ width: `${techSubtotal}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] text-[#953002] border border-[#953002]/20`}>
                            {isTechPassed ? "PASS" : "FAIL"}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Threshold: {data?.threshold || 75}
                          </span>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <colgroup>
                            <col style={{ width: "33%" }} />
                            <col style={{ width: "9%" }} />
                            <col style={{ width: "13%" }} />
                            <col style={{ width: "34%" }} />
                            <col style={{ width: "11%" }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase tracking-wider">
                              <th className="pb-3 font-semibold">Criterion</th>
                              <th className="pb-3 text-left font-semibold">Weight</th>
                              <th className="pb-3 text-center font-semibold whitespace-nowrap">Score (0-100)</th>
                              <th className="pb-3 pl-8 font-semibold">Evaluator Comment</th>
                              <th className="pb-3 text-right font-semibold">Score</th>
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
                                  <td className="py-4 text-left">
                                    <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                                      {c.weight}%
                                    </span>
                                  </td>
                                  <td className="py-4 text-center px-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={c.score || ""}
                                      onChange={(e) => handleScoreChange("technical", c.id, e.target.value)}
                                      disabled={activeBidder.status === "COMPLETED"}
                                      className="w-16 bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-center outline-none focus:border-[#953002] focus:bg-white text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                  </td>
                                  <td className="py-4 pl-8 pr-3">
                                    <input
                                      type="text"
                                      placeholder="Enter comment..."
                                      value={c.comment || ""}
                                      onChange={(e) => handleCommentChange("technical", c.id, e.target.value)}
                                      disabled={activeBidder.status === "COMPLETED"}
                                      className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#953002] py-1 px-1 outline-none text-gray-700 placeholder-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
                              <td colSpan={4} className="py-3.5 pl-3 font-bold text-gray-800 text-sm">Technical Subtotal</td>
                              <td className="py-3.5 text-right font-black text-[#953002] pr-2 text-sm whitespace-nowrap">
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
                          <p className="text-xs text-gray-400 max-w-md mb-3">
                            This bidder failed to meet the required technical threshold of <strong>{data.threshold} / 100</strong>.
                          </p>
                          <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg">
                            Current Technical Score: {techSubtotal}
                          </span>
                        </div>
                      )}

                      {/* Financial Score Progress Bar */}
                      <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-2/3">
                          <div className="flex justify-between text-[13px] font-bold text-gray-500 mb-2">
                            <span>Financial Score</span>
                            <span>{finSubtotal} / 100</span>
                          </div>
                          {/* Progress Track */}
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                            {/* Threshold Tick */}
                            <div className="absolute top-0 w-[2px] h-full bg-black z-10" style={{ left: `${data?.threshold || 75}%` }} title={`Threshold: ${data?.threshold || 75}`}></div>
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-[#953002]"
                              style={{ width: `${finSubtotal}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] text-[#953002] border border-[#953002]/20`}>
                            {isFinPassed ? "PASS" : "FAIL"}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Threshold: {data?.threshold || 75}
                          </span>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <colgroup>
                            <col style={{ width: "33%" }} />
                            <col style={{ width: "9%" }} />
                            <col style={{ width: "13%" }} />
                            <col style={{ width: "34%" }} />
                            <col style={{ width: "11%" }} />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase tracking-wider">
                              <th className="pb-3 font-semibold">Criterion</th>
                              <th className="pb-3 text-left font-semibold">Weight</th>
                              <th className="pb-3 text-center font-semibold whitespace-nowrap">Score (0-100)</th>
                              <th className="pb-3 pl-8 font-semibold">Evaluator Comment</th>
                              <th className="pb-3 text-right font-semibold">Score</th>
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
                                  <td className="py-4 text-left">
                                    <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                                      {c.weight}%
                                    </span>
                                  </td>
                                  <td className="py-4 text-center px-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={c.score || ""}
                                      onChange={(e) => handleScoreChange("financial", c.id, e.target.value)}
                                      disabled={activeBidder.status === "COMPLETED"}
                                      className="w-16 bg-[#F8FAFC] border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-center outline-none focus:border-[#953002] focus:bg-white text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                  </td>
                                  <td className="py-4 pl-8 pr-3">
                                    <input
                                      type="text"
                                      placeholder="Enter comment..."
                                      value={c.comment || ""}
                                      onChange={(e) => handleCommentChange("financial", c.id, e.target.value)}
                                      disabled={activeBidder.status === "COMPLETED"}
                                      className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#953002] py-1 px-1 outline-none text-gray-700 placeholder-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
                              <td colSpan={4} className="py-3.5 pl-3 font-bold text-gray-800 text-sm">Financial Subtotal</td>
                              <td className="py-3.5 text-right font-black text-[#953002] pr-2 text-sm whitespace-nowrap">
                                {finSubtotal} / 100
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setNotesText(activeBidder.evaluationNotes || "");
                      setActiveModal("notes");
                    }}
                    disabled={activeBidder.status === "COMPLETED"}
                    className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-[#953002] bg-white px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:text-[#953002] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FileText size={13} />
                    <span>{activeBidder.evaluationNotes ? "Edit Evaluation Notes" : "Add Evaluation Notes"}</span>
                  </button>
                </div>
              </div>
            </div>
            )}


            {/* 2. SCORE SUMMARY SIDEBAR */}
            {activeBidder && (
              <div className="col-span-12 lg:col-span-4 xl:col-span-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-6 flex flex-col animate-in fade-in slide-in-from-right-3 duration-500">
                <div>
                  <h3 className="text-md font-bold text-gray-800 mb-1.5">Score Summary</h3>

                  {/* Gauge Chart (Semi-circle speedometer gauge) */}
                  <div className="flex flex-col items-center justify-center p-3 border border-gray-50 rounded-2xl mb-4 bg-gray-50/30">
                    <div className="relative w-44 h-26 flex items-end justify-center overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 55">
                        {/* Background Track */}
                        <path
                          d="M 5 50 A 45 45 0 0 1 95 50"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        {/* Active Score Gauge */}
                        <path
                          d="M 5 50 A 45 45 0 0 1 95 50"
                          fill="none"
                          stroke="#953002"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray="141.37"
                          strokeDashoffset={141.37 - (compositeScore / 100) * 141.37}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>

                      {/* Centered composite score */}
                      <div className="absolute text-center pb-1">
                        <span className="block text-2xl font-black text-gray-800 leading-none">
                          {compositeScore.toFixed(2)}
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
                      <div className="flex justify-between text-gray-700 font-bold text-[13px] mb-1">
                        <span>Technical Score</span>
                        <span>{Number(techSubtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 font-semibold">
                        <span>70% weight</span>
                        <span>Weighted (×0.70): {(techSubtotal * 0.7).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-b border-gray-50 pb-2">
                      <div className="flex justify-between text-gray-700 font-bold text-[13px] mb-1">
                        <span>Financial Score</span>
                        <span>{isTechPassed ? Number(finSubtotal).toFixed(2) : "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 font-semibold">
                        <span>30% weight</span>
                        <span>Weighted (×0.30): {(isTechPassed ? finSubtotal * 0.3 : 0.0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-black text-sm text-[#953002] pt-1">
                      <span>Final Composite Score</span>
                      <span>{compositeScore.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Evaluation Info */}
                <div className="border-t-2 border-gray-200 pt-5 space-y-3.5">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    Evaluation Info
                  </h4>

                  <div className="space-y-2.5 text-xs text-gray-700">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Evaluator</span>
                      <span className="font-extrabold text-gray-900">
                        {activeBidder.lastSaved !== "Never" 
                          ? activeBidder.evaluatorName 
                          : (user?.name || activeBidder.evaluatorName)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Evaluator Role</span>
                      <span className="font-extrabold text-gray-900">
                        {activeBidder.lastSaved !== "Never"
                          ? (activeBidder.evaluatorRole && activeBidder.evaluatorRole !== "Senior Designer" 
                              ? activeBidder.evaluatorRole 
                              : dbOfficerRole)
                          : (dbOfficerRole || activeBidder.evaluatorRole || "Procurement Officer")}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Bidder</span>
                      <span className="font-extrabold">{activeBidder.bidderName}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-black uppercase text-xs text-[#953002]`}>
                        {activeBidder.status}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Last Saved</span>
                      <span className="text-gray-500 font-bold">{activeBidder.lastSaved}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t-2 border-gray-200 pt-5 flex-1 flex flex-col gap-2">

                  {activeBidder.status !== "COMPLETED" ? (
                    <>
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || submitting}
                        className="w-full flex items-center justify-center border border-[#953002]/20 hover:border-[#953002] bg-white hover:bg-[#FFF7ED] py-3 rounded-2xl text-xs font-bold text-[#953002] transition-colors disabled:opacity-50"
                      >
                        {savingDraft ? "Saving..." : "Save Draft"}
                      </button>

                      <button
                        onClick={() => setActiveModal("submit")}
                        disabled={savingDraft || submitting}
                        className="w-full flex items-center justify-center bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white shadow-md shadow-[#953002]/15 hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Submit Evaluation"}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="bg-gray-100 border border-transparent text-gray-500 p-3 rounded-2xl text-xs font-semibold text-center cursor-not-allowed">
                        Evaluation Submitted & Locked
                      </div>
                      <button
                        onClick={() => {
                          setUnlockPin("");
                          setUnlockPinError(false);
                          setShowUnlockPin(false);
                          setActiveModal("unlock");
                        }}
                        className="w-full flex items-center justify-center border border-gray-200 hover:border-[#953002] bg-white hover:bg-[#FFF7ED] py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:text-[#953002] transition-all shadow-sm"
                      >
                        Unlock for Editing
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (activeBidder?.status === "COMPLETED") {
                        setActiveModal("download");
                      }
                    }}
                    disabled={!activeBidder || activeBidder.status !== "COMPLETED"}
                    className={`w-full flex items-center justify-center border py-3 rounded-2xl text-xs font-bold transition-all ${
                      activeBidder?.status === "COMPLETED"
                        ? "border-[#953002]/20 hover:border-[#953002] bg-[#FFF7ED] hover:bg-[#ffecd6] text-[#953002] cursor-pointer"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Download Score Sheet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- MODALS LAYOUT --- */}

          {mounted && activeModal === "download" && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { setActiveModal(null); setDownloadFormat(null); }}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-md font-extrabold text-gray-800">Download Score Sheet</h3>
                </div>
                <p className="text-xs font-semibold text-gray-600 mb-4">
                  Select your preferred format for the score sheet:
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setDownloadFormat("pdf")}
                    className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${downloadFormat === "pdf"
                      ? "bg-[#FFF7ED] border-[#953002] text-[#953002] shadow-sm"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                  >
                    <FileText className="w-10 h-10 mb-3 opacity-80 text-[#953002]" />
                    <span className="text-xs font-bold text-gray-800 mb-0.5">PDF Format</span>
                    <span className="text-xs text-gray-400 font-semibold">Best for printing</span>
                  </button>
                  <button
                    onClick={() => setDownloadFormat("excel")}
                    className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${downloadFormat === "excel"
                      ? "bg-[#FFF7ED] border-[#953002] text-[#953002] shadow-sm"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                  >
                    <FileSpreadsheet className="w-10 h-10 mb-3 opacity-80 text-green-600" />
                    <span className="text-xs font-bold text-gray-800 mb-0.5">Excel Format</span>
                    <span className="text-xs text-gray-400 font-semibold">Best for analysis</span>
                  </button>
                </div>
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
            </div>,
            document.body
          )}

          {mounted && activeModal === "unlock" && createPortal(
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#953002]" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Unlock Received Bids</h3>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="px-6 pb-6 pt-4">
                  <p className="text-[13px] font-medium text-gray-500 leading-relaxed mb-6 text-center">
                    Authorised credentials are required to unseal all submissions. This action will log your identity and timestamp the event.
                  </p>

                  <div className="space-y-2 relative group px-2">
                    <label className="text-[11px] font-black text-gray-900 ml-1 uppercase tracking-widest flex items-center gap-2">
                      Chair / Deputy Chair PIN
                    </label>
                    <div className="relative">
                      <input 
                        type={showUnlockPin ? "text" : "password"}
                        value={unlockPin}
                        onChange={(e) => {
                          setUnlockPin(e.target.value);
                          if (unlockPinError) setUnlockPinError(false);
                        }}
                        placeholder="••••••••"
                        className={`w-full bg-[#F9FAFB] border rounded-[16px] px-[16px] py-[14px] text-[15px] font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all pr-12 focus:ring-2 ${
                          unlockPinError ? 'border-[#EB5757] focus:ring-[#EB5757]/20' : 'border-gray-200 focus:ring-[#953002]/20 focus:border-[#953002]'
                        }`}
                        style={unlockPinError ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowUnlockPin(!showUnlockPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showUnlockPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {unlockPinError && (
                      <p className="text-[11px] text-[#EB5757] font-bold ml-1">Incorrect PIN. Try again</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-3 py-2.5 rounded-[12px] font-black text-[11px] tracking-widest uppercase border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmUnlock}
                    disabled={unlockPin.length < 4 || unlocking}
                    className="flex-[1.5] px-3 py-2.5 rounded-[12px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#953002]/10 bg-[#953002]/5 text-[#953002] hover:bg-[#953002]/10 disabled:opacity-50"
                  >
                    {unlocking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {unlocking ? "Unlocking..." : "Confirm & Unlock"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && activeModal === "draft" && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-md font-extrabold text-gray-800">Save Draft</h3>
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-relaxed mb-6">
                  Are you sure you want to save the current scores and comments as a draft? You can continue editing later.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-green-600/15 flex items-center justify-center gap-2"
                  >
                    {savingDraft && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Yes, Save Draft
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && activeModal === "submit" && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5" />
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
                    disabled={submitting}
                    className="flex-1 bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Yes, Submit
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && activeModal === "notes" && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
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
                <div className="space-y-2 mb-6">
                  <label className="block text-xs font-bold text-gray-700">Overall Evaluation Notes</label>
                  <textarea
                    placeholder="Enter your overall evaluation notes, recommendations, and any additional comments..."
                    value={notesText}
                    maxLength={1000}
                    onChange={(e) => {
                      setNotesText(e.target.value);
                      setIsDirty(true);
                    }}
                    rows={6}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#953002] text-gray-800 placeholder-gray-300 resize-none"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={15} />
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
                    className="flex-1 bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && activeModal === "documents" && activeBidder && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold text-gray-800">Submitted Bid Documents</h3>
                    <p className="text-xs text-gray-400 font-semibold">{activeBidder.bidderName} ({formatBidderId(activeBidder.bidderId)})</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-600 mb-4">
                  The bidder has submitted the following {activeBidder.documents.length} documents. You can review or download them below:
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-6 scrollbar-none">
                  {activeBidder.documents.map((doc, idx) => {
                    const docName = typeof doc === "string" ? doc : doc.name;
                    const docUrl = typeof doc === "string" ? "" : doc.url;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                          <span className="text-xs font-bold text-gray-700 truncate">{docName}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewBidDoc({ name: docName, url: docUrl })}
                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 hover:bg-[#FFF7ED] text-[#953002] border border-[#953002]/10 hover:scale-105 transition-all"
                            title={`View ${docName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDoc(docName)}
                            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                              downloadingDocs.includes(`${activeBidder.bidderId}::${docName}`)
                                ? "bg-gray-100 text-gray-400 cursor-wait"
                                : downloadedDocs.includes(`${activeBidder.bidderId}::${docName}`)
                                  ? "bg-green-50 text-green-600 border border-green-200/50"
                                  : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] hover:scale-105"
                            }`}
                            disabled={downloadingDocs.includes(`${activeBidder.bidderId}::${docName}`)}
                            title={`Download ${docName}`}
                          >
                            {downloadingDocs.includes(`${activeBidder.bidderId}::${docName}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : downloadedDocs.includes(`${activeBidder.bidderId}::${docName}`) ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={downloadAllDocuments}
                    className="w-full bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All ({activeBidder.documents.length} Files)</span>
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && activeModal === "tenderDocuments" && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto scrollbar-none animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold text-gray-800">Tender Specifications & Bidding Documents</h3>
                    <p className="text-xs text-gray-400 font-semibold">{data.tenderTitle} ({data.tenderNo})</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-600 mb-4">
                  The procurement authority has published the following {tenderDocs.length} tender documents. You can review or download them below:
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-6 scrollbar-none">
                  {tenderDocs.map((doc, idx) => {
                    const docName = doc.name;
                    const docUrl = doc.url;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-700 block truncate">{docName}</span>
                            {doc.size && <span className="text-[10px] text-gray-400 font-medium">{doc.size}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewTenderDoc({ name: docName, url: docUrl })}
                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 hover:bg-[#FFF7ED] text-[#953002] border border-[#953002]/10 hover:scale-105 transition-all"
                            title={`View ${docName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadTenderDoc(docName, docUrl)}
                            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                              downloadingDocs.includes(`tender::${docName}`)
                                ? "bg-gray-100 text-gray-400 cursor-wait"
                                : downloadedDocs.includes(`tender::${docName}`)
                                  ? "bg-green-50 text-green-600 border border-green-200/50"
                                  : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] hover:scale-105"
                            }`}
                            disabled={downloadingDocs.includes(`tender::${docName}`)}
                            title={`Download ${docName}`}
                          >
                            {downloadingDocs.includes(`tender::${docName}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : downloadedDocs.includes(`tender::${docName}`) ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={downloadAllTenderDocuments}
                    className="w-full bg-[#953002] hover:bg-[#7a2702] py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md shadow-[#953002]/15 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All Tender Files ({tenderDocs.length} Files)</span>
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full border border-gray-200 hover:border-gray-300 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 bg-white transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && isSidebarOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex justify-start">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col p-5 animate-in slide-in-from-left duration-300 ease-out z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-md font-bold text-gray-800">Select Bidder</h2>
                    <span className="bg-[#FFF7ED] text-[#953002] text-xs font-bold px-2 py-0.5 rounded-md">
                      {data.bidders.length} total
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-[#953002]/30 transition-all text-gray-800 placeholder:text-gray-400 placeholder:font-normal placeholder:italic"
                  />
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 no-scrollbar flex-grow">
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
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${isActive
                          ? "bg-[#FFF7ED] border-[#FFF7ED] shadow-sm"
                          : "bg-white border-transparent hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-colors shrink-0 ${isActive
                            ? "bg-[#953002] text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-gray-800 group-hover:text-gray-900 truncate">
                              {bidder.bidderName}
                            </h4>
                            <span className="text-xs text-gray-400 font-semibold uppercase block truncate">
                              {formatBidderId(bidder.bidderId)}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-widest shrink-0 bg-[#FFF7ED] text-[#953002] border border-[#953002]/20`}>
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
            </div>,
            document.body
          )}

          {/* ── 1. DUAL SIDE-BY-SIDE DOCUMENT COMPARISON MODAL ── */}
          {mounted && previewBidDoc && previewTenderDoc && createPortal(
            <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-3 md:p-6 overflow-hidden">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-7xl h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Top Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">Dual Document Comparison View</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        Comparing Bidder Proposal side-by-side with Tender Specifications
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPreviewBidDoc(null); setPreviewTenderDoc(null); }}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    title="Close Dual View"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Grid: 2 Equal Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 flex-grow overflow-hidden bg-gray-100/50">
                  {/* LEFT PANE: Bid Document */}
                  <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4.5 h-4.5 text-[#953002] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-extrabold text-gray-800 block truncate">{previewBidDoc.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block truncate">
                            {activeBidder ? `${activeBidder.bidderName} (${formatBidderId(activeBidder.bidderId)})` : "Bidder"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadDoc(previewBidDoc.name)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                            downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                              : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                                ? "bg-green-50 text-green-700 border border-green-200 font-bold"
                                : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 hover:scale-105 active:scale-95"
                          }`}
                          disabled={downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)}
                          title="Download Bid Document"
                        >
                          {downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Download size={14} />
                          )}
                          {downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                            ? "Downloading..."
                            : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                              ? "Downloaded"
                              : "Download"}
                        </button>
                        <button
                          onClick={() => setPreviewBidDoc(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                          title="Close Bid Document"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-grow overflow-hidden bg-white relative flex flex-col h-full w-full">
                      {previewBidDoc.url ? (
                        <SecureIframe src={previewBidDoc.url} className="w-full h-full border-0 scrollbar-none" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                          <FileText className="w-12 h-12 mb-3 text-gray-300 animate-pulse" />
                          <p className="text-sm font-bold text-gray-700">No online file path found for {previewBidDoc.name}</p>
                          <p className="text-xs text-gray-400 mt-1">This document is local or simulated.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: Tender Document */}
                  <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4.5 h-4.5 text-[#953002] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-extrabold text-gray-800 block truncate">{previewTenderDoc.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block truncate">{data.tenderTitle} ({data.tenderNo})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadTenderDoc(previewTenderDoc.name, previewTenderDoc.url)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                            downloadingDocs.includes(`tender::${previewTenderDoc.name}`)
                              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                              : downloadedDocs.includes(`tender::${previewTenderDoc.name}`)
                                ? "bg-green-50 text-green-700 border border-green-200 font-bold"
                                : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 hover:scale-105 active:scale-95"
                          }`}
                          disabled={downloadingDocs.includes(`tender::${previewTenderDoc.name}`)}
                          title="Download Tender Document"
                        >
                          {downloadingDocs.includes(`tender::${previewTenderDoc.name}`) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : downloadedDocs.includes(`tender::${previewTenderDoc.name}`) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Download size={14} />
                          )}
                          {downloadingDocs.includes(`tender::${previewTenderDoc.name}`)
                            ? "Downloading..."
                            : downloadedDocs.includes(`tender::${previewTenderDoc.name}`)
                              ? "Downloaded"
                              : "Download"}
                        </button>
                        <button
                          onClick={() => setPreviewTenderDoc(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                          title="Close Tender Document"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-grow overflow-hidden bg-white relative flex flex-col h-full w-full">
                      {previewTenderDoc.url ? (
                        <SecureIframe src={previewTenderDoc.url} className="w-full h-full border-0 scrollbar-none" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                          <FileText className="w-12 h-12 mb-3 text-gray-300 animate-pulse" />
                          <p className="text-sm font-bold text-gray-700">No online file path found for {previewTenderDoc.name}</p>
                          <p className="text-xs text-gray-400 mt-1">This document is local or simulated.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* ── 2. SINGLE BID DOCUMENT PREVIEW MODAL (WHEN TENDER DOC IS NOT OPEN) ── */}
          {mounted && previewBidDoc && !previewTenderDoc && createPortal(
            <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 md:p-8 scrollbar-none overflow-hidden">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden scrollbar-none animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">{previewBidDoc.name}</h3>
                      <p className="text-[10.8px] text-gray-400 font-bold uppercase tracking-widest mt-0">
                        {activeBidder ? `${activeBidder.bidderName} (${formatBidderId(activeBidder.bidderId)})` : "Bidder"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Custom Styled Dropdown for View Tender Document */}
                    {tenderDocs.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                          className="flex items-center gap-2 bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                        >
                          <span>Tender Documents</span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isCompareDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCompareDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCompareDropdownOpen(false)} />
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-3xl shadow-xl p-2 z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                              {tenderDocs.map((td) => (
                                <button
                                  key={td.name}
                                  onClick={() => {
                                    setPreviewTenderDoc({ name: td.name, url: td.url });
                                    setIsCompareDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-700 hover:bg-[#FFF7ED] hover:text-[#953002] transition-all text-left"
                                >
                                  <span className="truncate">{td.name}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownloadDoc(previewBidDoc.name)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                        downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                          : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                            ? "bg-green-50 text-green-700 border border-green-200 font-bold"
                            : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 hover:scale-105 active:scale-95"
                      }`}
                      disabled={downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)}
                      title="Download Document"
                    >
                      {downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Download size={14} />
                      )}
                      {downloadingDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                        ? "Downloading..."
                        : downloadedDocs.includes(`${activeBidder?.bidderId}::${previewBidDoc.name}`)
                          ? "Downloaded"
                          : "Download"}
                    </button>
                    <button
                      onClick={() => setPreviewBidDoc(null)}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                      title="Close Preview"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Viewer Body */}
                <div className="flex-grow overflow-hidden bg-white relative scrollbar-none flex flex-col h-full w-full">
                  {previewBidDoc.url ? (
                    <SecureIframe src={previewBidDoc.url} className="w-full h-full border-0 scrollbar-none overflow-hidden" style={{ overflow: 'hidden' }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                      <FileText className="w-12 h-12 mb-3 text-gray-300 animate-pulse" />
                      <p className="text-sm font-bold text-gray-700">No online file path found for {previewBidDoc.name}</p>
                      <p className="text-xs text-gray-400 mt-1">This document is local or simulated.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* ── 3. SINGLE TENDER DOCUMENT PREVIEW MODAL (WHEN BID DOC IS NOT OPEN) ── */}
          {mounted && previewTenderDoc && !previewBidDoc && createPortal(
            <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 md:p-8 scrollbar-none overflow-hidden">
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden scrollbar-none animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#953002] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">{previewTenderDoc.name}</h3>
                      <p className="text-[10.8px] text-gray-400 font-bold uppercase tracking-widest mt-0">
                        {data.tenderTitle} ({data.tenderNo})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Custom Styled Dropdown for View Bid Document */}
                    {activeBidder && activeBidder.documents.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                          className="flex items-center gap-2 bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                        >
                          <span>Bid Documents</span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isCompareDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCompareDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCompareDropdownOpen(false)} />
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-3xl shadow-xl p-2 z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                              {activeBidder.documents.map((bd, idx) => {
                                const name = typeof bd === "string" ? bd : bd.name;
                                const url = typeof bd === "string" ? "" : bd.url;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setPreviewBidDoc({ name, url });
                                      setIsCompareDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-700 hover:bg-[#FFF7ED] hover:text-[#953002] transition-all text-left"
                                  >
                                    <span className="truncate">{name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownloadTenderDoc(previewTenderDoc.name, previewTenderDoc.url)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        downloadingDocs.includes(`tender::${previewTenderDoc.name}`)
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-wait"
                          : downloadedDocs.includes(`tender::${previewTenderDoc.name}`)
                            ? "bg-green-50 text-green-700 border border-green-200 font-bold"
                            : "bg-[#FFF7ED] hover:bg-[#FFF7ED]/80 text-[#953002] border border-[#953002]/20 hover:scale-105 active:scale-95"
                      }`}
                      disabled={downloadingDocs.includes(`tender::${previewTenderDoc.name}`)}
                      title="Download Document"
                    >
                      {downloadingDocs.includes(`tender::${previewTenderDoc.name}`) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : downloadedDocs.includes(`tender::${previewTenderDoc.name}`) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Download size={14} />
                      )}
                      {downloadingDocs.includes(`tender::${previewTenderDoc.name}`)
                        ? "Downloading..."
                        : downloadedDocs.includes(`tender::${previewTenderDoc.name}`)
                          ? "Downloaded"
                          : "Download"}
                    </button>
                    <button
                      onClick={() => setPreviewTenderDoc(null)}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                      title="Close Preview"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Viewer Body */}
                <div className="flex-grow overflow-hidden bg-white relative scrollbar-none flex flex-col h-full w-full">
                  {previewTenderDoc.url ? (
                    <SecureIframe src={previewTenderDoc.url} className="w-full h-full border-0 scrollbar-none overflow-hidden" style={{ overflow: 'hidden' }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                      <FileText className="w-12 h-12 mb-3 text-gray-300 animate-pulse" />
                      <p className="text-sm font-bold text-gray-700">No online file path found for {previewTenderDoc.name}</p>
                      <p className="text-xs text-gray-400 mt-1">This document is local or simulated.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

          {mounted && toasts.length > 0 && createPortal(
            <div className="fixed top-6 right-6 z-[100000] flex flex-col gap-3 items-end pointer-events-none">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={`w-max max-w-[90vw] whitespace-nowrap pointer-events-auto flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl shadow-md border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                    t.type === "success" ? "bg-[#E8F8F0] border-[#27AE60]/20 text-[#27AE60]" :
                      t.type === "error" ? "bg-red-50 border-red-200 text-red-750" :
                        t.type === "warning" ? "bg-[#FFF7ED] border-[#953002]/20 text-[#953002]" :
                          "bg-[#EBF5FF] border-[#3B82F6]/20 text-[#1E3A8A]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {t.type === "success" && <Check className="w-5 h-5 text-[#27AE60]" />}
                    {t.type === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-[#953002]" />}
                    {t.type === "info" && <HelpCircle className="w-5 h-5 text-[#3B82F6]" />}
                    <span className="text-[13px] font-bold tracking-tight">{t.message}</span>
                  </div>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                    className={`ml-4 p-0.5 rounded-lg hover:bg-black/5 transition-colors ${
                      t.type === "success" ? "text-[#27AE60]/60 hover:text-[#27AE60]" :
                        t.type === "error" ? "text-red-750/60 hover:text-red-750" :
                          t.type === "warning" ? "text-[#953002]/60 hover:text-[#953002]" :
                            "text-[#1E3A8A]/60 hover:text-[#1E3A8A]"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>,
            document.body
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
