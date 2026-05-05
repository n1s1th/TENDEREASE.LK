"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";

export default function SubNav() {
  const pathname = usePathname();
  const notificationSummary = useOfficerDashboardStore((s) => s.notificationSummary);

  const isTenders = pathname.startsWith("/officer-dashboard/tenders");
  const isRegistration = pathname.startsWith("/officer-dashboard/registration");
  const isNotifications = pathname.startsWith("/officer-dashboard/notifications");

  const unreadCount = notificationSummary?.unread ?? 0;

  return (
    <div className="dash-subnav" id="dashboard-subnav">
      {/* Same max-width container as home page navbar */}
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
          <Link
            href="/officer-dashboard/tenders/pending"
            className={`dash-subnav-tab ${isTenders ? "dash-subnav-tab--active" : ""}`}
          >
            Tenders
          </Link>
          <Link
            href="/officer-dashboard/registration"
            className={`dash-subnav-tab ${isRegistration ? "dash-subnav-tab--active" : ""}`}
          >
            Registration
          </Link>
        </div>

        <Link
          href="/officer-dashboard/notifications"
          className={`dash-subnav-tab ${isNotifications ? "dash-subnav-tab--active" : ""}`}
          style={{ paddingRight: 0 }}
        >
          <Bell size={16} style={{ marginRight: '0.25rem' }} />
          Notification Center
          {unreadCount > 0 && (
            <span className="dash-notification-badge" style={{ marginLeft: '0.5rem' }}>{unreadCount}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
