"use client";

import TabBar from "@/components/officer-dashboard/TabBar";
import DepartmentFilter from "@/components/officer-dashboard/DepartmentFilter";
import KpiCards from "@/components/officer-dashboard/KpiCards";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import { useEffect } from "react";

import DateRangeFilter from "@/components/officer-dashboard/DateRangeFilter";

export default function TendersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const department = useOfficerDashboardStore((s) => s.department);
  const setDepartment = useOfficerDashboardStore((s) => s.setDepartment);
  const kpiSummary = useOfficerDashboardStore((s) => s.kpiSummary);
  const fetchKpiSummary = useOfficerDashboardStore((s) => s.fetchKpiSummary);

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
