"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { getAssignedTenders } from "@/lib/api/officer.api";
import { getBidsByTender, getAllBids } from "@/services/bid.service";
import { getTimeline } from "@/services/tender.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  RotateCcw,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Clock,
  Eye,
  BarChart3,
  ClipboardList,
  BookOpen,
  Activity,
  ArrowLeft,
  Info,
  Package,
  User,
  Calendar,
  Hash,
  Building2,
  Printer,
  Check,
  Loader2,
} from "lucide-react";

import Footer from "@/components/home/Footer";

// ─────────────────────────── Types ───────────────────────────
type ReportStatus = "Finalized" | "In Progress" | "Pending";
type EnvelopeStatus = "Opened" | "Not Opened";
type CompletionStatus = "Complete" | "Minor Gap" | "Incomplete" | "N/A" | "Late";
type AdmissionStatus = "Admitted" | "Rejected" | "Pending";
type BidderStatus = "Winner" | "Reviewed" | "Pending";

interface BidRow {
  id: number;
  bidderName: string;
  bidReference: string;
  submissionDateTime: string;
  envelopeStatus: EnvelopeStatus;
  quotedValue: string;
  completeness: CompletionStatus;
  admissionStatus: AdmissionStatus;
  notes: string;
  isLate: boolean;
}

interface EvaluationRow {
  rank: number;
  bidder: string;
  technicalScore: number;
  technicalBar: number;
  financialScore: number;
  financialBar: number;
  compliancePassed: boolean;
  compositeScore: number;
  evaluator: string;
  status: BidderStatus;
  notes?: string;
}

interface ConsensusRow {
  criteria: string;
  weight: string;
  evaluator1Score: number;
  evaluator2Score: number;
  variance: string;
  varianceType: "positive" | "negative" | "neutral";
  weightedAvg: number;
  weightedScore: number;
  note?: string;
}

interface AuditRow {
  id: number;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  tenderRef: string;
  details: string;
  ipSession: string;
  type: "System" | "Action" | "Decision" | "Lock";
}

// Helper: format a bid API response into a BidRow
function formatSubmissionDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", " ·");
  } catch {
    return raw;
  }
}

function formatQuotedValue(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return "—";
  const cur = currency || "LKR";
  return `${cur} ${Number(amount).toLocaleString("en-LK")}`;
}

function apiBidToRow(
  bid: any, 
  index: number, 
  evalNotesMap: Record<string, string> = {}, 
  evalBidders: any[] = []
): BidRow {
  const evaluationObj = evalBidders.find((eb: any) => eb.bidderId === bid.id || eb.bidderName === bid.bidderName);

  let admissionStatus = "Pending";
  if (evaluationObj) {
    if (evaluationObj.complianceStatus === "FAIL" || evaluationObj.status === "REJECTED") {
      admissionStatus = "Rejected";
    } else if (evaluationObj.status === "COMPLETED") {
      admissionStatus = "Admitted";
    }
  }

  return {
    id: index + 1,
    bidderName: bid.companyName || bid.bidderName || "—",
    bidReference: bid.id ? `BID-${String(bid.id).slice(0, 8).toUpperCase()}` : "—",
    submissionDateTime: formatSubmissionDate(bid.submittedAt),
    envelopeStatus: "Opened",
    quotedValue: formatQuotedValue(bid.bidAmount, bid.currency),
    completeness: "N/A",
    admissionStatus,
    // Prefer evaluation notes saved in bid-evaluation UI; fall back to bid.notes
    notes: evalNotesMap[bid.id] || bid.notes || "",
    isLate: false,
  };
}

const MOCK_EVALUATIONS: EvaluationRow[] = [
  {
    rank: 1,
    bidder: "Apex Technologies Ltd.",
    technicalScore: 84.0,
    technicalBar: 84,
    financialScore: 63.4,
    financialBar: 63,
    compliancePassed: true,
    compositeScore: 87.4,
    evaluator: "John Smith",
    status: "Winner",
    notes: "Exceptional technical proposal with comprehensive coverage.",
  },
  {
    rank: 2,
    bidder: "Digital Dynamics (Pvt) Ltd.",
    technicalScore: 41.5,
    technicalBar: 42,
    financialScore: 37.0,
    financialBar: 37,
    compliancePassed: true,
    compositeScore: 78.5,
    evaluator: "John Smith",
    status: "Reviewed",
    notes: "Strong compliance score, minor gaps in warranty details.",
  },
  {
    rank: 3,
    bidder: "SynergyNet Solutions",
    technicalScore: 38.0,
    technicalBar: 38,
    financialScore: 36.2,
    financialBar: 36,
    compliancePassed: true,
    compositeScore: 74.2,
    evaluator: "John Smith",
    status: "Reviewed",
    notes: "Low technical score due to insufficient documentation.",
  },
];

