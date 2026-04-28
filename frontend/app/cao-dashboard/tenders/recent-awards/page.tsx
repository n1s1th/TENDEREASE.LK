"use client";

import { useEffect, useState } from "react";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { Award } from "@/lib/types/cao-dashboard.types";

const columns: Column<Award>[] = [
  {
    key: "tenderId",
    label: "Tender ID ↓",
    sortable: true,
    render: (row) => (
      <span style={{ fontWeight: 500, color: "var(--te-gray-1)" }}>{row.tenderId}</span>
    ),
  },
  { key: "tenderTitle", label: "Tender Title" },
  { key: "awardedVendor", label: "Awarded Vendor" },
  {
    key: "awardValue",
    label: "Award Value",
    render: (row) => `RS.${row.awardValue.toLocaleString()}`,
  },
  { key: "awardDate", label: "Award Date" },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const statusClass =
        row.status === "Completed"
          ? "dash-table-status--completed"
          : row.status === "Awaiting"
            ? "dash-table-status--awaiting"
            : "dash-table-status--pending";
      return (
        <span className={`dash-table-status ${statusClass}`}>
          {row.status}
        </span>
      );
    },
  },
];

export default function RecentAwardsPage() {
  const awards = useCAODashboardStore((s) => s.awards);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const awardsLoading = useCAODashboardStore((s) => s.awardsLoading);
  const fetchAwards = useCAODashboardStore((s) => s.fetchAwards);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);
  const department = useCAODashboardStore((s) => s.department);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("recent-awards");
    fetchAwards();
  }, [setActiveTab, fetchAwards, department]);

  return (
    <>
      <TenderTable
        columns={columns}
        data={awards}
        loading={awardsLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        showMenu={false}
        emptyMessage="No recent awards found. Data will appear once the backend is connected."
      />
      <Pagination
        pagination={pagination}
        onPageChange={(page) => {
          setPage(page);
          fetchAwards();
        }}
      />
    </>
  );
}
