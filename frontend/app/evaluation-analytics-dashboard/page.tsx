"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  RotateCcw,
  ChevronDown,
  Check,
  X,
  Loader2,
  Award,
  Gauge,
  Eye,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  fetchEvalAnalytics,
  type EvalAnalyticsData,
  type EvalAnalyticsFilters,
} from "@/lib/api/evaluation-analytics.api";
// Custom star-with-pencil icon for Avg Technical Score
const StarPenIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l3.09 6.26 6.91 1.01-4 3.9 1 5.83-5-2.63-5 2.63 1-5.83-4-3.9 6.91-1.01z" />
    <path d="M21 13l-8 8H9v-4l8-8 4 4z" />
    <path d="M16 7l4 4" />
  </svg>
);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  defaultValue?: string;
}

function CustomSelect({ value, onChange, options, placeholder, emptyText, defaultValue }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative text-left w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#953002]/40 transition-colors flex items-center justify-between text-left h-[42px]"
      >
        <span className={`truncate mr-2 ${((!value && !defaultValue) || String(value || defaultValue).startsWith("Select")) ? 'text-gray-400 font-medium' : 'text-gray-700 font-semibold'}`}>
          {value || defaultValue || placeholder || "Select"}
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
                const isSelected = value === opt || (!value && defaultValue === opt);
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

// ── CountUp Helper Component ───────────────────────────────
function CountUp({ end, decimals = 0, duration = 1200 }: { end: number; decimals?: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count.toFixed(decimals)}</>;
}

// ── Status badge helper ──────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Live:      { bg: "#DCFCE7", color: "#15803D" },
  Awarded:   { bg: "#FEF9C3", color: "#A16207" },
  Closed:    { bg: "#F3F4F6", color: "#6B7280" },
  Cancelled: { bg: "#FEE2E2", color: "#DC2626" },
};

// ── Format Procurement Type Helper ──────────────────────────
function formatProcurementType(val: string) {
  if (!val) return "";
  const lower = val.toLowerCase().replace(/_/g, " ");
  return lower.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ── Animate On Scroll Wrapper ───────────────────────────────
function AnimateOnScroll({ children, height = 220 }: { children: React.ReactNode; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setVisible(true);
          }, 150);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: height, position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {visible ? children : <div style={{ height }} />}
    </div>
  );
}

// ── Gauge chart component ────────────────────────────────────
function GaugeChart({ value, max = 100, threshold = 60 }: { value: number; max?: number; threshold?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasIntersected) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 1000, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimatedValue(easeProgress * value);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, hasIntersected]);

  const pct = Math.min(animatedValue / max, 1);
  const pctStr = `${(pct * 100).toFixed(0)}%`;

  // SVG arc params
  const cx = 90, cy = 90, r = 75;
  const startAngle = Math.PI;
  const totalAngle = Math.PI;
  const endAngle = startAngle + totalAngle * pct;

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
      <svg viewBox="0 0 180 110" style={{ width: "100%", height: "auto", maxWidth: 200 }}>
        {/* Track */}
        <path d={bgPath} fill="none" stroke="#E5E7EB" strokeWidth={14} strokeLinecap="round" />
        {/* Value arc */}
        <path d={arcPath} fill="none" stroke="#953002" strokeWidth={14} strokeLinecap="round" />
        {/* Value label */}
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={26} fontWeight={800} fill="#1F2937">{pctStr}</text>
      </svg>
      <p style={{ fontSize: "0.85rem", color: "#9CA3AF", textAlign: "center", lineHeight: "1.85", marginTop: "0.85rem" }}>
        Score range: 0 – {max} pts
        <br />
        Threshold: {threshold}
      </p>
    </div>
  );
}

