"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { DashboardTender } from "@/lib/types/cao-dashboard.types";

const columns: Column<DashboardTender>[] = [
  {
    key: "tenderNumber" as any,
    label: "Reference No.",
    sortable: true,
    render: (row) => (
      <span style={{ fontWeight: 500, color: "var(--te-gray-1)" }}>{row.tenderNumber || row.id}</span>
    ),
  },
  { key: "title", label: "Tender Title" },
  {
    key: "procurementType",
    label: "Type",
    render: (row: any) => row.procurementType || row.type || "—",
  },
  {
    key: "closingDate",
    label: "Submission Deadline",
    render: (row: any) => row.closingDate ? new Date(row.closingDate).toLocaleDateString() : "—",
  },
  {
    key: "createdByEmail",
    label: "Officer Email",
    render: (row) => (
      <span className="text-sm text-grey-3">
        {row.createdByEmail || "officer@procurement.gov.lk"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: () => (
      <span className="dash-table-status dash-table-status--completed">Approved</span>
    ),
  },
];

export default function ApprovedTendersPage() {
  const router = useRouter();
  const tenders = useCAODashboardStore((s) => s.tenders);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const tendersLoading = useCAODashboardStore((s) => s.tendersLoading);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("approved");
    fetchTenders();
  }, [setActiveTab, fetchTenders, department]);

  const handleRowClick = (row: DashboardTender) => {
    const refId = encodeURIComponent((row.tenderNumber || row.referenceNumber || row.id).replace(/\//g, "-"));
    router.push(`/cao-dashboard/tenders/${refId}/review`);
  };

  // Client-side filtering for department and search query
  const filteredTenders = tenders.filter((tender: any) => {
    // Department / Agency filter
    if (department) {
      const deptLower = department.toLowerCase().trim();
      const tenderDept = (tender.department || tender.departmentName || tender.agency || "").toLowerCase().trim();
      if (tenderDept !== deptLower) return false;
    }

    // Search filter (reference number, title, or type)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const refNo = (tender.tenderNumber || tender.referenceNumber || tender.id || "").toLowerCase();
      const title = (tender.title || "").toLowerCase();
      const type = (tender.procurementType || tender.type || "").toLowerCase();

      if (!refNo.includes(q) && !title.includes(q) && !type.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      <TenderTable
        columns={columns}
        data={filteredTenders}
        loading={tendersLoading}
        selectable={false}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowAction={handleRowClick}
        emptyMessage="No approved tenders found."
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
