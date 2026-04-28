"use client";

import { useEffect, useState } from "react";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { AuditLogEntry } from "@/lib/types/cao-dashboard.types";

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
  const auditLogs = useCAODashboardStore((s) => s.auditLogs);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const auditLogsLoading = useCAODashboardStore((s) => s.auditLogsLoading);
  const fetchAuditLogs = useCAODashboardStore((s) => s.fetchAuditLogs);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);

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
