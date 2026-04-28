"use client";

import TabBar from "@/components/cao-dashboard/TabBar";
import DepartmentFilter from "@/components/cao-dashboard/DepartmentFilter";
import KpiCards from "@/components/cao-dashboard/KpiCards";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { useEffect } from "react";

import DateRangeFilter from "@/components/cao-dashboard/DateRangeFilter";

export default function TendersLayout({
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
      <TabBar />
      <DepartmentFilter value={department} onChange={setDepartment} />
      {children}
      <DateRangeFilter />
      <KpiCards data={kpiSummary} />
    </div>
  );
}
