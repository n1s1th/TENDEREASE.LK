"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--te-gray-6, #f1f5f9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--te-gray-4, #94a3b8)"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>
            {(row.createdBy || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "var(--te-gray-1)", fontSize: "0.875rem" }}>{row.id}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--te-gray-4)" }}>{row.createdBy || "System User"}</div>
        </div>
      </div>
    ),
  },
  {
    key: "title",
    label: "Tender Title",
    render: (row) => <span style={{ fontSize: "0.875rem", color: "var(--te-gray-3)" }}>{row.title}</span>
  },
  {
    key: "category",
    label: "Category / Type",
    render: (row) => <span style={{ fontSize: "0.875rem", color: "var(--te-gray-3)" }}>{row.category} / {row.type}</span>,
  },
  {
    key: "closingDate",
    label: "Closing Date",
    render: (row) => <span style={{ fontSize: "0.875rem", color: "var(--te-gray-3)" }}>{row.closingDate}</span>
  },
  {
    key: "recommendationStatus",
    label: "Recommendation Status",
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{
          fontSize: "0.75rem",
          color: "var(--te-gray-3)",
          fontWeight: 500,
          background: "var(--te-gray-7)",
          padding: "0.25rem 0.75rem",
          borderRadius: "12px",
          border: "1px solid var(--te-border-light)"
        }}>
          {row.recommendationStatus || "Under Review"}
        </span>
      </div>
    )
  }
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
    if (row.recommendationStatus === "Rejected") {
      openModal("edit-recommendation", { tender: row });
    } else {
      openModal("recommendation-review", { tender: row });
    }
  };

  const getRowActionLabel = (row: DashboardTender) => {
    return row.recommendationStatus === "Rejected" ? "Edit Recommendation" : "Review";
  };

  return (
    <>
      <TenderTable
        columns={columns}
        data={tenders}
        loading={tendersLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowAction={handleReview}
        renderRowActionLabel={getRowActionLabel}
        emptyMessage="No pending tenders found. Data will appear once the backend is connected."
      />
      <Pagination
        pagination={pagination}
        onPageChange={(page) => {
          setPage(page);
          fetchTenders();
        }}
      />

      <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--te-gray-4)" }} />
          <select
            className="dash-tab-search-input"
            style={{ width: "100%", paddingLeft: "2.5rem", appearance: "auto" }}
          >
            <option value="">Filter By Department</option>
            <option value="IT">IT Infrastructure</option>
            <option value="HR">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
      </div>
    </>
  );
}
