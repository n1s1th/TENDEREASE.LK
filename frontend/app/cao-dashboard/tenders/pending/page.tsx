"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { approveTender as apiApproveTender } from "@/lib/api/cao-dashboard.api";
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
        {row.createdByEmail || (row.createdBy && row.createdBy !== 'anonymousUser' && row.createdBy !== 'dev-user-id' ? row.createdBy : "officer@procurement.gov.lk")}
      </span>
    ),
  },
];

export default function PendingTendersPage() {
  const router = useRouter();
  const tenders = useCAODashboardStore((s) => s.tenders);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const tendersLoading = useCAODashboardStore((s) => s.tendersLoading);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);
  const showToast = useCAODashboardStore((s) => s.showToast);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  useEffect(() => {
    setActiveTab("pending");
    fetchTenders();
  }, [setActiveTab, fetchTenders, department]);

  const handleReview = (row: DashboardTender) => {
    const refId = encodeURIComponent((row.tenderNumber || row.referenceNumber || row.id).replace(/\//g, "-"));
    router.push(`/cao-dashboard/tenders/${refId}/review`);
  };

  const handleBulkApprove = async () => {
    setIsBulkApproving(true);
    let successCount = 0;
    try {
      for (const id of selectedIds) {
        await apiApproveTender(id);
        successCount++;
      }
      if (successCount > 0) {
        showToast("success", `${successCount} tenders approved and published successfully.`);
      }
      setSelectedIds(new Set());
      fetchTenders();
    } catch (error) {
      showToast("error", "Some tenders could not be approved.");
      fetchTenders();
    } finally {
      setIsBulkApproving(false);
    }
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
      {selectedIds.size > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleBulkApprove}
            disabled={isBulkApproving}
            className="flex items-center gap-2 bg-[#953002] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#b03b03] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} />
            {isBulkApproving ? "Approving..." : `Approve Selected (${selectedIds.size})`}
          </button>
        </div>
      )}

      <TenderTable
        columns={columns}
        data={filteredTenders}
        loading={tendersLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        rowActionLabel="Review"
        onRowAction={handleReview}
        emptyMessage="No pending tenders found."
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
