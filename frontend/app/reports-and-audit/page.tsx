"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

import Footer from "@/components/home/Footer";

// ─────────────────────────── Types ───────────────────────────
type ReportStatus = "Finalized" | "In Progress" | "Pending";
type EnvelopeStatus = "Opened" | "Not Opened";
type CompletionStatus = "Complete" | "Minor Gap" | "Incomplete" | "N/A";
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

// ─────────────────────────── Mock Data ───────────────────────────
const MOCK_BIDS: BidRow[] = [
  {
    id: 1,
    bidderName: "Apex Technologies Ltd.",
    bidReference: "BID-0041-001",
    submissionDateTime: "15 Mar 2024 · On time",
    envelopeStatus: "Opened",
    quotedValue: "LKR 4,850,000",
    completeness: "Complete",
    admissionStatus: "Admitted",
    notes: "All documents present",
    isLate: false,
  },
  {
    id: 2,
    bidderName: "Digital Dynamics (Pvt) Ltd.",
    bidReference: "BID-0041-002",
    submissionDateTime: "15 Mar 2024 · On time",
    envelopeStatus: "Opened",
    quotedValue: "LKR 5,120,000",
    completeness: "Minor Gap",
    admissionStatus: "Admitted",
    notes: "Missing warranty doc",
    isLate: false,
  },
  {
    id: 3,
    bidderName: "SynergyNet Solutions",
    bidReference: "BID-0041-003",
    submissionDateTime: "15 Mar 2024 · On time",
    envelopeStatus: "Opened",
    quotedValue: "LKR 4,630,000",
    completeness: "Incomplete",
    admissionStatus: "Rejected",
    notes: "No financial statement",
    isLate: false,
  },
  {
    id: 4,
    bidderName: "ProTech Innovations",
    bidReference: "BID-0041-004",
    submissionDateTime: "16 Mar 2024 · Late",
    envelopeStatus: "Not Opened",
    quotedValue: "—",
    completeness: "N/A",
    admissionStatus: "Rejected",
    notes: "Late submission",
    isLate: true,
  },
];

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
  {
    id: 4,
    timestamp: "30 Mar 2024 · 11:45 AM",
    user: "Jane Doe",
    userRole: "Chairperson",
    action: "Decision Locked",
    tenderRef: "TND-2024-0041",
    details: "LOCK EVENT: Final decision locked by Chairperson Jane Doe. All evaluation edits disabled system-wide for TND-2024-0041. Outcome: Awarded to BID-0041-001.",
    ipSession: "Cell Text",
    type: "Lock",
  },
  {
    id: 5,
    timestamp: "30 Mar 2024 · 11:46 AM",
    user: "System",
    userRole: "System",
    action: "Report Generated",
    tenderRef: "TND-2024-0041",
    details: "Automated report generation triggered post-lock. PDF and Excel exports created for all four report sections.",
    ipSession: "—",
    type: "System",
  },
];

// ─────────────────────────── Sub-components ───────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Admitted: "bg-green-50 text-green-700 border border-green-200",
    Rejected: "bg-red-50 text-red-600 border border-red-200",
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Winner: "bg-amber-50 text-amber-700 border border-amber-200",
    Reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
    Complete: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Minor Gap": "bg-orange-50 text-orange-700 border border-orange-200",
    Incomplete: "bg-red-50 text-red-600 border border-red-200",
    "N/A": "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${styles[status] || "bg-gray-100 text-gray-500 border border-gray-200"}`}>
      {status}
    </span>
  );
}

