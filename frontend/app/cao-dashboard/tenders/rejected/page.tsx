"use client";

import { useEffect, useState } from "react";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { DashboardTender } from "@/lib/types/cao-dashboard.types";

const columns: Column<DashboardTender>[] = [
  {
    key: "id",
    label: "Tender ID ↓",
    sortable: true,
    render: (row) => (
      <span style={{ fontWeight: 500, color: "var(--te-gray-1)" }}>{row.id}</span>
    ),
  },
  { key: "title", label: "Tender Title" },
  {
    key: "category",
    label: "Category / Type",
    render: (row) => `${row.category} / ${row.type}`,
  },
  { key: "closingDate", label: "Closing Date" },
  {
    key: "createdByEmail",
    label: "Publisher Email",
    render: (row) => (
      <span className="text-sm text-grey-3">
        {row.createdByEmail || "officer@procurement.gov.lk"}
      </span>
    ),
  },
  {
    key: "rejectionReason",
    label: "Reason",
    render: (row) => (
      <span style={{ fontSize: "0.8rem", color: "var(--te-gray-3)", fontStyle: "italic" }}>
        {row.rejectionReason ?? "—"}
      </span>
    ),
  },
];

export default function RejectedTendersPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const tendersLoading = useCAODashboardStore((s) => s.tendersLoading);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);
  const department = useCAODashboardStore((s) => s.department);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("rejected");
    fetchTenders();
  }, [setActiveTab, fetchTenders, department]);

  return (
    <>
      <TenderTable
        columns={columns}
        data={tenders}
        loading={tendersLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        showMenu={false}
        emptyMessage="No rejected tenders found. Data will appear once the backend is connected."
      />
      <Pagination
        pagination={pagination}
        onPageChange={(page) => {
          setPage(page);
          fetchTenders();
        }}
      />
    </>
  );
}
