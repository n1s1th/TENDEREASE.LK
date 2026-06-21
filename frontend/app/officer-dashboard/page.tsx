"use client";

import { useEffect } from "react";
import KpiCards from "@/components/committee-dashboard/KpiCards";
import QuickActions from "@/components/committee-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/committee-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/committee-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";

export default function OfficerDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return (
    <div className="space-y-6">
      <div style={{ padding: "0.75rem 0 1.25rem" }}>
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
              Officer Dashboard
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, margin: "0.6rem 0 0" }}>
              Centralized hub for secure bid openings and multi-criteria evaluation management. • <span style={{ color: "#953002", fontWeight: 700 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-black text-gray-900">Welcome Back, Officer.</h2>
        <p className="text-gray-500 mt-1">
          You have {activeTendersCount} active tender{activeTendersCount !== 1 ? 's' : ''} requiring your attention today.
        </p>
      </div>

      <KpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        <QuickActions />
        <EvaluationStatusPanel />
      </div>

      <AssignedTenderTable />
    </div>
  );
}
