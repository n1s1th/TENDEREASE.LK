"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Bell, CheckCircle, XCircle, FileText, UserPlus, ChevronDown, Filter, Trophy } from "lucide-react";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { DashboardNotification, DashboardNotificationType } from "@/lib/types/cao-dashboard.types";
import { useRouter } from "next/navigation";

const typeIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  tender_submitted: { icon: <FileText size={16} />, color: "#3b82f6", label: "Pending Tenders" },
  officer_registered: { icon: <UserPlus size={16} />, color: "#8b5cf6", label: "Registration Received" },
  recommendation_received: { icon: <Bell size={16} />, color: "#10b981", label: "Recommendation Notes Received" },
  awards_notification: { icon: <Trophy size={16} />, color: "#FFB401", label: "Awards Notifications" },
  general: { icon: <Bell size={16} />, color: "#6b7280", label: "General" },
};

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  info: { bg: "#dbeafe", text: "#1e40af", label: "Info" },
  success: { bg: "#d1fae5", text: "#065f46", label: "Success" },
  warning: { bg: "#fef3c7", text: "#92400e", label: "Warning" },
  pending: { bg: "#e0e7ff", text: "#3730a3", label: "Pending" },
};

function formatTime(isoString: string) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationsPage() {
  const notifications = useCAODashboardStore((s) => s.notifications);
  const notificationSummary = useCAODashboardStore((s) => s.notificationSummary);
  const notificationsLoading = useCAODashboardStore((s) => s.notificationsLoading);
  const fetchNotifications = useCAODashboardStore((s) => s.fetchNotifications);
  const fetchNotificationSummary = useCAODashboardStore((s) => s.fetchNotificationSummary);
  const markAllNotificationsRead = useCAODashboardStore((s) => s.markAllNotificationsRead);
  const markNotificationRead = useCAODashboardStore((s) => s.markNotificationRead);
  const setRegistrationSearch = useCAODashboardStore((s) => s.setRegistrationSearch);
  const setRegistrationStatusFilter = useCAODashboardStore((s) => s.setRegistrationStatusFilter);
  const setSearchQuery = useCAODashboardStore((s) => s.setSearchQuery);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSummary();
  }, [fetchNotifications, fetchNotificationSummary]);

  // Filter notifications by type
  const filtered = typeFilter === "all"
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  const handleNotificationClick = (notif: DashboardNotification) => {
    markNotificationRead(notif.id);
    if (notif.type === "recommendation_received") {
      setSearchQuery(notif.targetId || "");
      router.push("/cao-dashboard/recommendations/pending");
    } else if (notif.targetId) {
      if (notif.type === "tender_submitted") {
        const refId = encodeURIComponent(notif.targetId.replace(/\//g, "-"));
        router.push(`/cao-dashboard/tenders/${refId}/review`);
      } else if (notif.type === "officer_registered") {
        setRegistrationSearch(notif.targetId);
        setRegistrationStatusFilter("ALL");
        router.push(`/cao-dashboard/registration`);
      }
    }
  };

  return (
    <div className="dash-section">
      {/* Header */}
      <div className="dash-notif-header">
        <h1 className="dash-notif-title">Notification Center</h1>
        <div className="dash-notif-actions">
          <button
            className="dash-btn dash-btn--outline dash-btn--sm"
            onClick={() => { fetchNotifications(); fetchNotificationSummary(); }}
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

      {/* Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <Filter size={14} style={{ color: "var(--te-gray-4)" }} />
        <select
          className="dash-select"
          style={{ minWidth: 200 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Notification Types</option>
          <option value="tender_submitted">Pending Tenders</option>
          <option value="officer_registered">Registration Received</option>
          <option value="recommendation_received">Recommendation Notes Received</option>
          <option value="awards_notification">Awards Notifications</option>
        </select>
      </div>

      <div className="dash-notif-page">
        {/* Main notification list */}
        <div>
          <div className="dash-notif-list-header">
            <span className="dash-notif-list-title">
              Recent Notifications{" "}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--te-gray-4)" }}>
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {notificationsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Notifications will appear here when you approve, reject tenders or officer registrations."
            />
          ) : (
            filtered.map((notif) => {
              const typeInfo = typeIcons[notif.type] || typeIcons.general;
              const badge = statusBadge[notif.status] || statusBadge.info;
              return (
                <div
                  key={notif.id}
                  className="dash-notif-item hover:bg-slate-50/80 hover:shadow-sm transition-all duration-200"
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    cursor: "pointer",
                    opacity: 1,
                    borderLeft: notif.isRead ? "4px solid #e2e8f0" : "4px solid #953002",
                    paddingLeft: "1rem"
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `${typeInfo.color}15`, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: typeInfo.color, flexShrink: 0,
                  }}>
                    {typeInfo.icon}
                  </div>
                  <div className="dash-notif-content" style={{ flex: 1 }}>
                    <div className="dash-notif-item-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {notif.title}
                      <span style={{
                        background: badge.bg, color: badge.text,
                        padding: "0.15rem 0.5rem", borderRadius: 10,
                        fontSize: "0.65rem", fontWeight: 600,
                      }}>
                        {badge.label}
                      </span>
                      {!notif.isRead && (
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#3b82f6", display: "inline-block",
                        }} />
                      )}
                    </div>
                    <div className="dash-notif-item-desc">{notif.message}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--te-gray-4)", marginTop: "0.25rem" }}>
                      {formatTime(notif.time)}
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

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Unread</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.unread ?? 0}
            </div>
          </div>

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Today</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.totalToday ?? 0}
            </div>
          </div>

          <div className="dash-notif-summary-stat">
            <div className="dash-notif-summary-label">Pending Actions</div>
            <div className="dash-notif-summary-value">
              {notificationSummary?.pendingActions ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
