"use client";

import { useEffect, useState } from "react";
import TenderTable from "@/components/officer-dashboard/TenderTable";
import Pagination from "@/components/officer-dashboard/Pagination";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { Column } from "@/components/officer-dashboard/TenderTable";
import type { DashboardTender } from "@/lib/types/officer-dashboard.types";

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
    key: "score",
    label: "Score",
    render: (row) => (
      <span className="dash-score-badge" style={{ fontSize: "0.8rem", padding: "0.125rem 0.5rem" }}>
        {row.score != null ? `${row.score}%` : "—"}
      </span>
    ),
  },
];

export default function PendingTendersPage() {
  const tenders = useOfficerDashboardStore((s) => s.tenders);
  const pagination = useOfficerDashboardStore((s) => s.pagination);
  const tendersLoading = useOfficerDashboardStore((s) => s.tendersLoading);
  const fetchTenders = useOfficerDashboardStore((s) => s.fetchTenders);
  const setActiveTab = useOfficerDashboardStore((s) => s.setActiveTab);
  const setPage = useOfficerDashboardStore((s) => s.setPage);
  const openModal = useOfficerDashboardStore((s) => s.openModal);
  const department = useOfficerDashboardStore((s) => s.department);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("pending");
    fetchTenders();
  }, [setActiveTab, fetchTenders, department]);

  const handleReview = (row: DashboardTender) => {
    openModal("recommendation-review", { tender: row });
  };

  return (
    <>
      <TenderTable
        columns={columns}
        data={tenders}
        loading={tendersLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        rowActionLabel="Review"
        onRowAction={handleReview}
        emptyMessage="No pending tenders found. Data will appear once the backend is connected."
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
