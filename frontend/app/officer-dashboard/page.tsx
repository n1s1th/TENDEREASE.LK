"use client";

import { useEffect, useState } from "react";
import EvaluationKpiCards from "@/components/officer-dashboard/EvaluationKpiCards";
import QuickActions from "@/components/officer-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/officer-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/officer-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import { useAuthStore } from "@/store";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";

export default function OfficerDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();
  const notificationSummary = useOfficerDashboardStore((s) => s.notificationSummary);
  const fetchNotificationSummary = useOfficerDashboardStore((s) => s.fetchNotificationSummary);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics().finally(() => setLoading(false));
    fetchNotificationSummary();
  }, [fetchDashboardMetrics, fetchNotificationSummary]);

  const unreadCount = notificationSummary?.unread ?? 0;

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
    <div className="space-y-7">
      <div className="pt-8 pb-7">
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-[75px] w-1 shrink-0 rounded bg-[#953002]"></div>
            <div>
              <h1 className="m-0 text-[40px] font-extrabold leading-tight tracking-normal text-[#12233f] max-sm:text-[32px]">
                Officer Dashboard
              </h1>
              <p className="mt-3 text-[18px] font-medium text-[#94a3b8]">
                Centralized hub for secure bid openings and multi-criteria evaluation management.
              </p>
            </div>
          </div>
          <Link
            href="/officer-dashboard/notifications"
            aria-label="Notification Center"
            className="relative inline-flex h-12 w-12 items-center justify-center self-start rounded-full border border-[#dfe5ee] bg-white text-[#63718a] shadow-sm transition hover:border-[#953002]/30 hover:text-[#953002]"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[11px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white px-7 py-5 shadow-sm">
        <h2 className="text-[22px] font-black text-gray-950">Welcome Back, {user?.name || "Officer"}.</h2>
        <p className="mt-1 text-[17px] text-[#64748b]">
          You have {activeTendersCount} active tender{activeTendersCount !== 1 ? 's' : ''} requiring your attention today.
        </p>
      </div>

      <EvaluationKpiCards />

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:items-stretch">
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
