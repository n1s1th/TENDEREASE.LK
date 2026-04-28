"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Bell, CheckCheck, RefreshCw, Eye, RotateCcw,
  FileText, MessageSquare, Clock, Filter, ChevronDown,
  ChevronRight,
} from "lucide-react";
import SearchInput from "@/components/officer-dashboard/SearchInput";
import EmptyState from "@/components/officer-dashboard/EmptyState";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { DashboardNotification } from "@/lib/types/officer-dashboard.types";

/* ── type-specific styling ─────────────────────────────────── */
const TYPE_STYLE: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  clarification_created: { icon: <MessageSquare size={16} />, color: "#2563eb", bg: "#eff6ff" },
  clarification_answered: { icon: <CheckCheck size={16} />, color: "#16a34a", bg: "#f0fdf4" },
};

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  sent: { label: "Sent", bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  failed: { label: "Failed", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  pdf_generated: { label: "PDF Generated", bg: "#e0f2fe", color: "#075985", border: "#bae6fd" },
};

function getTypeStyle(type: string) {
  return TYPE_STYLE[type?.toLowerCase()] ?? { icon: <Bell size={16} />, color: "#6b7280", bg: "#f9fafb" };
}

function getStatusStyle(status: string) {
  return STATUS_STYLE[status?.toLowerCase()] ?? { label: status, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useOfficerDashboardStore((s) => s.notifications);
  const notificationSummary = useOfficerDashboardStore((s) => s.notificationSummary);
  const notificationsLoading = useOfficerDashboardStore((s) => s.notificationsLoading);
  const fetchNotifications = useOfficerDashboardStore((s) => s.fetchNotifications);
  const fetchNotificationSummary = useOfficerDashboardStore((s) => s.fetchNotificationSummary);
  const markNotificationRead = useOfficerDashboardStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useOfficerDashboardStore((s) => s.markAllNotificationsRead);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchNotifications(search || undefined, typeFilter || undefined, statusFilter || undefined);
    fetchNotificationSummary();
  }, [fetchNotifications, fetchNotificationSummary, search, typeFilter, statusFilter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleViewDetails(notif: DashboardNotification) {
    await markNotificationRead(notif.id);
    // Route to clarification detail page if it's a clarification notification
    if (notif.type?.toLowerCase().includes("clarification") && notif.tenderId) {
      const clarId = notif.clarificationId ?? notif.actionUrl?.match(/clarifications\/(\d+)/)?.[1] ?? "1";
      router.push(`/officer-dashboard/clarifications/${notif.tenderId}/${clarId}`);
    } else if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  }

  return (
    <div style={{ paddingTop: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--te-gray-1)", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Bell size={24} />
            Notification Center
          </h1>
          <p style={{ color: "var(--te-gray-4)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up — no new notifications"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => {
              fetchNotifications(search || undefined, typeFilter || undefined, statusFilter || undefined);
              fetchNotificationSummary();
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.55rem 1rem", background: "#fff",
              border: "1px solid var(--te-border, #e2e8f0)", borderRadius: "8px",
              fontWeight: 600, fontSize: "0.8rem", color: "var(--te-gray-3)", cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.55rem 1rem", background: "#fff",
                border: "1px solid var(--te-border, #e2e8f0)", borderRadius: "8px",
                fontWeight: 600, fontSize: "0.8rem", color: "#2563eb", cursor: "pointer",
              }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search notifications..." />
        </div>
        <select
          className="dash-select"
          style={{ minWidth: 180, borderRadius: "10px" }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="CLARIFICATION_CREATED">Clarification Questions</option>
          <option value="CLARIFICATION_ANSWERED">Clarification Answers</option>
          <option value="award_letter_generated">Award Letter Generated</option>
          <option value="vendor_notified">Vendor Notified</option>
        </select>
        <select
          className="dash-select"
          style={{ minWidth: 120, borderRadius: "10px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
        {/* Notification List */}
        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "0.75rem", paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--te-border, #e2e8f0)",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--te-gray-2)" }}>
              Recent Notifications
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--te-gray-4)" }}>
              {notifications.length} total
            </span>
          </div>

          {notificationsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" description="Notifications will appear here when clarification questions are submitted by vendors." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {notifications.map((notif) => {
                const tStyle = getTypeStyle(notif.type ?? "");
                const sStyle = getStatusStyle(notif.status ?? "");
                return (
                  <div
                    key={notif.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "0.9rem",
                      padding: "1rem 1.25rem",
                      background: notif.isRead ? "#fff" : "#fafbff",
                      border: notif.isRead ? "1px solid var(--te-border, #e2e8f0)" : "1px solid #c7d2fe",
                      borderRadius: "10px",
                      transition: "all 0.2s",
                      alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "10px",
                      background: tStyle.bg, color: tStyle.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: "0.1rem",
                    }}>
                      {tStyle.icon}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                        {!notif.isRead && (
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--te-gray-1)" }}>
                          {notif.title}
                        </span>
                        <span style={{
                          padding: "0.15rem 0.6rem", borderRadius: "12px",
                          fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}`,
                        }}>
                          {sStyle.label}
                        </span>
                      </div>

                      {notif.tenderTitle && (
                        <div style={{ fontSize: "0.8rem", color: "var(--te-gray-4)", marginBottom: "0.2rem" }}>
                          <FileText size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />
                          {notif.tenderTitle}
                          {notif.tenderNumber && ` · ${notif.tenderNumber}`}
                        </div>
                      )}

                      {notif.questionPreview && (
                        <p style={{
                          fontSize: "0.82rem", color: "var(--te-gray-3)", margin: "0.2rem 0 0",
                          lineHeight: 1.4, fontStyle: "italic",
                        }}>
                          &ldquo;{notif.questionPreview}&rdquo;
                        </p>
                      )}

                      {notif.message && !notif.questionPreview && (
                        <p style={{
                          fontSize: "0.8rem", color: "var(--te-gray-4)", margin: "0.2rem 0 0",
                          lineHeight: 1.4,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {notif.message}
                        </p>
                      )}

                      {/* Actions row */}
                      <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleViewDetails(notif)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.35rem",
                            padding: "0.35rem 0.9rem", border: "1px solid var(--te-border, #e2e8f0)",
                            borderRadius: "6px", background: "#fff", fontSize: "0.75rem",
                            fontWeight: 600, color: "var(--te-gray-3)", cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--te-border, #e2e8f0)"; e.currentTarget.style.color = "var(--te-gray-3)"; }}
                        >
                          <Eye size={12} /> View Details
                        </button>
                        {notif.status === "failed" && (
                          <button style={{
                            display: "inline-flex", alignItems: "center", gap: "0.35rem",
                            padding: "0.35rem 0.9rem", border: "none",
                            borderRadius: "6px", background: "#2563eb", fontSize: "0.75rem",
                            fontWeight: 600, color: "#fff", cursor: "pointer",
                          }}>
                            <RotateCcw size={12} /> Retry
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--te-gray-4)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={11} />
                        {notif.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div style={{
          background: "#fff",
          border: "1px solid var(--te-border, #e2e8f0)",
          borderRadius: "12px",
          padding: "1.25rem",
          height: "fit-content",
          position: "sticky",
          top: "1rem",
        }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--te-gray-1)", marginBottom: "1rem" }}>
            Summary
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--te-gray-4)", marginBottom: "1rem" }}>
            {notificationSummary?.date ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          {[
            { label: "Unread", value: notificationSummary?.unread ?? 0, color: "#2563eb" },
            { label: "Failed Deliveries", value: notificationSummary?.failedDeliveries ?? 0, color: "#dc2626" },
            { label: "Award Letters Generated", value: notificationSummary?.awardLettersGenerated ?? 0, color: "#16a34a" },
          ].map((stat) => (
            <div key={stat.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.6rem 0", borderBottom: "1px solid var(--te-border, #f1f5f9)",
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--te-gray-4)" }}>{stat.label}</span>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: stat.color }}>{stat.value}</span>
            </div>
          ))}

          <div style={{ marginTop: "1.25rem" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--te-gray-2)", marginBottom: "0.5rem" }}>Quick Actions</h4>
            {["Retry All Failed", "Export Logs", "Settings"].map((action) => (
              <button key={action} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "0.5rem 0", background: "none", border: "none",
                fontSize: "0.78rem", fontWeight: 600, color: "#2563eb",
                cursor: "pointer",
              }}>
                → {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
