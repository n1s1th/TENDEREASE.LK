"use client";

import { useEffect, useState, useRef } from "react";
import { Download, TrendingUp } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import DateRangeFilter from "@/components/cao-dashboard/DateRangeFilter";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
  Filler,
);

export default function ReportsPage() {
  const kpiReport = useCAODashboardStore((s) => s.kpiReport);
  const kpiLoading = useCAODashboardStore((s) => s.kpiLoading);
  const fetchKpiReport = useCAODashboardStore((s) => s.fetchKpiReport);

  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("all_time");

  const cycleTimeRef = useRef<any>(null);
  const activeTendersRef = useRef<any>(null);
  const awardValueRef = useRef<any>(null);
  const smeRef = useRef<any>(null);

  useEffect(() => {
    // 1. One-time migration: push localStorage 'AWARDED' tenders to the database
    const syncDb = async () => {
      const raw = localStorage.getItem("awardEmailsSent");
      if (raw) {
        try {
          const sentMap = JSON.parse(raw);
          let syncedAny = false;
          for (const [tId, entry] of Object.entries(sentMap)) {
            if ((entry as any).fullyAwarded || ((entry as any).winner && (entry as any).lost)) {
              await fetch(`http://localhost:8082/api/v1/tenders/${tId}/status?status=AWARDED`, { method: 'PUT' });
              syncedAny = true;
            }
          }
          if (syncedAny) {
            // Trigger a refetch so the report picks up the database changes
            fetchKpiReport({
              department: department || undefined,
              category: category || undefined,
              period: period || undefined,
            });
          }
        } catch (e) {
          console.error("Failed to sync local storage to DB", e);
        }
      }
    };
    syncDb();

    // 2. Standard fetch
    fetchKpiReport({
      department: department || undefined,
      category: category || undefined,
      period: period || undefined,
    });
  }, [fetchKpiReport, department, category, period]);

  // Chart data
  const cycleTimeData = {
    labels: kpiReport?.cycleTimeTrend.map((d) => d.label) ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Cycle Time (days)",
        data: kpiReport?.cycleTimeTrend.map((d) => d.value) ?? [],
        borderColor: "#f0b323",
        backgroundColor: "rgba(240, 179, 35, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#f0b323",
      },
    ],
  };

  const activeTendersData = {
    labels: kpiReport?.activeTendersTrend.map((d) => d.label) ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Tenders",
        data: kpiReport?.activeTendersTrend.map((d) => d.value) ?? [],
        backgroundColor: "#953002",
        borderRadius: 4,
      },
    ],
  };

  const smeDataAvailable = kpiReport && kpiReport.smeParticipationPercent !== -1;
  const smeData = {
    labels: ["SME (Sole Proprietorship / Partnership)", "Other Entities"],
    datasets: [
      {
        data: smeDataAvailable ? [kpiReport.smeParticipationPercent, 100 - kpiReport.smeParticipationPercent] : [0, 100],
        backgroundColor: ["#f0b323", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  const awardValueData = {
    labels: kpiReport?.awardValueTrend.map((d) => d.label) ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Award Value (Rs. Mn)",
        data: kpiReport?.awardValueTrend.map((d) => d.value) ?? [],
        backgroundColor: "#FFB401",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: "#F3F4F6" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { size: 12 }, padding: 16 },
      },
    },
    cutout: "65%",
  };

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case "today": return "Today";
      case "this_week": return "This Week";
      case "this_month": return "This Month";
      case "this_year": return "This Year";
      default: return "All Time";
    }
  };

  const exportCSV = () => {
    if (!kpiReport) return;
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ["KPI REPORT"],
      ["Generated On", new Date().toLocaleString()],
      ["Time Filter", getPeriodLabel(period)],
      ["Department Filter", department || "All"],
      ["Category Filter", category || "All"],
      [],
      ["Metric", "Value"],
      ["Average Cycle Time", kpiReport.summary.avgCycleTime],
      ["SME Participation", kpiReport.summary.smeParticipation],
      ["Total Award Value", kpiReport.summary.totalAwardValue],
      ["Active Tenders", kpiReport.summary.activeTenders],
      ["Total Awards", kpiReport.summary.totalAwards],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const trendHeaders = ["Month", "Cycle Time (Days)", "Active Tenders", "Award Value (Rs. Mn)"];
    const trendRows = kpiReport.cycleTimeTrend.map((ct, idx) => [
      ct.label,
      ct.value,
      kpiReport.activeTendersTrend[idx]?.value || 0,
      kpiReport.awardValueTrend[idx]?.value || 0
    ]);
    
    const wsTrends = XLSX.utils.aoa_to_sheet([trendHeaders, ...trendRows]);
    XLSX.utils.book_append_sheet(wb, wsTrends, "Trends");

    XLSX.writeFile(wb, "KPI_Report.xlsx");
  };

  const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
  };

  const exportPDF = async () => {
    if (!kpiReport) return;
    
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Watermark - match the screenshot size
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    
    // Create a grid of watermarks
    for(let x = 50; x < pageWidth + 200; x += 300) {
      for(let y = 50; y < pageHeight + 200; y += 200) {
        doc.text("TENDEREASE.LK", x, y, { angle: -25, align: "center" });
      }
    }

    // Header Logo
    try {
      const logoBase64 = await getBase64ImageFromUrl("/logo.png");
      doc.addImage(logoBase64, 'PNG', 40, 40, 160, 45);
    } catch(e) {
      // Fallback
      doc.setFillColor(149, 48, 2);
      doc.rect(40, 40, 30, 40, "F");
      doc.setTextColor(149, 48, 2);
      doc.setFontSize(16);
      doc.text("TenderEase.lk", 80, 55);
    }

    // Header Meta
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Time: ${getPeriodLabel(period)}`, pageWidth - 40, 55, { align: "right" });
    doc.text(`Department: ${department || 'All'}`, pageWidth - 40, 68, { align: "right" });
    doc.text(`Category: ${category || 'All'}`, pageWidth - 40, 81, { align: "right" });
    doc.text(`Generated On: ${new Date().toLocaleString()}`, pageWidth - 40, 94, { align: "right" });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(40, 110, pageWidth - 40, 110);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(20, 30, 60); // Dark navy/grey
    doc.text("KPI REPORT", pageWidth / 2, 140, { align: "center" });

    // Summary Table
    autoTable(doc, {
      startY: 170,
      head: [["Metric", "Value"]],
      body: [
        ["Average Cycle Time", kpiReport.summary.avgCycleTime],
        ["SME Participation", kpiReport.summary.smeParticipation],
        ["Total Award Value", kpiReport.summary.totalAwardValue],
        ["Active Tenders", kpiReport.summary.activeTenders],
        ["Total Awards", kpiReport.summary.totalAwards],
      ],
      headStyles: { fillColor: [149, 48, 2], textColor: 255, fontStyle: "bold", halign: "left" },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });

    let currentY = (doc as any).lastAutoTable.finalY + 30;
    
    // Add Charts
    const addChartToDoc = (ref: any, title: string, x: number, y: number, w: number, h: number) => {
        if (ref?.current) {
            const imgBase64 = ref.current.toBase64Image();
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.text(title, x + (w / 2), y - 10, { align: 'center' });
            doc.addImage(imgBase64, 'PNG', x, y, w, h);
        }
    };

    // Cycle time and SME side by side
    addChartToDoc(cycleTimeRef, "Cycle Time Trend", 40, currentY, 240, 140);
    addChartToDoc(smeRef, "SME Participation", 300, currentY, 240, 140);
    currentY += 180;

    // Award Value and Active side by side
    addChartToDoc(awardValueRef, "Award Value Trends", 40, currentY, 240, 140);
    addChartToDoc(activeTendersRef, "Active Tenders Growth", 300, currentY, 240, 140);
    currentY += 160;

    // Footer
    const finalY = currentY + 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(40, finalY, 200, finalY);
    doc.line(pageWidth - 200, finalY, pageWidth - 40, finalY);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated By Signature", 40, finalY + 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 40, finalY + 30);

    doc.text("Authorized Verification", pageWidth - 200, finalY + 15);
    doc.text("TenderEase Security Seal Verified", pageWidth - 200, finalY + 30);

    doc.save("KPI_Report.pdf");
  };

  return (
    <div className="dash-section">
      <div className="dash-report" id="kpi-report">
        {/* Header */}
        <div className="dash-report-header">
          <div>
            <h1 className="dash-report-title">
              KPI Report
            </h1>
            <p className="dash-report-subtitle" style={{ fontSize: "1.0rem" }}>
              Performance metrics and analytics for tender management
            </p>
          </div>
          <div className="dash-report-export">
            <button className="dash-btn dash-btn--outline dash-btn--sm" onClick={exportPDF}>
              <Download size={14} /> Export PDF
            </button>
            <button className="dash-btn dash-btn--outline dash-btn--sm" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="dash-report-filters">
          <DateRangeFilter value={period} onChange={setPeriod} />
          <select
            className="dash-select"
            style={{ minWidth: 180 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Planning Division">Planning Division</option>
            <option value="Procurement Unit">Procurement Unit</option>
            <option value="Infrastructure Development">Infrastructure Development</option>
            <option value="Supplies Division">Supplies Division</option>
            <option value="Logistics Division">Logistics Division</option>
            <option value="Engineering Branch">Engineering Branch</option>
            <option value="Road Development">Road Development</option>
            <option value="Public Transport Division">Public Transport Division</option>
            <option value="Irrigation & Water Management">Irrigation & Water Management</option>
            <option value="Research & Development">Research & Development</option>
          </select>
          <select
            className="dash-select"
            style={{ minWidth: 160 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="goods">Goods</option>
            <option value="services">Services</option>
            <option value="works">Works</option>
            <option value="consultancy">Consulting</option>
          </select>
        </div>

        {kpiLoading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--te-gray-4)" }}>
            Loading report data…
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="dash-report-grid">
              {/* Cycle Time Trend */}
              <div className="dash-report-card">
                <div className="dash-report-card-header">
                  <h3 className="dash-report-card-title">Cycle Time Trend</h3>
                  <span className="dash-report-card-tag">Line Chart</span>
                </div>
                <div className="dash-report-chart">
                  {kpiReport?.cycleTimeTrend && kpiReport.cycleTimeTrend.length > 0 ? (
                    <Line ref={cycleTimeRef} data={cycleTimeData} options={chartOptions} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data received yet.
                    </span>
                  )}
                </div>
                <p className="dash-report-chart-caption">
                  Cycle time duration over the selected period
                </p>
              </div>

              {/* SME Participation */}
              <div className="dash-report-card">
                <div className="dash-report-card-header">
                  <h3 className="dash-report-card-title">SME Participation</h3>
                  <span className="dash-report-card-tag">Donut Chart</span>
                </div>
                <div className="dash-report-chart">
                  {smeDataAvailable ? (
                    <Doughnut ref={smeRef} data={smeData} options={doughnutOptions} plugins={[{
                      id: 'textCenter',
                      beforeDraw: function(chart: any) {
                        var width = chart.width,
                            height = chart.height,
                            ctx = chart.ctx;
                  
                        ctx.restore();
                        var fontSize = (height / 114).toFixed(2);
                        ctx.font = "bold " + fontSize + "em sans-serif";
                        ctx.textBaseline = "middle";
                  
                        var text = kpiReport.smeParticipationPercent + "%",
                            textX = Math.round((width - ctx.measureText(text).width) / 2),
                            textY = height / 2 - 20; // adjust for legend
                  
                        ctx.fillStyle = "#333";
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                      }
                    }]} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data received yet.
                    </span>
                  )}
                </div>
                <p className="dash-report-chart-caption">
                  SME vs Non-SME vendor participation percentage
                </p>
              </div>
            </div>

            {/* Middle Grid: Award Value & Active Tenders */}
            <div className="dash-report-grid" style={{ marginBottom: "1.5rem" }}>
              {/* Award Value Trends */}
              <div className="dash-report-card">
                <div className="dash-report-card-header">
                  <h3 className="dash-report-card-title">Award Value Trends</h3>
                  <span className="dash-report-card-tag">Bar Chart</span>
                </div>
                <div className="dash-report-chart" style={{ height: 280 }}>
                  {kpiReport?.awardValueTrend && kpiReport.awardValueTrend.length > 0 ? (
                    <Bar ref={awardValueRef} data={awardValueData} options={chartOptions} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data received yet.
                    </span>
                  )}
                </div>
                <p className="dash-report-chart-caption">
                  Monthly award values over the selected period
                </p>
              </div>

              {/* Active Tenders Trend */}
              <div className="dash-report-card">
                <div className="dash-report-card-header">
                  <h3 className="dash-report-card-title">Active Tenders Growth</h3>
                  <span className="dash-report-card-tag">Bar Chart</span>
                </div>
                <div className="dash-report-chart" style={{ height: 280 }}>
                  {kpiReport?.activeTendersTrend && kpiReport.activeTendersTrend.length > 0 ? (
                    <Bar ref={activeTendersRef} data={activeTendersData} options={chartOptions} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data received yet.
                    </span>
                  )}
                </div>
                <p className="dash-report-chart-caption">
                  Number of active tenders over the selected period
                </p>
              </div>
            </div>



            {/* Summary Table */}
            <div className="dash-report-summary">
              <h3 className="dash-report-summary-title">Summary</h3>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Average Cycle Time</span>
                <span className="dash-report-summary-value">
                  {kpiReport?.summary.avgCycleTime ?? "—"}
                </span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">SME Participation</span>
                <span className="dash-report-summary-value">
                  {kpiReport?.summary.smeParticipation ?? "—"}
                </span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Total Award Value</span>
                <span className="dash-report-summary-value">
                  {kpiReport?.summary.totalAwardValue ?? "—"}
                </span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Active Tenders</span>
                <span className="dash-report-summary-value">
                  {kpiReport?.summary.activeTenders ?? "—"}
                </span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Total Awards</span>
                <span className="dash-report-summary-value">
                  {kpiReport?.summary.totalAwards ?? "—"}
                </span>
              </div>
              <p className="dash-report-footer">
                Note: The data shown reflects the selected filters and date range.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
