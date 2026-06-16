"use client";

import { useEffect } from "react";
import KpiCards from "@/components/committee-dashboard/KpiCards";
import QuickActions from "@/components/committee-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/committee-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/committee-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import TenderLayout from "@/components/tender/TenderLayout";

export default function OfficerDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return (
    <TenderLayout>
      <div className="min-h-screen bg-[#F3F5F7] p-8">
        <div className="max-w-[98%] mx-auto">
          <div className="mb-8 flex items-start gap-5">
            <div className="w-1 h-14 bg-[#953002] rounded-full mt-1.5 shadow-sm"></div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Officer Dashboard</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-600 font-medium">Centralized hub for secure bid openings and multi-criteria evaluation management.</p>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-black text-[#9A3B12] tracking-widest uppercase">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
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

          <div className="mb-8">
            <QuickActions />
          </div>

          <AssignedTenderTable />
        </div>
      </div>
    </TenderLayout>
  );
}
