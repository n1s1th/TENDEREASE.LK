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

  useEffect(() => {
    fetchKpiReport({
      department: department || undefined,
      category: category || undefined,
    });
  }, [fetchKpiReport, department, category]);

  // Chart data — uses real data when available, shows empty placeholder otherwise
  const cycleTimeData = {
    labels: kpiReport?.cycleTimeTrend.map((d) => d.label) ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Cycle Time (days)",
        data: kpiReport?.cycleTimeTrend.map((d) => d.value) ?? [],
        borderColor: "#953002",
        backgroundColor: "rgba(149, 48, 2, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#953002",
      },
    ],
  };

  const smeData = {
    labels: ["SME", "Non-SME"],
    datasets: [
      {
        data: kpiReport ? [kpiReport.smeParticipationPercent, 100 - kpiReport.smeParticipationPercent] : [],
        backgroundColor: ["#953002", "#E5E7EB"],
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

  return (
    <div className="dash-section">
      <div className="dash-report" id="kpi-report">
        {/* Header */}
        <div className="dash-report-header">
          <div>
            <h1 className="dash-report-title">
              <TrendingUp size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
              KPI Report
            </h1>
            <p className="dash-report-subtitle">
              Performance metrics and analytics for tender management
            </p>
          </div>
          <div className="dash-report-export">
            <button className="dash-btn dash-btn--outline dash-btn--sm">
              <Download size={14} /> Export PDF
            </button>
            <button className="dash-btn dash-btn--outline dash-btn--sm">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="dash-report-filters">
          <DateRangeFilter />
          <select
            className="dash-select"
            style={{ minWidth: 180 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Department</option>
            <option value="Education">Education</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Technology">Technology</option>
            <option value="Health">Health</option>
          </select>
          <select
            className="dash-select"
            style={{ minWidth: 160 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category</option>
            <option value="goods">Goods</option>
            <option value="services">Services</option>
            <option value="works">Works</option>
            <option value="consulting">Consulting</option>
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
                    <Line data={cycleTimeData} options={chartOptions} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data — connects to backend
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
                  {kpiReport?.smeParticipationPercent != null ? (
                    <Doughnut data={smeData} options={doughnutOptions} />
                  ) : (
                    <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                      No data — connects to backend
                    </span>
                  )}
                </div>
                <p className="dash-report-chart-caption">
                  SME vs Non-SME vendor participation percentage
                </p>
              </div>
            </div>

            {/* Award Value Trends (full width) */}
            <div className="dash-report-card" style={{ marginBottom: "1.5rem" }}>
              <div className="dash-report-card-header">
                <h3 className="dash-report-card-title">Award Value Trends</h3>
                <span className="dash-report-card-tag">Bar Chart</span>
              </div>
              <div className="dash-report-chart" style={{ height: 280 }}>
                {kpiReport?.awardValueTrend && kpiReport.awardValueTrend.length > 0 ? (
                  <Bar data={awardValueData} options={chartOptions} />
                ) : (
                  <span style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
                    No data — connects to backend
                  </span>
                )}
              </div>
              <p className="dash-report-chart-caption">
                Monthly award values over the selected period
              </p>
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