function EnvelopeBadge({ status }: { status: EnvelopeStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${status === "Opened" ? "bg-[#FFF7ED] text-[#953002] border border-[#953002]/20" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${styles[type]}`}>
      {type}
    </span>
  );
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black text-gray-800 w-8">{value.toFixed(1)}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#953002] to-[#c94a0a] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

function CustomSelect({ value, onChange, options }: CustomSelectProps) {
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
        <span className="truncate mr-2">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-1.5 max-h-60 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => {
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
          })}
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
                      ? "border border-[#FFB401] text-[#953002] font-bold hover:bg-[#953002]/5"
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
export default function ReportsAndAuditPage() {
  const [activeTab, setActiveTab] = useState<"opening" | "evaluation" | "consensus" | "audit">("opening");
  const [tender, setTender] = useState("TND-2024-0041 - Supply & Delivery of IT Equipment Package");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [bidder, setBidder] = useState("All Bidders");
  const [reportStatus, setReportStatus] = useState("All Statuses");
  const [auditPage, setAuditPage] = useState(1);

  const handleResetFilters = () => {
    setTender("TND-2024-0041 - Supply & Delivery of IT Equipment Package");
    setDateFrom("");
    setDateTo("");
    setBidder("All Bidders");
    setReportStatus("All Statuses");
  };

  const tabs = [
    { key: "opening", label: "Opening Report", icon: <Package size={13} />, count: "live" },
    { key: "evaluation", label: "Evaluation Report", icon: <BarChart3 size={13} />, count: 4 },
    { key: "consensus", label: "Consensus Sheet", icon: <ClipboardList size={13} />, count: "3/3kits" },
    { key: "audit", label: "Audit Log", icon: <Activity size={13} />, count: 12 },
  ] as const;

  return (
    <div className="bg-[#F7F8FA] min-h-screen text-gray-900 font-inter flex flex-col">

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
                  <Link href="http://localhost:3000/officer-dashboard" className="hover:text-[#953002] transition-colors">Officer Dashboard</Link>
                  <ChevronRight size={11} className="text-gray-400 shrink-0" />
                  <Link href="/reports-and-audit" className="hover:text-[#953002] transition-colors">Reports &amp; Audit</Link>
                  <ChevronRight size={11} className="text-gray-400 shrink-0" />
                  <span className="text-[#953002] shrink-0">TND-2024-0041</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:mt-1">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                <Lock size={11} />
                Read-Only Mode
              </div>
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
                  options={[
                    "TND-2024-0041 - Supply & Delivery of IT Equipment Package",
                    "TND-2024-0042 - Road Construction Phase II"
                  ]}
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
              {/* Report Status */}
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Report Status</label>
                <CustomSelect
                  value={reportStatus}
                  onChange={setReportStatus}
                  options={["All Statuses", "Finalized", "In Progress", "Pending"]}
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
                  options={[
                    "All Bidders",
                    "Apex Technologies Ltd.",
                    "Digital Dynamics (Pvt) Ltd.",
                    "SynergyNet Solutions"
                  ]}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="flex items-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
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
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-[13px] font-black whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.key
                      ? "border-[#953002] text-[#953002] bg-[#FFF7ED]/40"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.key ? "bg-[#953002] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ─── Opening Report Tab ─── */}
            {activeTab === "opening" && (
              <div className="p-6 space-y-6">
                {/* KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { value: "6", label: "Bids Received", sub: "Before deadline", color: "text-gray-900" },
                    { value: "1", label: "Late Submissions", sub: "Excluded from evaluation", color: "text-gray-900" },
                    { value: "5", label: "Envelopes Opened", sub: "Session date: Cell Text", color: "text-gray-900" },
                    { value: "2", label: "Committee Members Present", sub: "Quorum met", color: "text-gray-900" },
                    { value: "Locked", label: "Report Status", sub: "Finalized: Cell Text / Date", color: "text-gray-900", isLock: true },
                  ].map((kpi, i) => (
                    <div key={i} className={`bg-[#F7F8FA] border border-gray-100 rounded-2xl p-4 ${i === 4 ? "col-span-1" : ""}`}>
                      <div className={`${kpi.value === "Locked" ? "text-lg" : "text-2xl"} font-black ${kpi.color} flex items-center gap-2`}>
                        {kpi.isLock && <Lock size={14} className="text-gray-500" />}
                        {kpi.value}
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{kpi.label}</div>
                      <div className="text-[12px] font-semibold text-gray-400 mt-0.5">{kpi.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Report card */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Bid Opening Session Report - TND-2024-0041</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Official record of bid submissions received at close of tender. Read only.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-[#953002] bg-[#FFF7ED] border border-[#953002]/20 px-2.5 py-1.5 rounded-lg">
                        <Lock size={10} />
                        Finalized &amp; Locked
                      </span>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileText size={11} />
                        PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileSpreadsheet size={11} />
                        Excel
                      </button>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="px-5 py-3 bg-white border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    {[
                      { label: "Tender No.", value: "TND-2024-0041" },
                      { label: "Title & Date & Time", value: "Cell Text" },
                      { label: "Presiding Officer", value: "Jane Doe" },
                      { label: "Committee Members", value: "John Smith, Mary Jones" },
                      { label: "Notes Generated", value: "Cell Text / Date" },
                    ].map((item, i) => (
                      <div key={i}>
                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                        <span className="font-semibold text-gray-700">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Lock notice */}
                  <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-amber-700">
                      This report is <strong>finalized and locked</strong>. No further modifications are permitted. All data reflects the state at time of locking.
                    </p>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-[#F7F8FA]">
                          <th className="text-left px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest w-8">#</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Bidder Name / Company</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Bid Reference</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Submission Date &amp; Time</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Envelope Status</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quoted Value</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Completeness</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Admission Status</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {MOCK_BIDS.map((bid) => (
                          <tr key={bid.id} className={`hover:bg-gray-50/60 transition-colors ${bid.isLate ? "bg-red-50/30" : ""}`}>
                            <td className="px-5 py-3.5 font-black text-gray-400">{bid.id}</td>
                            <td className="px-3 py-3.5">
                              <div className="font-black text-gray-800">{bid.bidderName}</div>
                              {bid.isLate && <div className="text-[9px] text-red-500 font-black uppercase tracking-wider mt-0.5">Late Submission</div>}
                            </td>
                            <td className="px-3 py-3.5 font-semibold text-gray-500">{bid.bidReference}</td>
                            <td className="px-3 py-3.5 font-semibold text-gray-500">
                              <span className={bid.isLate ? "text-red-500 font-black" : ""}>{bid.submissionDateTime}</span>
                            </td>
                            <td className="px-3 py-3.5"><EnvelopeBadge status={bid.envelopeStatus} /></td>
                            <td className="px-3 py-3.5 font-semibold text-gray-700">{bid.quotedValue}</td>
                            <td className="px-3 py-3.5"><StatusBadge status={bid.completeness} /></td>
                            <td className="px-3 py-3.5"><StatusBadge status={bid.admissionStatus} /></td>
                            <td className="px-3 py-3.5">
                              <button className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-[#953002] border border-gray-200 hover:border-[#953002]/30 px-2.5 py-1 rounded-lg transition-all">
                                <Eye size={10} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer */}
                  <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F7F8FA]">
                    <span className="text-[10px] font-semibold text-gray-400">Showing 4 of 5 submissions - 3 admitted · 1 rejected</span>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3.5 py-2 rounded-xl transition-all">
                        <Download size={11} />
                        Download PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3.5 py-2 rounded-xl transition-all">
                        <FileSpreadsheet size={11} />
                        Download Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Evaluation Report Tab ─── */}
            {activeTab === "evaluation" && (
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Evaluation Report - TND-2024-0041 <span className="text-gray-400 font-semibold text-xs">· All Evaluator Names</span></h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Multi-criteria scores per evaluator assigned today, and final totals are shown here.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileText size={11} />
                        PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileSpreadsheet size={11} />
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-[#F7F8FA]">
                          <th className="text-left px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Bidder</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Technical /70</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Financial /30</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Compliance Passed</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Composite /100</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Evaluator</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {MOCK_EVALUATIONS.map((row) => (
                          <tr key={row.rank} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${row.rank === 1 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                                {row.rank}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 font-black text-gray-800">{row.bidder}</td>
                            <td className="px-3 py-3.5 w-40"><ScoreBar value={row.technicalScore} max={70} /></td>
                            <td className="px-3 py-3.5 w-40"><ScoreBar value={row.financialScore} max={30} /></td>
                            <td className="px-3 py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border ${row.compliancePassed ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                {row.compliancePassed ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                Passed
                              </span>
                            </td>
                            <td className="px-3 py-3.5 font-black text-[#953002] text-sm">{row.compositeScore.toFixed(1)}</td>
                            <td className="px-3 py-3.5 font-semibold text-gray-500">{row.evaluator}</td>
                            <td className="px-3 py-3.5"><StatusBadge status={row.status} /></td>
                            <td className="px-3 py-3.5">
                              <button className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-[#953002] border border-gray-200 hover:border-[#953002]/30 px-2.5 py-1 rounded-lg transition-all">
                                <Eye size={10} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 bg-[#F7F8FA]">
                    <span className="text-[10px] font-semibold text-gray-400">
                      3 of 3 evaluated bids shown - <button className="underline hover:text-[#953002]">Select tab to view full report</button>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Consensus Sheet Tab ─── */}
            {activeTab === "consensus" && (
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Consensus / Moderation Sheet - TND-2024-0041 <span className="text-gray-400 font-semibold text-xs">· See Consensus Sheet</span></h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Per-criteria scores from all evaluations with variance detection and moderated average.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileText size={11} />
                        PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileSpreadsheet size={11} />
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-[#F7F8FA]">
                          <th className="text-left px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Criteria (BID-001-0041)</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Weight</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Evaluator 1 Score</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Evaluator 2 Score</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Variance</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Weighted Avg.</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Weighted Score</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {MOCK_CONSENSUS.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-black text-gray-800">{row.criteria}</td>
                            <td className="px-3 py-3.5 font-semibold text-gray-500">{row.weight}</td>
                            <td className="px-3 py-3.5 font-black text-gray-800">{row.evaluator1Score}</td>
                            <td className="px-3 py-3.5 font-black text-gray-800">{row.evaluator2Score}</td>
                            <td className="px-3 py-3.5">
                              <span className={`text-xs font-black ${row.varianceType === "negative" ? "text-orange-600" : row.varianceType === "positive" ? "text-green-600" : "text-gray-500"}`}>
                                {row.variance}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 font-black text-gray-800">{row.weightedAvg.toFixed(1)}</td>
                            <td className="px-3 py-3.5 font-black text-[#953002]">{row.weightedScore.toFixed(2)}</td>
                            <td className="px-3 py-3.5">
                              {row.note ? (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                                  {row.note}
                                </span>
                              ) : (
                                <button className="text-[10px] font-black text-gray-300 hover:text-gray-500 transition-colors">Select Consensus</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 bg-[#F7F8FA]">
                    <span className="text-[10px] font-semibold text-gray-400">
                      3 of 3 criteria shown - <button className="underline hover:text-[#953002]">Click to view full consensus sheet</button>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Audit Log Tab ─── */}
            {activeTab === "audit" && (
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#F7F8FA] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-base font-black text-gray-800">Audit Log - TND-2024-0041</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        System-generated append-only log. Entries cannot be edited or deleted.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-[#953002] bg-[#FFF7ED] border border-[#953002]/20 px-2.5 py-1.5 rounded-lg">
                        🔒 Append Only
                      </span>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileText size={11} />
                        PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">
                        <FileSpreadsheet size={11} />
                        Excel
                      </button>
                    </div>
                  </div>

                  {/* Append-only notice */}
                  <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                    <Info size={13} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] font-semibold text-blue-700">
                      Audit entries are <strong>automatically generated</strong> by the system. No user can edit, amend or delete log entries. This log forms part of the official tender record.
                    </p>
                  </div>

                  {/* Audit table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-[#F7F8FA]">
                          <th className="text-left px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest w-8">#</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">User</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Tender / Bid Ref</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">IP / Session</th>
                          <th className="text-left px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {MOCK_AUDIT.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors align-top">
                            <td className="px-5 py-4 font-black text-gray-300 text-[10px]">{String(entry.id).padStart(3, "0")}</td>
                            <td className="px-3 py-4 text-gray-500 font-semibold whitespace-nowrap">{entry.timestamp}</td>
                            <td className="px-3 py-4">
                              <div className="font-black text-gray-800">{entry.user}</div>
                              <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{entry.userRole}</div>
                            </td>
                            <td className="px-3 py-4 font-black text-gray-800 whitespace-nowrap">{entry.action}</td>
                            <td className="px-3 py-4 font-semibold text-gray-500 whitespace-nowrap">{entry.tenderRef}</td>
                            <td className="px-3 py-4 text-gray-600 font-semibold max-w-xs leading-relaxed">{entry.details}</td>
                            <td className="px-3 py-4 font-semibold text-gray-400">{entry.ipSession}</td>
                            <td className="px-3 py-4"><AuditTypeBadge type={entry.type} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Audit footer */}
                  <div className="px-5 py-3.5 border-t border-gray-100 bg-[#F7F8FA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[10px] font-semibold text-gray-400">
                      Showing 12 of 12 entries - Append-only - no deletions possible
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Pagination */}
                      <div className="flex items-center gap-1">
                        {[1, 2].map((p) => (
                          <button
                            key={p}
                            onClick={() => setAuditPage(p)}
                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                              auditPage === p
                                ? "bg-[#953002] text-white"
                                : "bg-white border border-gray-200 text-gray-500 hover:border-[#953002]/30"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <span className="text-gray-300 text-[10px] font-black px-1">…</span>
                      </div>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3.5 py-2 rounded-xl transition-all">
                        <Download size={11} />
                        Download Log
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#953002] text-gray-600 hover:text-[#953002] text-[10px] font-black px-3.5 py-2 rounded-xl transition-all">
                        <FileSpreadsheet size={11} />
                        Download Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer note ─── */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold pb-4">
            <Shield size={12} className="text-gray-300" />
            All reports are read-only, append-only, and comply with Sri Lanka procurement audit standards. Unauthorized modification attempts are logged.
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
