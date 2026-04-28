"use client";

import RecommendationsTabBar from "@/components/cao-dashboard/RecommendationsTabBar";
import DepartmentFilter from "@/components/cao-dashboard/DepartmentFilter";
import KpiCards from "@/components/cao-dashboard/KpiCards";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { useEffect } from "react";
import DateRangeFilter from "@/components/cao-dashboard/DateRangeFilter";

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const department = useCAODashboardStore((s) => s.department);
  const setDepartment = useCAODashboardStore((s) => s.setDepartment);
  const kpiSummary = useCAODashboardStore((s) => s.kpiSummary);
  const fetchKpiSummary = useCAODashboardStore((s) => s.fetchKpiSummary);

  useEffect(() => {
    fetchKpiSummary();
  }, [fetchKpiSummary]);

  return (
    <div className="dash-section">
      <RecommendationsTabBar />
      <DepartmentFilter value={department} onChange={setDepartment} />
      {children}
      <DateRangeFilter />
      <KpiCards data={kpiSummary} />
    </div>
  );
}
