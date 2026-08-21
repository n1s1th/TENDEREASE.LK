"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";

export default function SubNav() {
  const pathname = usePathname();
  const notificationSummary = useOfficerDashboardStore((s) => s.notificationSummary);
  const fetchNotificationSummary = useOfficerDashboardStore((s) => s.fetchNotificationSummary);

  useEffect(() => {
    fetchNotificationSummary();
  }, [fetchNotificationSummary]);

  const isClarifications = pathname.startsWith("/officer-dashboard/clarifications");
  const isQa = pathname.startsWith("/officer-dashboard/qa");
  const isNotifications = pathname.startsWith("/officer-dashboard/notifications");

  const unreadCount = notificationSummary?.unread ?? 0;

  return (
    <div className="dash-subnav" id="dashboard-subnav">
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        <div className="dash-subnav-tabs">
          {(isQa || isClarifications || isNotifications) && (
            <Link
              href="/officer-dashboard"
              className="dash-subnav-tab"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--te-gray-3)" }}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>&larr;</span>
              Back to Dashboard
            </Link>
          )}
        </div>

        <Link
          href="/officer-dashboard/notifications"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: isNotifications ? "var(--te-primary-light, #fff5f0)" : "transparent",
            color: isNotifications ? "var(--te-primary)" : "var(--te-gray-3)",
            transition: "all 0.2s ease",
            textDecoration: "none"
          }}
          title="Notifications"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--te-primary-light, #fff5f0)";
            e.currentTarget.style.color = "var(--te-primary)";
          }}
          onMouseLeave={(e) => {
            if (!isNotifications) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--te-gray-3)";
            }
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#ef4444",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 700,
              minWidth: "16px",
              height: "16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px #fff"
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
