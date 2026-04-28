"use client";

import { useState } from "react";
import { Download, Calendar, Filter, FileText, Share2, TrendingUp, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const cycleTimeData = [
  { label: "XXX", value: 30 },
  { label: "XXX", value: 55 },
  { label: "XXX", value: 45 },
  { label: "XXX", value: 80 },
  { label: "XXX", value: 70 },
  { label: "XXX", value: 105 },
  { label: "XXX", value: 95 },
  { label: "XXX", value: 110 },
];

const smeData = [
  { name: "SME Vendors", value: 35 },
  { name: "Other", value: 65 },
];

const awardValueData = [
  { label: "XXX", value: 2000 },
  { label: "XXX", value: 3000 },
  { label: "XXX", value: 1500 },
  { label: "XXX", value: 4000 },
  { label: "XXX", value: 2500 },
  { label: "XXX", value: 5000 },
  { label: "XXX", value: 3500 },
  { label: "XXX", value: 6000 },
  { label: "XXX", value: 4500 },
  { label: "XXX", value: 7000 },
];

export default function ReportsPage() {
  return (
    <main className="dash-page">
      <div className="dash-content">
        <section className="dash-section">
          {/* Header */}
          <div className="dash-report-header">
            <div>
              <h1 className="dash-report-title">Detailed KPI Report</h1>
              <p className="dash-report-subtitle">Cycle time • SME participation • Award value trends</p>
            </div>
            <div className="dash-report-export">
              <button className="dash-btn dash-btn--outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Export PDF
              </button>
              <button className="dash-btn dash-btn--outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Export Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="dash-report-filters" style={{ background: "#fff", padding: "1rem", borderRadius: "12px", border: "1px solid var(--te-border)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input type="date" className="dash-tab-search-input" style={{ width: "100%", paddingRight: "2.5rem" }} />
                <Calendar size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--te-gray-4)" }} />
              </div>
              <div style={{ position: "relative", flex: 1 }}>
                <input type="date" className="dash-tab-search-input" style={{ width: "100%", paddingRight: "2.5rem" }} />
                <Calendar size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--te-gray-4)" }} />
              </div>
              <select className="dash-tab-search-input" style={{ flex: 1 }}>
                <option>All Departments</option>
              </select>
              <select className="dash-tab-search-input" style={{ flex: 1 }}>
                <option>All Categories</option>
              </select>
            </div>
            <button className="dash-btn" style={{ background: "var(--te-gray-2)", color: "#fff", padding: "0.5rem 1.5rem" }}>
              Generate Report
            </button>
          </div>

          {/* Charts Grid */}
          <div className="dash-report-grid">
            {/* Cycle Time Trend */}
            <div className="dash-report-card">
              <div className="dash-report-card-header">
                <h3 className="dash-report-card-title">Cycle Time Trend</h3>
                <span className="dash-report-card-tag">Trend</span>
              </div>
              <div className="dash-report-chart" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--te-border-light)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--te-gray-4)" }} />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--te-gray-2)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "var(--te-gray-2)", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="dash-report-chart-caption">Shows average cycle time (days) for the selected period.</p>
            </div>

            {/* SME Participation */}
            <div className="dash-report-card">
              <div className="dash-report-card-header">
                <h3 className="dash-report-card-title">SME Participation</h3>
                <button className="dash-report-card-tag" style={{ border: "none", background: "var(--te-gray-6)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                   Share
                </button>
              </div>
              <div className="dash-report-chart" style={{ height: "300px", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={smeData}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="var(--te-gray-2)" />
                      <Cell fill="var(--te-gray-7)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--te-gray-1)" }}>35%</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600 }}>SME Vendors</div>
                </div>
              </div>
              <p className="dash-report-chart-caption">Percentage of bids submitted by SME vendors within the selected period.</p>
            </div>

            {/* Award Value Trends */}
            <div className="dash-report-card">
              <div className="dash-report-card-header">
                <h3 className="dash-report-card-title">Award Value Trends</h3>
                <span className="dash-report-card-tag">Totals</span>
              </div>
              <div className="dash-report-chart" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={awardValueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--te-border-light)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--te-gray-4)" }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--te-gray-4)" }}
                      tickFormatter={(val) => `$${val/1000}K`}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--te-gray-7)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="dash-report-chart-caption">Displays awarded totals over time for selected filters.</p>
            </div>

            {/* Summary Sidebar */}
            <div className="dash-report-summary">
              <h3 className="dash-report-summary-title">Summary</h3>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Avg Cycle Time</span>
                <span className="dash-report-summary-value">28 days</span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">SME Participation</span>
                <span className="dash-report-summary-value">35%</span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Total Award Value</span>
                <span className="dash-report-summary-value">LKR 18.2M</span>
              </div>
              <div className="dash-report-summary-row">
                <span className="dash-report-summary-label">Total Awards</span>
                <span className="dash-report-summary-value">12</span>
              </div>
              <p className="dash-report-footer" style={{ marginTop: "1.5rem" }}>
                Export buttons download the report in PDF/Excel format.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
