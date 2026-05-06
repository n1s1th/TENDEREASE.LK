"use client";

import { useEffect, useState } from "react";
import TenderTable from "@/components/officer-dashboard/TenderTable";
import Pagination from "@/components/officer-dashboard/Pagination";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { Column } from "@/components/officer-dashboard/TenderTable";
import type { AuditLogEntry } from "@/lib/types/officer-dashboard.types";

const columns: Column<AuditLogEntry>[] = [
  {
    key: "tenderId",
    label: "Tender ID ↓",
    sortable: true,
    render: (row) => (
      <span style={{ fontWeight: 500, color: "var(--te-gray-1)" }}>{row.tenderId}</span>
    ),
  },
  { key: "action", label: "Action" },
  { key: "performedBy", label: "Performed By" },
  { key: "role", label: "Role" },
  { key: "timestamp", label: "Timestamp" },
  {
    key: "ipAddress",
    label: "IP Address",
    render: (row) => (
      <code style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--te-gray-3)" }}>
        {row.ipAddress}
      </code>
    ),
  },
];

export default function AuditLogsPage() {
  const auditLogs = useOfficerDashboardStore((s) => s.auditLogs);
  const pagination = useOfficerDashboardStore((s) => s.pagination);
  const auditLogsLoading = useOfficerDashboardStore((s) => s.auditLogsLoading);
  const fetchAuditLogs = useOfficerDashboardStore((s) => s.fetchAuditLogs);
  const setActiveTab = useOfficerDashboardStore((s) => s.setActiveTab);
  const setPage = useOfficerDashboardStore((s) => s.setPage);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab("audit-logs");
    fetchAuditLogs();
  }, [setActiveTab, fetchAuditLogs]);

  return (
    <>
      <TenderTable
        columns={columns}
        data={auditLogs}
        loading={auditLogsLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        showMenu={false}
        emptyMessage="No audit logs found. Data will appear once the backend is connected."
      />
      <Pagination
        pagination={pagination}
        onPageChange={(page) => {
          setPage(page);
          fetchAuditLogs();
        }}
      />
    </>
  );
}
