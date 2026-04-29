"use client";

import TabBar from "@/components/cao-dashboard/TabBar";
import DepartmentFilter from "@/components/cao-dashboard/DepartmentFilter";
import KpiCards from "@/components/cao-dashboard/KpiCards";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

  const pathname = usePathname();
  const isReviewPage = pathname?.includes('/review');

  if (isReviewPage) {
    return <div className="dash-section">{children}</div>;
  }

  return (
    <div className="dash-section">
      <TabBar />
      <DepartmentFilter value={department} onChange={setDepartment} />
      {children}
      <KpiCards data={kpiSummary} />
    </div>
  );
}
