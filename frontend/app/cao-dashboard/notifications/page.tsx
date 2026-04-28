"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Eye, RotateCcw, ChevronDown } from "lucide-react";
import SearchInput from "@/components/cao-dashboard/SearchInput";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { DashboardNotification } from "@/lib/types/cao-dashboard.types";

function getStatusTag(status: DashboardNotification["status"]) {
  const map: Record<string, { label: string; className: string }> = {
    pdf_generated: { label: "PDF Generated", className: "dash-notif-item-tag--generated" },
    failed: { label: "Failed", className: "dash-notif-item-tag--failed" },
    sent: { label: "Sent", className: "dash-notif-item-tag--sent" },
    pending: { label: "Pending", className: "dash-notif-item-tag--generated" },
  };
  const tag = map[status] ?? { label: status, className: "dash-notif-item-tag--generated" };
  return tag;
}

export default function NotificationsPage() {
  const notifications = useCAODashboardStore((s) => s.notifications);
  const notificationSummary = useCAODashboardStore((s) => s.notificationSummary);
  const notificationsLoading = useCAODashboardStore((s) => s.notificationsLoading);
  const fetchNotifications = useCAODashboardStore((s) => s.fetchNotifications);
  const fetchNotificationSummary = useCAODashboardStore((s) => s.fetchNotificationSummary);
  const markAllNotificationsRead = useCAODashboardStore((s) => s.markAllNotificationsRead);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchNotifications(search || undefined, typeFilter || undefined, statusFilter || undefined);
    fetchNotificationSummary();
  }, [fetchNotifications, fetchNotificationSummary, search, typeFilter, statusFilter]);

  return (
    <div className="dash-section">
      {/* Header */}
      <div className="dash-notif-header">
        <h1 className="dash-notif-title">Notification Center</h1>
        <div className="dash-notif-actions">
          <button
            className="dash-btn dash-btn--outline dash-btn--sm"
            onClick={() => {
              fetchNotifications(search || undefined, typeFilter || undefined, statusFilter || undefined);
              fetchNotificationSummary();
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="dash-btn dash-btn--ghost dash-btn--sm"
            onClick={markAllNotificationsRead}
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="dash-notif-filters">
        <div className="dash-notif-search">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search notifications..."
          />
        </div>
        <select
          className="dash-select"
          style={{ minWidth: 160 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Notification Type</option>
          <option value="award_letter_generated">Award Letter Generated</option>
          <option value="regret_email_failed">Regret Email Failed</option>
          <option value="regret_letters_sent">Regret Letters Sent</option>
          <option value="vendor_notified">Vendor Notified</option>
        </select>
        <select
          className="dash-select"
          style={{ minWidth: 120 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option value="pdf_generated">PDF Generated</option>
          <option value="failed">Failed</option>
          <option value="sent">Sent</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="dash-notif-page">
        {/* Main notification list */}
        <div>
          <div className="dash-notif-list-header">
            <span className="dash-notif-list-title">
              Recent Notifications{" "}
              <ChevronDown size={14} style={{ verticalAlign: "middle" }} />
            </span>
            <span className="dash-notif-list-links">
              <button className="dash-btn dash-btn--ghost dash-btn--sm" style={{ fontSize: "0.8rem" }}>
                All Notifications
              </button>
            </span>
          </div>

          {notificationsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Notifications will appear here once the backend is connected."
            />
          ) : (
            notifications.map((notif) => {
              const tag = getStatusTag(notif.status);
              return (
                <div key={notif.id} className="dash-notif-item">
                  <div
                    className={`dash-notif-dot ${notif.isRead ? "dash-notif-dot--read" : ""}`}
                  />
                  <div className="dash-notif-content">
                    <div className="dash-notif-item-title">
                      {notif.title}
                      <span className={`dash-notif-item-tag ${tag.className}`}>
                        {tag.label}
                      </span>
                    </div>
                    <div className="dash-notif-item-meta">
                      Tender ID: {notif.tenderId} · {notif.time} · By {notif.performedBy}
                    </div>
                    <div className="dash-notif-item-desc">{notif.message}</div>

                    {(notif.sentCount != null || notif.failedCount != null) && (
                      <div className="dash-notif-item-badges">
                        {notif.sentCount != null && (
                          <span className="dash-notif-count-badge dash-notif-count-badge--success">
                            {notif.sentCount} Sent
                          </span>
                        )}
                        {notif.failedCount != null && notif.failedCount > 0 && (
                          <span className="dash-notif-count-badge dash-notif-count-badge--failed">
                            {notif.failedCount} Failed
                          </span>
                        )}
                      </div>
                    )}

                    <div className="dash-notif-item-actions">
                      <button className="dash-btn dash-btn--outline dash-btn--sm">
                        <Eye size={12} /> View Details
                      </button>
                      {notif.status === "failed" && (
                        <button className="dash-btn dash-btn--primary dash-btn--sm">
                          <RotateCcw size={12} /> Retry Send
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary sidebar */}
        <div className="dash-notif-summary">
          <div className="dash-notif-summary-title">Summary</div>
          <div className="dash-notif-summary-date">
            {notificationSummary?.date ?? "—"}
          </div>

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Unread</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.unread ?? "—"}
            </div>
          </div>

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Failed Deliveries</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.failedDeliveries ?? "—"}
            </div>
          </div>

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Award Letters Generated</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.awardLettersGenerated ?? "—"}
            </div>
          </div>

          <div className="dash-notif-quick-actions">
            <div className="dash-notif-quick-title">Quick Actions</div>
            <ul className="dash-notif-quick-list">
              <li>
                <strong>Retry All Failed</strong> — Resend all failed notifications
              </li>
              <li>
                <strong>Export Logs</strong> — Download notification history
              </li>
              <li>
                <strong>Settings</strong> — Configure notification preferences
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
