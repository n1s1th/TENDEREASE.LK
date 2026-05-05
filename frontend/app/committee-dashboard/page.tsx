"use client";

import { useEffect } from "react";
import KpiCards from "@/components/committee-dashboard/KpiCards";
import QuickActions from "@/components/committee-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/committee-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/committee-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import TenderLayout from "@/components/tender/TenderLayout";

export default function CommitteeDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return (
    <TenderLayout>
      <div className="min-h-screen bg-[#F3F5F7] p-8">
        <div className="max-w-[98%] mx-auto">
          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">WORKSPACE OVERVIEW</h3>
            <div className="flex items-end gap-3 mt-1">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Committee Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600">Centralized hub for secure bid openings and multi-criteria evaluation management.</p>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-bold text-[#9A3B12] tracking-wider uppercase">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900">Welcome Back, Member.</h2>
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
      </div>
    </TenderLayout>
  );
}