const MOCK_CONSENSUS: ConsensusRow[] = [
  {
    criteria: "Technical Compliance",
    weight: "35%",
    evaluator1Score: 24,
    evaluator2Score: 24,
    variance: "+0 pts",
    varianceType: "neutral",
    weightedAvg: 25.0,
    weightedScore: 7.58,
    note: "Perfect consensus achieved by all evaluators.",
  },
  {
    criteria: "Financial Proposal",
    weight: "25%",
    evaluator1Score: 22,
    evaluator2Score: 18,
    variance: "-4 pts",
    varianceType: "negative",
    weightedAvg: 20.0,
    weightedScore: 1.80,
    note: "Moderate - evaluate separately",
  },
  {
    criteria: "Legal & Compliance",
    weight: "22%",
    evaluator1Score: 17,
    evaluator2Score: 16,
    variance: "-1 pt",
    varianceType: "negative",
    weightedAvg: 16.5,
    weightedScore: 5.30,
    note: "Within threshold",
  },
];

const MOCK_AUDIT: AuditRow[] = [
  {
    id: 1,
    timestamp: "12 Jan 2024 · 09:15 AM",
    user: "System Administrator",
    userRole: "System",
    action: "Tender Created",
    tenderRef: "TND-2024-0041",
    details: "Tender TND-2024-0041 created and published. Submission window opened.",
    ipSession: "—",
    type: "System",
  },
  {
    id: 2,
    timestamp: "15 Mar 2024 · 10:00 AM",
    user: "Jane Doe",
    userRole: "Chairperson",
    action: "Opening Session",
    tenderRef: "TND-2024-0041",
    details: "Bid opening session commenced. 5 envelopes opened in the presence of committee. 1 late bid rejected.",
    ipSession: "Cell Text",
    type: "Action",
  },
  {
    id: 3,
    timestamp: "28 Mar 2024 · 03:30 PM",
    user: "Jane Doe",
    userRole: "Chairperson",
    action: "Award Finalized",
    tenderRef: "TND-2024-0041",
    details: "Award decision finalized. Winner: Apex Technologies Ltd. (BID-0041-001). Justification recorded.",
    ipSession: "Cell Text",
    type: "Decision",
  },
];

// ─────────────────────────── Sub-components ───────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Admitted: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Rejected: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Pending: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Winner: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Reviewed: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Complete: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    "Minor Gap": "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Incomplete: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    "N/A": "bg-gray-100 text-gray-500 border border-gray-200",
    Late: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    Submitted: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    SUBMITTED: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    WINNER: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    REJECTED: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    PENDING: "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20",
    COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Evaluation Completed": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  const normalized = status?.toUpperCase();
  const displayStatus = normalized === "COMPLETED" ? "Evaluation Completed" : status;
  const lookupKey = normalized === "COMPLETED" ? "Evaluation Completed" : status;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${styles[lookupKey] || "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20"}`}>
      {displayStatus}
    </span>
  );
}

function EnvelopeBadge({ status }: { status: EnvelopeStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${status === "Opened" ? "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
      {status === "Opened" ? "✦ Opened" : status}
    </span>
  );
}

function AuditTypeBadge({ type }: { type: AuditRow["type"] }) {
  const styles: Record<string, string> = {
    System: "bg-gray-100 text-gray-500 border border-gray-200",
    Action: "bg-blue-50 text-blue-700 border border-blue-200",
    Decision: "bg-green-50 text-green-700 border border-green-200",
    Lock: "bg-red-50 text-red-600 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${styles[type]}`}>
      {type}
    </span>
  );
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <span className="text-sm font-black text-gray-800">{value.toFixed(2)}</span>
  );
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
}