// ── Category score bar ───────────────────────────────────────
function CategoryScoreBar({ category, score, max = 100 }: { category: string; score: number; max?: number }) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth((score / max) * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [score, max]);

  return (
    <div ref={containerRef} style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{formatProcurementType(category)}</span>
        <span style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: 600 }}>{score}</span>
      </div>
      <div style={{ height: 8, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: "linear-gradient(90deg, #953002, #C45A2B)",
            borderRadius: 4,
            transition: "width 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ── Table Pass Rate Bar component ────────────────────────────
function TablePassRateBar({ passRate }: { passRate: number }) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setWidth(passRate);
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [passRate]);

  return (
    <div ref={containerRef} className="eval-table__pass-rate">
      <div className="eval-table__pass-rate-bar">
        <div
          className="eval-table__pass-rate-fill"
          style={{
            width: `${width}%`,
            transition: "width 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
      <span className="eval-table__pass-rate-pct">{passRate}%</span>
    </div>
  );
}

// ── Pass rate donut center label plugin ──────────────────────
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart: any) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const data = chart.data.datasets[0].data as number[];
    const passedVal = data[0];
    const total = data.reduce((a: number, b: number) => a + b, 0);

    const isPlaceholder = chart.data.datasets[0].backgroundColor[0] === "#E5E7EB" && passedVal === 0;
    const pct = (!isPlaceholder && total > 0) ? Math.round((passedVal / total) * 100) : 0;

    ctx.save();
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillStyle = "#1F2937";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${pct}%`, cx, cy - 8);
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText("Pass Rate", cx, cy + 14);
    ctx.restore();
  },
};


// ── Main page ─────────────────────────────────────────────────
const DATE_RANGE_MAP: Record<string, string> = {
  "last_7_days": "Last 7 days",
  "last_30_days": "Last 30 days",
  "last_3_months": "Last 3 months",
  "last_6_months": "Last 6 months",
  "last_year": "Last Year",
  "all_time": "All Time",
};
const REVERSE_DATE_RANGE_MAP: Record<string, string> = {
  "Last 7 days": "last_7_days",
  "Last 30 days": "last_30_days",
  "Last 3 months": "last_3_months",
  "Last 6 months": "last_6_months",
  "Last Year": "last_year",
  "All Time": "all_time",
};

export default function EvaluationAnalyticsDashboard() {
  const [data, setData] = useState<EvalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const PAGE_SIZE = 10;

  // Toast Notifications
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filters
  const [dateRange, setDateRange] = useState("");
  const [category, setCategory] = useState("");
  const [tenderId, setTenderId] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<EvalAnalyticsFilters>({
    dateRange: "",
  });

  const loadData = useCallback(async (filters: EvalAnalyticsFilters) => {
    setLoading(true);
    try {
      const result = await fetchEvalAnalytics(filters);
      setData(result);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(appliedFilters);
  }, [loadData, appliedFilters]);

  useEffect(() => {
    if (!initialLoading) {
      window.scrollTo(0, 0);
    }
  }, [initialLoading]);

  // Chart data
  const bidderTrendData: any = useMemo(
    () => ({
      labels: data?.bidderCountTrend.map((d) => d.label) ?? [],
      datasets: [
        {
          label: "Avg. Bidders",
          data: data?.bidderCountTrend.map((d) => d.value) ?? [],
          borderColor: "#953002",
          borderWidth: 2,
          backgroundColor: "rgba(149, 48, 2, 0.12)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#953002",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          clip: false,
        },
      ],
    }),
    [data]
  );

  const maxCountIndex = useMemo(() => {
    if (!data?.scoreDistribution || data.scoreDistribution.length === 0) return -1;

    const counts = data.scoreDistribution.map((d) => d.count);
    const maxVal = Math.max(...counts);

    if (maxVal === 0) return -1;

    const maxMatches = counts.reduce<number[]>((acc, val, idx) => {
      if (val === maxVal) acc.push(idx);
      return acc;
    }, []);

    return maxMatches.length === 1 ? maxMatches[0] : -1;
  }, [data]);

  const scoreDistData = useMemo(
    () => ({
      labels: data?.scoreDistribution.map((d) => d.range) ?? [],
      datasets: [
        {
          label: "Bids",
          data: data?.scoreDistribution.map((d) => d.count) ?? [],
          backgroundColor: data?.scoreDistribution.map((d, i) =>
            i === maxCountIndex ? "#953002" : "rgba(149, 48, 2, 0.25)"
          ) ?? [],
          borderRadius: 6,
          borderSkipped: false,
          minBarLength: 4,
        },
      ],
    }),
    [data, maxCountIndex]
  );

  const passed = data?.passRatePassed ?? 0;
  const failed = data?.passRateFailed ?? 0;
  const totalBids = passed + failed;
  const isEmpty = totalBids === 0;

  const passRateData = useMemo(() => {
    return {
      labels: [`  Passed (${passed})`, `  Failed (${failed})`],
      datasets: [
        {
          data: isEmpty ? [0, 1] : [passed, failed],
          backgroundColor: isEmpty ? ["#E5E7EB", "#E5E7EB"] : ["#953002", "#E5E7EB"],
          borderWidth: 0,
          hoverOffset: 0,
        },
      ],
    };
  }, [passed, failed, isEmpty]);

  const lineChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: "easeOutQuart" as const,
      },
      animations: {
        y: {
          duration: 1500,
          easing: "easeOutQuart" as const,
        },
      },
      plugins: { legend: { display: false } },
      layout: {
        padding: {
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: "Inter" }, color: "#9CA3AF" },
        },
        y: {
          grid: { color: "#F3F4F6" },
          ticks: { font: { size: 11, family: "Inter" }, color: "#9CA3AF", precision: 0 },
          min: 0,
          suggestedMax: 20,
        },
      },
    }),
    []
  );

  const barChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: "easeOutQuart" as const,
      },
      animations: {
        y: {
          from: (ctx: any) => ctx.chart.scales.y.getPixelForValue(0),
          duration: 1500,
          easing: "easeOutQuart" as const,
        },
        height: {
          from: 0,
          duration: 1500,
          easing: "easeOutQuart" as const,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${ctx.parsed.y} bids`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: "Inter" }, color: "#9CA3AF" },
        },
        y: {
          grid: { color: "#F3F4F6" },
          ticks: { font: { size: 11, family: "Inter" }, color: "#9CA3AF", precision: 0 },
          min: 0,
          suggestedMax: 5,
        },
      },
    }),
    []
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: "easeOutQuart" as const,
      },
      cutout: "72%",
      layout: {
        padding: {
          top: 0,
          bottom: 5,
          left: 10,
          right: 10,
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            font: { size: 13, family: "Inter" },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
          },
        },
        tooltip: {
          enabled: !isEmpty,
          displayColors: false,
          callbacks: {
            label: () => "",
          },
        },
      },
    }),
    [isEmpty]
  );

  if (initialLoading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter" style={{ minHeight: "100vh" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Evaluation Analytics Dashboard...</span>
        </div>
      </div>
    );
  }

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({ dateRange, category, tenderId });
  };

  const handleResetFilters = () => {
    setDateRange("");
    setCategory("");
    setTenderId("");
    setPage(1);
    setAppliedFilters({ dateRange: "", category: "", tenderId: "" });
  };

  const handleExportPdf = () => {
    if (loading || initialLoading || !data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── Watermark Function ───────────────────────────────────
    const drawWatermark = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(235, 230, 228);
      
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
    };

    drawWatermark();

    // ── 1. Header Section ────────────────────────────────────
    try {
      doc.addImage("/logo.png", "PNG", 14, 8, 41.2, 18);
    } catch (e) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(149, 48, 2); // #953002
      doc.text("TENDEREASE.LK", 14, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("SRI LANKA PUBLIC PROCUREMENT PLATFORM", 14, 25);
    }

    // Document Title (Right Aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text("EVALUATION & ANALYTICS REPORT", pageWidth - 14, 18, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const currentDate = `${dateStr} at ${timeStr}`;
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 24, { align: "right" });

    // Decorative Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    // ── 2. Active Filter Criteria Box ───────────────────────
    let currentY = 36;
    doc.setFillColor(247, 248, 250);
    doc.rect(14, currentY, pageWidth - 28, 24, "F");
    doc.setDrawColor(230, 230, 230);
    doc.rect(14, currentY, pageWidth - 28, 24, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(149, 48, 2);
    doc.text("APPLIED REPORT FILTERS", 18, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);

    const activeDateRange = DATE_RANGE_MAP[appliedFilters.dateRange] || "All Time";
    const activeCategory = appliedFilters.category ? formatProcurementType(appliedFilters.category) : "All Procurement Types";
    const activeTenderId = appliedFilters.tenderId || "All Tenders";
    const totalMatching = data.tenderSummary.length;

    doc.text(`• Date Range: `, 18, currentY + 13);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeDateRange}`, 42, currentY + 13);

    doc.setFont("helvetica", "normal");
    doc.text(`• Procurement Type: `, 85, currentY + 13);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeCategory}`, 117, currentY + 13);

    doc.setFont("helvetica", "normal");
    doc.text(`• Search Query: `, 18, currentY + 19);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeTenderId}`, 42, currentY + 19);

    doc.setFont("helvetica", "normal");
    doc.text(`• Matching Tenders: `, 85, currentY + 19);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalMatching} tenders`, 117, currentY + 19);

    currentY += 30;

    // ── 3. KPI Metrics Summary Table ──────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("KEY PERFORMANCE INDICATORS (KPIs)", 14, currentY);

    currentY += 4;

    const kpiHead = [["Avg. Technical Score", "Overall Pass Rate", "Total Bids Evaluated", "Tenders (>= 5 Bidders)"]];
    const kpiBody = [[
      `${data.kpi.avgTechnicalScore.toFixed(1)} pts`,
      `${data.kpi.overallPassRate}%`,
      `${data.kpi.totalBidsEvaluated}`,
      `${data.kpi.tendersWithHighBidders} of ${data.kpi.totalTenders}`,
    ]];

    autoTable(doc, {
      head: kpiHead,
      body: kpiBody,
      startY: currentY,
      theme: "plain",
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [107, 114, 128],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        fontStyle: "bold",
        textColor: [149, 48, 2],
        halign: "center",
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY + 20;
    currentY += 10;

    // ── 4. Procurement Type Averages Table ───────────────────
    if (data.categoryScores && data.categoryScores.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text("AVERAGE SCORE BY PROCUREMENT TYPE", 14, currentY);

      currentY += 4;

      const catHead = [["Procurement Type", "Average Technical Score"]];
      const catBody = data.categoryScores.map((cs) => [
        formatProcurementType(cs.category),
        `${cs.avgScore} pts`,
      ]);

      autoTable(doc, {
        head: catHead,
        body: catBody,
        startY: currentY,
        theme: "striped",
        headStyles: {
          fillColor: [149, 48, 2],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
          halign: "left",
        },
        bodyStyles: {
          fontSize: 8,
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable?.finalY || currentY + 30;
      currentY += 10;
    }

    // Check page space before Tender Evaluation Summary
    if (currentY + 40 > pageHeight) {
      doc.addPage();
      drawWatermark();
      currentY = 20;
    }

    // ── 5. Tender Evaluation Summary Table ────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("TENDER EVALUATION SUMMARY", 14, currentY);

    currentY += 4;

    const summaryHeaders = ["Tender ID", "Tender Title", "Procurement Type", "Department", "Bids", "Avg Score", "Pass Rate", "Status"];
    const summaryRows = data.tenderSummary.map((row) => [
      row.tenderId,
      row.tenderTitle,
      formatProcurementType(row.category),
      row.department,
      String(row.bidCount),
      row.status === "Live" ? "Pending" : `${row.avgScore.toFixed(1)}`,
      row.status === "Live" ? "Pending" : `${row.passRate}%`,
      row.status,
    ]);

    autoTable(doc, {
      head: [summaryHeaders],
      body: summaryRows,
      startY: currentY,
      theme: "striped",
      headStyles: {
        fillColor: [149, 48, 2],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { top: 20, left: 14, right: 14 },
      willDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawWatermark();
        }
      },
    });

    let finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;
    if (finalY + 35 > pageHeight) {
      doc.addPage();
      drawWatermark();
      finalY = 25;
    } else {
      finalY += 15;
    }

    // ── 6. Sign-off / Approval Block ─────────────────────────
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, 70, finalY);
    doc.line(pageWidth - 70, finalY, pageWidth - 14, finalY);

    const todayDateStr = new Date().toLocaleDateString("en-GB");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text("Generated By Signature", 14, finalY + 5);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${todayDateStr}`, 14, finalY + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Authorized Verification", pageWidth - 70, finalY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("TenderEase Security Seal Verified", pageWidth - 70, finalY + 10);

    // ── 7. Page Footer (Page Numbers) ────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}  •  Confidential Procurement Analytics Tenderease.lk © 2026. All Rights reserved.`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }

    // ── 8. Save PDF ──────────────────────────────────────────
    const sanitizedDate = activeDateRange.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedCat = activeCategory.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `Evaluation_Analytics_Report_${sanitizedDate}_${sanitizedCat}.pdf`;

    doc.save(fileName);
    showToast("Evaluation Analytics Report (PDF) downloaded successfully!", "success");
  };

  // Paginated summary
  const allRows = data?.tenderSummary ?? [];
  const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
  const visibleRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="eval-analytics-page" style={{ padding: 0, maxWidth: "none" }}>
      {/* --- Breadcrumbs / Sub-Navigation --- */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100 w-full">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500 whitespace-nowrap">
          <Link
            href="/reports-and-audit"
            className="flex items-center gap-2 transition-colors group"
            style={{
              textDecoration: "none",
              color: isBackHovered ? "#953002" : "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Reports &amp; Audit
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 3rem" }}>
        {/* Breadcrumbs matching reports-and-audit style */}
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <Link href="/officer-dashboard" className="text-gray-400 hover:text-[#953002] transition-colors" style={{ textDecoration: "none" }}>
            Officer Dashboard
          </Link>
          <ChevronRight size={11} className="text-gray-400 shrink-0" />
          <span className="text-gray-400 shrink-0">Reports &amp; Audit</span>
          <ChevronRight size={11} className="text-gray-400 shrink-0" />
          <span className="text-[#953002] shrink-0">Evaluation Analytics Dashboard</span>
        </div>

        {/* ── Page Header ── */}
        <div className="eval-analytics-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            {/* Brown accent bar - matches officer/CAO dashboard */}
            <div style={{ width: 4, minWidth: 4, height: 62, background: "#953002", borderRadius: 4, marginTop: "0.35rem", flexShrink: 0 }} />
            <div>
              <h1 className="eval-analytics-title" style={{ fontSize: "1.85rem", fontWeight: 800, color: "#1e293b", letterSpacing: "0.01em", margin: 0, lineHeight: 1.2 }}>
                Evaluation Analytics Dashboard
              </h1>
              <p className="eval-analytics-subtitle" style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, margin: "0.6rem 0 0" }}>
                Aggregated evaluation trends, scoring metrics, and participation patterns across all tenders.
              </p>
            </div>
          </div>

          <button
            id="eval-export-pdf"
            disabled={loading || initialLoading || !data}
            className={`flex items-center gap-2 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-sm ${
              loading || initialLoading || !data
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                : "bg-[#953002] hover:bg-[#7a2702] cursor-pointer active:scale-95"
            }`}
            onClick={handleExportPdf}
          >
            <Download size={14} /> Export Analytics (PDF)
          </button>
        </div>

      {/* ── Filters bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-7 flex flex-col md:flex-row md:items-end gap-4 w-full">
        <div className="flex-grow flex-1 min-w-[220px] max-w-xs">
          <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Date Range</label>
          <CustomSelect
            value={DATE_RANGE_MAP[dateRange] || ""}
            placeholder="Select Range"
            onChange={(val) => setDateRange(REVERSE_DATE_RANGE_MAP[val] || "")}
            options={["All Time", "Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months", "Last Year"]}
            defaultValue="All Time"
          />
        </div>

        <div className="flex-grow flex-1 min-w-[220px] max-w-xs">
          <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Procurement Type</label>
          <CustomSelect
            value={category || ""}
            placeholder="Select Procurement Type"
            onChange={(val) => setCategory(val === "All Procurement Types" ? "" : val)}
            options={[
              "All Procurement Types",
              "Goods",
              "Works",
              "Services",
              "Consultancy",
              "Consulting Services",
              "Non Consulting Services",
            ]}
            defaultValue="All Procurement Types"
          />
        </div>


        <div className="flex items-center gap-2 ml-auto" style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
          <button
            id="eval-apply-filters"
            className="flex items-center gap-1.5 bg-[#953002] hover:bg-[#7a2702] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            onClick={handleApplyFilters}
          >
            <Filter size={12} /> Apply Filters
          </button>
          <button
            id="eval-reset-filters"
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            onClick={handleResetFilters}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="eval-analytics-loading">
          <div className="eval-analytics-spinner" />
          <p>Loading analytics data…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="eval-kpi-grid">
            {/* Avg Technical Score */}
            <div className="eval-kpi-card eval-kpi-card--primary">
              <div className="eval-kpi-card__icon">
                <Gauge size={20} />
              </div>
              <div className="eval-kpi-card__body">
                <p className="eval-kpi-card__label">Avg. Technical Score</p>
                <p className="eval-kpi-card__sublabel">Across evaluated tenders</p>
                <div className="eval-kpi-card__value-row">
                  <span className="eval-kpi-card__value">
                    <CountUp end={data?.kpi.avgTechnicalScore ?? 0} decimals={1} />
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Pass Rate */}
            <div className="eval-kpi-card eval-kpi-card--secondary">
              <div className="eval-kpi-card__icon">
                <CheckCircle size={20} />
              </div>
              <div className="eval-kpi-card__body">
                <p className="eval-kpi-card__label">Overall Pass Rate</p>
                <p className="eval-kpi-card__sublabel">Bids passing technical threshold</p>
                <div className="eval-kpi-card__value-row">
                  <span className="eval-kpi-card__value">
                    <CountUp end={data?.kpi.overallPassRate ?? 0} />%
                  </span>
                </div>
              </div>
            </div>

            {/* Total Bids Evaluated */}
            <div className="eval-kpi-card eval-kpi-card--info">
              <div className="eval-kpi-card__icon">
                <TrendingUp size={20} />
              </div>
              <div className="eval-kpi-card__body">
                <p className="eval-kpi-card__label">Total Bids Evaluated</p>
                <p className="eval-kpi-card__sublabel">
                  {DATE_RANGE_MAP[appliedFilters.dateRange] || "All Time"}
                </p>
                <div className="eval-kpi-card__value-row">
                  <span className="eval-kpi-card__value">
                    <CountUp end={data?.kpi.totalBidsEvaluated ?? 0} />
                  </span>
                </div>
              </div>
            </div>

            {/* Tenders with ≥5 Bidders */}
            <div className="eval-kpi-card eval-kpi-card--success">
              <div className="eval-kpi-card__icon">
                <Users size={20} />
              </div>
              <div className="eval-kpi-card__body">
                <p className="eval-kpi-card__label">Tenders with ≥5 Bidders</p>
                <p className="eval-kpi-card__sublabel">Healthy competition threshold</p>
                <div className="eval-kpi-card__value-row">
                  <span className="eval-kpi-card__value">
                    <CountUp end={data?.kpi.tendersWithHighBidders ?? 0} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 1: Bidder Count Trend + Score Distribution ── */}
          <div className="eval-charts-row eval-charts-row--2-1">
            {/* Bidder Count Trend */}
            <div className="eval-chart-card">
              <div className="eval-chart-card__header">
                <div>
                  <h2 className="eval-chart-card__title">Bidder Count Trend</h2>
                  <p className="eval-chart-card__subtitle">
                    {appliedFilters.dateRange === "last_7_days"
                      ? "Daily average number of bidders per tender - last 7 days"
                      : appliedFilters.dateRange === "last_30_days"
                      ? "Weekly average number of bidders per tender - last 5 weeks"
                      : appliedFilters.dateRange === "last_3_months"
                      ? "Monthly average number of bidders per tender - last 3 months"
                      : appliedFilters.dateRange === "last_6_months"
                      ? "Monthly average number of bidders per tender - last 6 months"
                      : appliedFilters.dateRange === "last_year"
                      ? "Monthly average number of bidders per tender - last year"
                      : "Monthly average number of bidders per tender"}
                  </p>
                </div>
              </div>
              <div className="eval-chart-card__body" style={{ height: 220 }}>
                <AnimateOnScroll height={220}>
                  <Line redraw={true} key={`line-${JSON.stringify(bidderTrendData.datasets[0].data)}`} data={bidderTrendData} options={lineChartOptions} />
                </AnimateOnScroll>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="eval-chart-card">
              <div className="eval-chart-card__header">
                <div>
                  <h2 className="eval-chart-card__title">Score Distribution</h2>
                  <p className="eval-chart-card__subtitle">Number of bids per score range</p>
                </div>
              </div>
              <div className="eval-chart-card__body" style={{ height: 220 }}>
                <AnimateOnScroll height={220}>
                  <Bar redraw={true} key={`bar-${JSON.stringify(scoreDistData.datasets[0].data)}`} data={scoreDistData} options={barChartOptions} />
                </AnimateOnScroll>
              </div>
            </div>
          </div>

          {/* ── Row 2: Pass Rate + Gauge + Category Scores ── */}
          <div className="eval-charts-row eval-charts-row--3-col">
            {/* Pass Rate Breakdown */}
            <div className="eval-chart-card">
              <div className="eval-chart-card__header">
                <div>
                  <h2 className="eval-chart-card__title">Pass Rate Breakdown</h2>
                  <p className="eval-chart-card__subtitle">Bids vs. threshold (≥75 score)</p>
                </div>
              </div>
              <div
                className="eval-chart-card__body"
                style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div style={{ width: 225, height: 225, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AnimateOnScroll height={225}>
                    <Doughnut redraw={true} key={`doughnut-${JSON.stringify(passRateData.datasets[0].data)}`} data={passRateData} options={doughnutOptions} plugins={[centerTextPlugin]} />
                  </AnimateOnScroll>
                </div>
              </div>
            </div>

            {/* Avg. Technical Score Gauge */}
            <div className="eval-chart-card">
              <div className="eval-chart-card__header">
                <div>
                  <h2 className="eval-chart-card__title">Avg. Technical Score</h2>
                  <p className="eval-chart-card__subtitle">Across all evaluated bids this period</p>
                </div>
              </div>
              <div
                className="eval-chart-card__body"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}
              >
                <GaugeChart
                  value={data?.avgTechnicalScoreGauge ?? 75}
                  threshold={data?.scoreThreshold ?? 60}
                />
              </div>
            </div>

            {/* Avg. Score by Category */}
            <div className="eval-chart-card">
              <div className="eval-chart-card__header">
                <div>
                  <h2 className="eval-chart-card__title">Avg. Score by Procurement Type</h2>
                  <p className="eval-chart-card__subtitle">Comparison across procurement types</p>
                </div>
              </div>
              <div className="eval-chart-card__body" style={{ paddingTop: "0.5rem" }}>
                {(data?.categoryScores ?? []).map((cs) => (
                  <CategoryScoreBar key={cs.category} category={cs.category} score={cs.avgScore} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Tender Evaluation Summary Table ── */}
          <div className="eval-summary-section">
            <div className="eval-summary-header">
              <h2 className="eval-summary-title">Tender Evaluation Summary</h2>
            </div>

            <div className="eval-table-wrap">
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Tender ID</th>
                    <th>Tender Title</th>
                    <th>Type</th>
                    <th>Bid Count</th>
                    <th>Avg. Score</th>
                    <th>Pass Rate</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#64748B", fontSize: "0.9rem", fontStyle: "italic", fontWeight: 500 }}>
                        No tenders found matching the criteria selected
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row) => {
                    const statusStyle = STATUS_STYLES[row.status] ?? STATUS_STYLES.Closed;
                    return (
                      <tr key={row.tenderId}>
                        <td>
                          <span className="eval-table__tender-id">{row.tenderId}</span>
                        </td>
                        <td>{row.tenderTitle}</td>
                        <td>{formatProcurementType(row.category)}</td>
                        <td>{row.bidCount}</td>
                        <td>
                          <span className={row.status === "Live" ? "text-gray-400 font-medium text-[11px] uppercase tracking-wider" : "eval-table__score"}>
                            {row.status === "Live" ? "Pending" : row.avgScore.toFixed(1)}
                          </span>
                        </td>
                        <td>
                          {row.status === "Live" ? (
                            <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">Pending</span>
                          ) : (
                            <TablePassRateBar passRate={row.passRate} />
                          )}
                        </td>
                        <td>
                          <span
                            className="eval-table__status"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/tenders/${row.tenderId}`}
                            className="p-2 rounded-xl text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50 transition-all relative group/eye inline-flex items-center justify-center"
                          >
                            <Eye size={18} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/eye:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                              View Tender
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 p-5 bg-white gap-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Showing {visibleRows.length} of {data?.tenderSummary.length ?? 0} Tenders
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    id={`eval-page-${p}`}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black transition-all cursor-pointer ${
                      page === p
                        ? "bg-[#953002] text-white shadow-md shadow-[#953002]/20 border border-[#953002]"
                        : "border border-gray-200 text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30 bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>

      {/* --- Floating Download Success Toast --- */}
      {mounted && toasts.length > 0 && createPortal(
        <div className="fixed top-6 right-6 z-[100000] flex flex-col gap-3 pointer-events-none">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className="w-max max-w-[90vw] flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl shadow-lg border border-[#27AE60]/40 bg-white pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4"
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#27AE60] stroke-[2.5]" />
                <span className="text-[14px] font-bold text-[#27AE60] tracking-tight">{t.message}</span>
              </div>
              <button 
                onClick={() => dismissToast(t.id)}
                className="ml-2 p-1 rounded-lg text-[#27AE60]/70 hover:text-[#27AE60] hover:bg-[#27AE60]/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
