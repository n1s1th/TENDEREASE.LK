"use client";

import { useEffect, useState } from "react";
import EvaluationKpiCards from "@/components/officer-dashboard/EvaluationKpiCards";
import QuickActions from "@/components/officer-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/officer-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/officer-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import { useAuthStore } from "@/store";
import { Loader2 } from "lucide-react";

export default function OfficerDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics().finally(() => setLoading(false));
  }, [fetchDashboardMetrics]);

  if (loading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Officer Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div style={{ padding: "2.25rem 0 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }} className="w-full flex-col sm:flex-row sm:items-center">
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
                Centralized hub for secure bid openings and multi-criteria evaluation management.
              </p>
            </div>
          </div>


        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm py-3.5 px-5 mb-6 border border-gray-100">
        <h2 className="text-[17px] font-black text-gray-900">Welcome Back, {user?.name || "Officer"}.</h2>
        <p className="text-[14px] text-gray-500 mt-0.5">
          You have {activeTendersCount} active tender{activeTendersCount !== 1 ? 's' : ''} requiring your attention today.
        </p>
      </div>

      <EvaluationKpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        <QuickActions />
        <EvaluationStatusPanel />
      </div>

      <AssignedTenderTable 
        title="Approved Tenders"
        subtitle="Log of all officially approved and verified tenders."
      />
    </div>
  );
}