function CustomSelect({ value, onChange, options, placeholder, emptyText }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#953002]/40 transition-colors flex items-center justify-between text-left"
      >
        <span className={`truncate mr-2 ${(!value || String(value).startsWith("Select")) ? 'text-gray-400 font-medium' : 'text-gray-700 font-semibold'}`}>
          {value || placeholder || "Select"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-1.5 max-h-60 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs font-semibold text-[#953002]/60 text-center">
              {emptyText || "No options available"}
            </div>
          ) : (
            options
              .filter((opt) => !opt.startsWith("Select"))
              .map((opt) => {
                const isSelected = value === opt;
                return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#953002]/5 text-[#953002]"
                      : "text-gray-700 hover:bg-[#953002]/5 hover:text-[#953002]"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#953002] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function CustomDatePicker({ value, onChange, placeholder = "DD / MM / YYYY" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const parsedDate = value ? new Date(value) : null;

  const [currentYear, setCurrentYear] = useState(parsedDate ? parsedDate.getFullYear() : today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(parsedDate ? parsedDate.getMonth() : today.getMonth());

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndexRaw = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1;

  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevMonthYear,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - days.length;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextMonthYear,
      isCurrentMonth: false,
    });
  }

  const handleSelectDay = (dayObj: typeof days[0]) => {
    const y = dayObj.year;
    const m = String(dayObj.month + 1).padStart(2, "0");
    const d = String(dayObj.day).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const handleToday = () => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = d.getDate();
    const monthName = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${monthName} ${year}`;
  };

  return (
    <div className="relative text-left w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#953002]/40 transition-colors flex items-center justify-between text-left cursor-pointer"
      >
        <span className={getDisplayValue() ? "text-gray-700" : "text-gray-400 font-semibold"}>
          {getDisplayValue() || placeholder}
        </span>
        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-800">
              {months[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((dayObj, i) => {
              const isSelected = parsedDate &&
                parsedDate.getFullYear() === dayObj.year &&
                parsedDate.getMonth() === dayObj.month &&
                parsedDate.getDate() === dayObj.day;

              const isToday = today.getFullYear() === dayObj.year &&
                today.getMonth() === dayObj.month &&
                today.getDate() === dayObj.day;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDay(dayObj)}
                  className={`h-7 w-7 text-xs rounded-lg transition-all flex items-center justify-center mx-auto cursor-pointer ${
                    !dayObj.isCurrentMonth
                      ? "text-gray-300 hover:bg-gray-50"
                      : isSelected
                      ? "bg-[#953002] text-white font-bold"
                      : isToday
                      ? "border border-[#953002] text-[#953002] font-bold hover:bg-[#953002]/5"
                      : "text-gray-700 hover:bg-[#953002]/5 hover:text-[#953002]"
                  }`}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] font-black text-gray-400 hover:text-[#953002] transition-colors cursor-pointer uppercase tracking-widest"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[10px] font-black text-[#953002] hover:text-[#7a2702] transition-colors cursor-pointer uppercase tracking-widest"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Main Page ───────────────────────────
function ReportsAndAuditContent() {
  const searchParams = useSearchParams();
  const tenderNoParam = searchParams ? searchParams.get("tenderNo") : null;
  const tenderIdParam = searchParams ? searchParams.get("tenderId") : null;
  const tabParam = searchParams ? searchParams.get("tab") : null;

  const [activeTab, setActiveTab] = useState<"opening" | "evaluation" | "audit">(
    tabParam === "evaluation" ? "evaluation" : "opening"
  );
  const [tender, setTender] = useState("");
  const [tendersList, setTendersList] = useState<any[]>([]);
  const [bidRows, setBidRows] = useState<BidRow[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tendersLoading, setTendersLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [bidder, setBidder] = useState("Select Bidder");
  const [reportStatus, setReportStatus] = useState("Select Status");

  const [appliedTender, setAppliedTender] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [appliedBidder, setAppliedBidder] = useState("Select Bidder");
  const [appliedReportStatus, setAppliedReportStatus] = useState("Select Status");

  const getBackendStatus = (statusStr: string) => {
    if (statusStr === "All Statuses" || statusStr === "Select Status") return "ALL";
    if (statusStr === "Pending Opening") return "PENDING_OPENING";
    if (statusStr === "Open") return "OPEN";
    if (statusStr === "Evaluation") return "EVALUATION";
    if (statusStr === "Completed" || statusStr === "Evaluation Completed") return "COMPLETED";
    return "ALL";
  };

  const handleApplyFilters = () => {
    setAppliedTender(tender);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedBidder(bidder);
    setAppliedReportStatus(reportStatus);
  };

  const [globalBids, setGlobalBids] = useState<any[]>([]);

  const globalBidders = useMemo(() => {
    const bidders = new Set<string>();
    globalBids.forEach((b: any) => {
      const name = b.companyName || b.bidderName;
      if (name && name !== "—") {
        bidders.add(name);
      }
    });
    return Array.from(bidders);
  }, [globalBids]);

  const bidderOptions = useMemo(() => {
    // If an applied tender is selected and there are active bidRows, filter to those bidders
    if (appliedTender && bidRows && bidRows.length > 0) {
      const bidders = new Set<string>();
      bidRows.forEach((row) => {
        if (row.bidderName && row.bidderName !== "—") {
          bidders.add(row.bidderName);
        }
      });
      return ["Select Bidder", "All Bidders", ...Array.from(bidders)];
    }
    // Otherwise, show all global bidders fetched from the database
    if (globalBidders && globalBidders.length > 0) {
      return ["Select Bidder", "All Bidders", ...globalBidders];
    }
    // Fallback default
    return ["Select Bidder", "All Bidders"];
  }, [appliedTender, bidRows, globalBidders]);

  const selectedTenderObj = useMemo(() => {
    if (!appliedTender) return null;
    const tenderNo = appliedTender.split(" - ")[0];
    return tendersList.find(t => (t.tenderNo || t.tenderNumber || t.id) === tenderNo);
  }, [appliedTender, tendersList]);

  const isPendingOpening = selectedTenderObj?.status === "PENDING_OPENING";

  const filteredBidRows = useMemo(() => {
    let rows = bidRows;
    if (appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders") {
      rows = rows.filter((r) => r.bidderName === appliedBidder);
    }
    if (appliedReportStatus && appliedReportStatus !== "Select Status" && appliedReportStatus !== "All Statuses") {
      rows = rows.filter((r) => r.status === appliedReportStatus.toUpperCase());
    }
    return rows;
  }, [bidRows, appliedBidder, appliedReportStatus]);

  const filteredEvaluations = useMemo(() => {
    let evals = evaluations;
    if (appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders") {
      evals = evals.filter((e) => e.bidder === appliedBidder);
    }
    return evals;
  }, [evaluations, appliedBidder]);

  useEffect(() => {
    getAllBids()
      .then((bidsData) => {
        const list = Array.isArray(bidsData) ? bidsData : (bidsData?.content || []);
        setGlobalBids(list);
      })
      .catch((err) => console.error("Error fetching global bids:", err));
  }, []);

  useEffect(() => {
    setTendersLoading(true);
    const backendStatus = getBackendStatus(reportStatus);
    getAssignedTenders("", backendStatus, 0, 100)
      .then((res) => {
        const content = res.data?.content || [];
        setTendersList(content);
        
        // Keep selected tender if it exists in the new list
        const exists = content.some((t: any) => {
          const refStr = t.tenderNo || t.tenderNumber || t.id;
          return tender.startsWith(refStr);
        });
        if (!exists && tender !== "Select Tender" && tender !== "") {
          setTender("Select Tender");
        }
      })
      .catch((err) => {
        console.error("Error fetching approved tenders:", err);
      })
      .finally(() => {
        setTendersLoading(false);
        setIsInitialLoading(false);
      });
  }, [reportStatus]);

  useEffect(() => {
    if (tendersList.length > 0) {
      let matchedTender: any = null;
      if (tenderNoParam) {
        matchedTender = tendersList.find((t: any) => (t.tenderNo || t.tenderNumber) === tenderNoParam);
      } else if (tenderIdParam) {
        matchedTender = tendersList.find((t: any) => t.id === tenderIdParam);
      }
      
      if (matchedTender) {
        const tenderStr = `${matchedTender.tenderNo || matchedTender.tenderNumber || matchedTender.id} - ${matchedTender.title}`;
        setTender(tenderStr);
        setAppliedTender(tenderStr);
      }
    }
  }, [tendersList, tenderNoParam, tenderIdParam]);

  useEffect(() => {
    if (tabParam === "evaluation") {
      setActiveTab("evaluation");
    }
  }, [tabParam]);

  const getEmptyTenderText = () => {
    if (tendersLoading) return "Loading tenders...";
    const isBidderSelected = bidder && bidder !== "Select Bidder" && bidder !== "All Bidders";
    const isDateSelected = !!(dateFrom || dateTo);
    const isStatusSelected = reportStatus && reportStatus !== "Select Status" && reportStatus !== "All Statuses";
    
    if (isBidderSelected && isDateSelected && isStatusSelected) {
      return "No tenders found for bidder with selected status and date range.";
    }
    if (isBidderSelected && isDateSelected) {
      return "No tenders found for this bidder in the selected date range.";
    }
    if (isBidderSelected && isStatusSelected) {
      return "No tenders found for bidder with selected status.";
    }
    if (isBidderSelected) {
      return "No bid submissions found for the selected bidder.";
    }
    if (isDateSelected && isStatusSelected) {
      return "No tenders found for selected status in the selected date range.";
    }
    if (isDateSelected) {
      return "No tenders found in the selected date range.";
    }
    if (isStatusSelected) {
      return "No tenders found for selected status.";
    }
    return "No tenders found.";
  };

  // Build a stable map of tenderNo → UUID so we can pass the real UUID to bid-service
  const tenderNoToId = React.useMemo(
    () => Object.fromEntries(
      tendersList.map((t: any) => [t.tenderNo || t.tenderNumber || t.id, t.id])
    ),
    [tendersList]
  );

  const tenderOptions = React.useMemo(() => {
    let list = tendersList;
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      list = list.filter((t: any) => {
        const tDate = t.createdAt;
        if (!tDate) return true;
        return new Date(tDate).getTime() >= fromTime;
      });
    }
    if (dateTo) {
      const toTime = new Date(dateTo).getTime() + 86399999;
      list = list.filter((t: any) => {
        const tDate = t.createdAt;
        if (!tDate) return true;
        return new Date(tDate).getTime() <= toTime;
      });
    }
    if (bidder && bidder !== "Select Bidder" && bidder !== "All Bidders") {
      const bidderTenderIds = new Set(
        globalBids
          .filter((b: any) => (b.companyName || b.bidderName) === bidder)
          .map((b: any) => b.tenderId)
      );
      list = list.filter((t: any) => bidderTenderIds.has(t.id));
    }
    return list.map((t: any) => `${t.tenderNo || t.tenderNumber || t.id} - ${t.title}`);
  }, [tendersList, dateFrom, dateTo, bidder, globalBids]);

  const getTenderRef = (tenderStr: string) => {
    if (!tenderStr) return "Select Tender";
    const parts = tenderStr.split(" - ");
    return parts[0];
  };

  // Fetch real bid data and merge evaluation notes whenever the selected tender changes
  useEffect(() => {
    if (!appliedTender) {
      setBidRows([]);
      setEvaluations([]);
      setAuditLogs([]);
      return;
    }
    const tenderNo = appliedTender.split(" - ")[0];
    // Resolve tenderNo to the UUID the bid-service expects
    const tenderId = tenderNoToId[tenderNo] || tenderNo;
    if (!tenderId || tenderId === "Select Tender") return;
    setBidsLoading(true);
    setAuditLoading(true);

    const EVAL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

    Promise.all([
      getBidsByTender(tenderId),
      fetch(`${EVAL_BASE}/api/evaluations/mock/${tenderNo}/data`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      getTimeline(tenderId).catch(() => [])
    ])
      .then(([bidsData, evalJson, timelineData]: [any, any, any]) => {
        const list: any[] = Array.isArray(bidsData) ? bidsData : (bidsData?.content || []);

        // Build bidderId → evaluationNotes map from evaluation data
        const evalNotesMap: Record<string, string> = {};
        const evalBidders: any[] = evalJson?.data?.bidders || [];
        for (const b of evalBidders) {
          if (b.bidderId && b.evaluationNotes) {
            evalNotesMap[b.bidderId] = b.evaluationNotes;
          }
        }

        setBidRows(list.map((bid, i) => apiBidToRow(bid, i, evalNotesMap, evalBidders)));

        // Map timeline data to audit logs
        const hasCreatedEvent = (timelineData || []).some((item: any) => item.eventType === "CREATED");
        let finalTimeline = [...(timelineData || [])];
        if (!hasCreatedEvent) {
          const matchedT = tendersList.find((t: any) => {
            const refStr = t.tenderNo || t.tenderNumber || t.id;
            return tenderNo === refStr;
          });
          const siblingEvent = (timelineData || []).find((e: any) => e.createdBy && e.creatorRole);
          const creator = siblingEvent ? siblingEvent.createdBy : null;
          const role = siblingEvent ? siblingEvent.creatorRole : null;
          
          if (matchedT && matchedT.createdAt) {
            finalTimeline.push({
              eventType: "CREATED",
              description: "Tender created in system",
              timestamp: matchedT.createdAt,
              createdBy: creator,
              creatorRole: role
            });
          }
        }
        
        finalTimeline.sort((a: any, b: any) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeB - timeA;
        });

        const logs: AuditRow[] = finalTimeline.map((item: any, idx: number) => {
          let user = item.createdBy || "Procurement Officer";
          let userRole = item.creatorRole || "Procuring Entity";
          let action = item.eventType || "Event Logged";
          
          if (action === "CREATED" || action === "PUBLISHED") {
            action = action === "CREATED" ? "Tender Created" : "Tender Published";
          } else if (action === "CLOSED") {
            action = "Submissions Closed";
            user = "Committee";
            userRole = "Committee";
          } else if (action === "OPEN") {
            action = "Opening Session";
            user = "Committee";
            userRole = "Committee";
          }

          let timestampStr = "-- --- ---- · --:-- --";
          if (item.timestamp) {
            const date = new Date(item.timestamp);
            const dateFormatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            timestampStr = `${dateFormatted} · ${timeFormatted}`;
          }

          return {
            id: idx + 1,
            timestamp: timestampStr,
            user,
            userRole,
            action,
            tenderRef: tenderNo,
            details: item.description || "",
            ipSession: "—",
            type: "System",
          };
        });
        setAuditLogs(logs);

        const processedEvaluations: EvaluationRow[] = evalBidders
          .filter((b: any) => b.status === "COMPLETED")
          .map((bidder: any) => {
            const techSubtotal = bidder.technicalCriteria?.reduce((sum: number, c: any) => sum + (c.score || 0) * ((c.weight || 0) / 100), 0) || 0;
            const finSubtotal = bidder.financialCriteria?.reduce((sum: number, c: any) => sum + (c.score || 0) * ((c.weight || 0) / 100), 0) || 0;
            
            const technicalScore = techSubtotal * 0.7;
            const financialScore = techSubtotal >= 75 ? (finSubtotal * 0.3) : 0;
            const compositeScore = technicalScore + financialScore;
            
            return {
              rank: 0,
              bidder: bidder.bidderName,
              technicalScore: Number(technicalScore.toFixed(2)),
              technicalBar: Math.round(technicalScore),
              financialScore: Number(financialScore.toFixed(2)),
              financialBar: Math.round(financialScore),
              compliancePassed: bidder.complianceStatus === "PASS" || techSubtotal >= 75,
              compositeScore: Number(compositeScore.toFixed(2)),
              evaluator: bidder.evaluatorName || "Jane Doe",
              status: bidder.complianceStatus === "FAIL" ? "Rejected" : "Reviewed",
              notes: bidder.evaluationNotes || "No notes available."
            };
          });

        if (processedEvaluations.length > 0) {
          processedEvaluations.sort((a, b) => b.compositeScore - a.compositeScore);
          processedEvaluations.forEach((item, idx) => {
            item.rank = idx + 1;
          });
          if (processedEvaluations[0].compliancePassed) {
            processedEvaluations[0].status = "Winner";
          }
          setEvaluations(processedEvaluations);
        } else {
          setEvaluations([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching bids:", err);
        setBidRows([]);
        setEvaluations([]);
        setAuditLogs([]);
      })
      .finally(() => {
        setBidsLoading(false);
        setAuditLoading(false);
      });
  }, [appliedTender, tenderNoToId]);

  const [openingPage, setOpeningPage] = useState(1);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const [consensusPage, setConsensusPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Pagination for opening report
  const totalOpeningPages = Math.max(1, Math.ceil(filteredBidRows.length / ITEMS_PER_PAGE));
  const paginatedBidRows = filteredBidRows.slice((openingPage - 1) * ITEMS_PER_PAGE, openingPage * ITEMS_PER_PAGE);

  // Pagination for evaluation report
  const totalEvaluationPages = Math.max(1, Math.ceil(filteredEvaluations.length / ITEMS_PER_PAGE));
  const paginatedEvaluations = filteredEvaluations.slice((evaluationPage - 1) * ITEMS_PER_PAGE, evaluationPage * ITEMS_PER_PAGE);

  // Pagination for consensus sheet
  const totalConsensusPages = Math.max(1, Math.ceil(MOCK_CONSENSUS.length / ITEMS_PER_PAGE));
  const paginatedConsensus = MOCK_CONSENSUS.slice((consensusPage - 1) * ITEMS_PER_PAGE, consensusPage * ITEMS_PER_PAGE);

  // Pagination for audit log
  const totalAuditPages = Math.max(1, Math.ceil(auditLogs.length / ITEMS_PER_PAGE));
  const paginatedAudit = auditLogs.slice((auditPage - 1) * ITEMS_PER_PAGE, auditPage * ITEMS_PER_PAGE);

  const [notePopup, setNotePopup] = useState<{ open: boolean; bid: string; tender: string; note: string } | null>(null);


  const handleResetFilters = () => {
    setTender("");
    setDateFrom("");
    setDateTo("");
    setBidder("Select Bidder");
    setReportStatus("Select Status");

    setAppliedTender("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setAppliedBidder("Select Bidder");
    setAppliedReportStatus("Select Status");
    setAuditLogs([]);
  };

  interface ReportTab {
    key: "opening" | "evaluation" | "audit";
    label: string;
    count?: string | number;
  }

  const tabs: ReportTab[] = [
    { key: "opening", label: "Bid Report" },
    { key: "evaluation", label: "Evaluation Report" },
    { key: "audit", label: "Audit Log" },
  ];

  if (isInitialLoading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Reports & Audit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-inter flex flex-col">
      {/* --- Breadcrumbs / Sub-Navigation --- */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500 whitespace-nowrap">
          <Link href="/officer-dashboard" className="flex items-center gap-2 hover:text-[#953002] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Officer Dashboard
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

          {/* ─── Page Header ─── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ width: 4, height: 60, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }} className="shrink-0"></div>
              <div>
                <h1 style={{
                  fontSize: "1.85rem",
                  fontWeight: 800,
                  color: "#1e293b",
                  letterSpacing: "0.01em",
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  Reports &amp; Audit
                </h1>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                  <Link href="/officer-dashboard" className="hover:text-[#953002] transition-colors">Officer Dashboard</Link>
                  <ChevronRight size={11} className="text-gray-400 shrink-0" />
                  <Link href="/reports-and-audit" className="hover:text-[#953002] transition-colors">Reports &amp; Audit</Link>
                  <ChevronRight size={11} className="text-gray-400 shrink-0" />
                  <span className="text-[#953002] shrink-0">{getTenderRef(appliedTender)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:mt-1">
              <button className="flex items-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm shadow-[#953002]/20">
                <Download size={13} />
                Export All Reports
              </button>
            </div>
          </div>

          {/* ─── Filter Bar ─── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Tender */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Tender</label>
                <CustomSelect
                  value={tender}
                  onChange={setTender}
                  options={tenderOptions}
                  placeholder="Select Tender"
                  emptyText={getEmptyTenderText()}
                />
              </div>
              {/* Date From */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Date Range - From</label>
                <CustomDatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                />
              </div>
              {/* Date To */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Date Range - To</label>
                <CustomDatePicker
                  value={dateTo}
                  onChange={setDateTo}
                />
              </div>
              {/* Tender Status */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Tender Status</label>
                <CustomSelect
                  value={reportStatus}
                  onChange={setReportStatus}
                  options={["Select Status", "All Statuses", "Pending Opening", "Open", "Evaluation", "Evaluation Completed"]}
                />
              </div>
            </div>
            {/* Second row: Bidder filter + action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Bidder (Optional)</label>
                <CustomSelect
                  value={bidder}
                  onChange={setBidder}
                  options={bidderOptions}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Filter size={12} />
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-500 text-xs font-black px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* ─── Tabs ─── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Tab headers */}
            <div className="flex w-full border-b border-gray-100 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-[15px] font-black whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.key
                      ? "border-[#953002] text-[#953002] bg-[#FFF7ED]"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                      activeTab === tab.key ? "bg-[#953002] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ─── Opening Report Tab ─── */}
            {activeTab === "opening" && (
              <div className="space-y-6">
                {/* Report card */}
                <div className="overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Received Bid Report{appliedTender ? ` - ${getTenderRef(appliedTender)}` : ""}</h3>
                      <div className="text-[13px] text-gray-400 font-semibold mt-0.5">
                        Official record of bid submissions received at close of tender.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileText size={13} />
                        PDF
                      </button>
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileSpreadsheet size={13} />
                        Excel
                      </button>
                    </div>
                  </div>



                  {/* Lock notice */}
                  <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <p className="text-[12px] font-semibold text-amber-700">
                      This report is <strong>finalized and locked</strong>. No further modifications are permitted. All data reflects the state at time of locking.
                    </p>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#953002] text-white">
                          <th className="text-center px-5 py-3 text-[12px] font-black text-white uppercase tracking-widest w-8">NO.</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Bidder Name / Company</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Bid Reference</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Submission Date &amp; Time</th>

                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Quoted Value</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Admission Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bidsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {Array.from({ length: 6 }).map((__, j) => (
                                <td key={j} className="px-3 py-4">
                                  <div className="h-3 bg-gray-100 rounded-full mx-auto" style={{ width: j === 0 ? "1.5rem" : "80%" }} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : !appliedTender ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              {appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders" 
                                ? "No tender selected. Please select a tender to view submissions for this bidder." 
                                : "No tender selected. Please select a tender to view data."}
                            </td>
                          </tr>
                        ) : isPendingOpening ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              Bid submissions hidden for this tender.
                            </td>
                          </tr>
                        ) : filteredBidRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              {appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders" 
                                ? "No submissions found for the selected bidder in this tender." 
                                : "No bid submissions logged for this tender."}
                            </td>
                          </tr>
                        ) : (
                          filteredBidRows.map((bid) => (
                            <tr key={bid.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-5 py-3.5 font-black text-gray-400 text-center">{bid.id}</td>
                              <td className="px-3 py-3.5 text-center">
                                <div className="font-black text-gray-800">{bid.bidderName}</div>
                              </td>
                              <td className="px-3 py-3.5 font-semibold text-gray-500 text-center">{bid.bidReference}</td>
                              <td className="px-3 py-3.5 font-semibold text-gray-500 text-center">
                                {bid.submissionDateTime}
                              </td>
                              <td className="px-3 py-3.5 font-semibold text-gray-700 text-center">{bid.quotedValue}</td>
                              <td className="px-3 py-3.5 text-center"><StatusBadge status={bid.admissionStatus} /></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer */}
                  <div className="px-5 py-3.5 border-t border-gray-100 bg-[#F7F8FA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      {bidsLoading ? "LOADING…" : `SHOWING ${filteredBidRows.length} OF ${filteredBidRows.length} SUBMISSIONS`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#953002] text-white font-black flex items-center justify-center text-xs shadow-sm">
                        1
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Evaluation Report Tab ─── */}
            {activeTab === "evaluation" && (
              <div className="space-y-6">
                <div className="overflow-hidden">
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Evaluation Report{appliedTender ? ` - ${getTenderRef(appliedTender)}` : ""}</h3>
                      <p className="text-[13px] text-gray-400 font-semibold mt-0.5">
                        Multi-criteria scores per evaluator assigned today, and final totals are shown here.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileText size={13} />
                        PDF
                      </button>
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileSpreadsheet size={13} />
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#953002] text-white">
                          <th className="text-center px-5 py-3 text-[12px] font-black text-white uppercase tracking-widest">Rank</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Bidder</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Technical /70</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Financial /30</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Compliance</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Composite /100</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Evaluator</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Status</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bidsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {Array.from({ length: 9 }).map((__, j) => (
                                <td key={j} className="px-3 py-4">
                                  <div className="h-3 bg-gray-100 rounded-full mx-auto" style={{ width: j === 0 ? "1.5rem" : "80%" }} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : !appliedTender ? (
                          <tr>
                            <td colSpan={9} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              {appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders" 
                                ? "No tender selected. Please select a tender to view evaluation reports for this bidder." 
                                : "No tender selected. Please select a tender to view data."}
                            </td>
                          </tr>
                        ) : filteredEvaluations.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              {appliedBidder && appliedBidder !== "Select Bidder" && appliedBidder !== "All Bidders" 
                                ? "No evaluations found for the selected bidder in this tender." 
                                : "No evaluations found for this tender."}
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            const hasAnyCompliantBid = filteredEvaluations.some((r) => r.compliancePassed);
                            return filteredEvaluations.map((row) => (
                              <tr key={row.rank} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-5 py-3.5 text-center">
                                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mx-auto ${(row.rank === 1 && hasAnyCompliantBid) ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                                    {row.rank}
                                  </span>
                                </td>
                            <td className="px-3 py-3.5 font-black text-gray-800 text-center">{row.bidder}</td>
                            <td className="px-3 py-3.5 w-40 text-center"><div className="mx-auto max-w-[150px]"><ScoreBar value={row.technicalScore} max={70} /></div></td>
                            <td className="px-3 py-3.5 w-40 text-center"><div className="mx-auto max-w-[150px]"><ScoreBar value={row.financialScore} max={30} /></div></td>
                            <td className="px-3 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border bg-[#FFF7ED] text-[#953002] border-[#953002]/20 uppercase tracking-wider`}>
                                {row.compliancePassed ? "PASSED" : "FAILED"}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 font-black text-[#953002] text-sm text-center">{row.compositeScore.toFixed(2)}</td>
                            <td className="px-3 py-3.5 font-semibold text-gray-500 text-center">{row.evaluator}</td>
                            <td className="px-3 py-3.5 text-center"><StatusBadge status={row.status} /></td>
                            <td className="px-3 py-3.5 text-center">
                              <button onClick={() => setNotePopup({ open: true, bid: row.bidder, tender: appliedTender || "TND-2024-0041", note: row.notes || "No notes available." })}>
                                <FileText size={18} className="text-gray-400 hover:text-[#953002] cursor-pointer mx-auto transition-colors" />
                              </button>
                            </td>
                          </tr>
                            ));
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3.5 border-t border-gray-100 bg-[#F7F8FA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      {bidsLoading ? "LOADING…" : `SHOWING ${filteredEvaluations.length} OF ${filteredEvaluations.length} EVALUATED BIDS`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#953002] text-white font-black flex items-center justify-center text-xs shadow-sm">
                        1
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* ─── Audit Log Tab ─── */}
            {activeTab === "audit" && (
              <div className="space-y-4">
                <div className="overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Audit Log{appliedTender ? ` - ${getTenderRef(appliedTender)}` : ""}</h3>
                      <p className="text-[13px] text-gray-400 font-semibold mt-0.5">
                        System-generated append-only log. Entries cannot be edited or deleted.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileText size={13} />
                        PDF
                      </button>
                      <button className="flex items-center justify-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-[12px] font-black w-20 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                        <FileSpreadsheet size={13} />
                        Excel
                      </button>
                    </div>
                  </div>

                  {/* Append-only notice */}
                  <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                    <Info size={15} className="text-amber-600 shrink-0" />
                    <p className="text-[12px] font-semibold text-amber-700">
                      Audit entries are <strong>automatically generated</strong> by the system. No user can edit, amend or delete log entries. This log forms part of the official tender record.
                    </p>
                  </div>

                  {/* Audit table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#953002] text-white">
                          <th className="text-center px-5 py-3 text-[12px] font-black text-white uppercase tracking-widest w-8">NO.</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Tender / Bid Ref</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Timestamp</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">User</th>
                          <th className="text-center px-3 py-3 text-[12px] font-black text-white uppercase tracking-widest">Action</th>

                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {auditLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {Array.from({ length: 5 }).map((__, j) => (
                                <td key={j} className="px-3 py-4">
                                  <div className="h-3 bg-gray-100 rounded-full mx-auto" style={{ width: j === 0 ? "1.5rem" : "80%" }} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : !appliedTender ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              No tender selected. Please select a tender to view data.
                            </td>
                          </tr>
                        ) : paginatedAudit.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-10 text-center text-[14px] font-semibold text-gray-400">
                              No audit logs available for this tender.
                            </td>
                          </tr>
                        ) : (
                          paginatedAudit.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors align-top">
                              <td className="px-5 py-4 font-black text-gray-500 text-xs text-center">{String(entry.id).padStart(3, "0")}</td>
                              <td className="px-3 py-4 font-semibold text-gray-500 whitespace-nowrap text-center">{entry.tenderRef}</td>
                              <td className="px-3 py-4 text-gray-500 font-semibold whitespace-nowrap text-center">{entry.timestamp}</td>
                              <td className="px-3 py-4 text-center">
                                <div className="font-black text-gray-800">{entry.user}</div>
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{entry.userRole}</div>
                              </td>
                              <td className="px-3 py-4 font-black text-gray-800 whitespace-nowrap text-center">{entry.action}</td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Audit footer */}
                  <div className="px-5 py-3.5 border-t border-gray-100 bg-[#F7F8FA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      SHOWING {paginatedAudit.length} OF {auditLogs.length} ENTRIES
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#953002] text-white font-black flex items-center justify-center text-xs shadow-sm">
                        1
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-300 cursor-not-allowed" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer note ─── */}
          <div className="flex items-center gap-2 text-[12px] text-gray-400 font-semibold pb-4">
            <Shield size={14} className="text-gray-300" />
            All reports are read-only, append-only, and comply with Sri Lanka procurement audit standards.
          </div>

        </div>
      </main>
      <Footer />




      {/* ─── Notes Popup ─── */}
      {notePopup?.open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNotePopup(null)}
        >
          <div
            className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-visible relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="py-3 px-5 border-b border-gray-50 bg-[#F9FAFB] flex justify-between items-center rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#953002]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Evaluation Notes</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{notePopup.bid}</p>
                </div>
              </div>
              <button
                onClick={() => setNotePopup(null)}
                className="p-1.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Tender Reference</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#953002]">
                  {notePopup.tender.split(" - ")[0]}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Evaluation Note</label>
                <div className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 leading-relaxed min-h-[70px] whitespace-pre-wrap">
                  {notePopup.note || "No evaluation notes provided."}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setNotePopup(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ReportsAndAuditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Loading Reports & Audit...</div>}>
      <ReportsAndAuditContent />
    </Suspense>
  );
}
