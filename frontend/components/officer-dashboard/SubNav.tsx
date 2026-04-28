"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, FileText, MessageSquare } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";

export default function SubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useOfficerDashboardStore((s) => s.notifications);
  const notificationSummary = useOfficerDashboardStore((s) => s.notificationSummary);
  const fetchNotifications = useOfficerDashboardStore((s) => s.fetchNotifications);
  const fetchNotificationSummary = useOfficerDashboardStore((s) => s.fetchNotificationSummary);
  const markNotificationRead = useOfficerDashboardStore((s) => s.markNotificationRead);

  const isTenders = pathname.startsWith("/officer-dashboard/tenders");
  const isRegistration = pathname.startsWith("/officer-dashboard/registration");
  const isProcuments = pathname.startsWith("/officer-dashboard/procuments");
  const isClarifications = pathname.startsWith("/officer-dashboard/clarifications");
  const isNotifications = pathname.startsWith("/officer-dashboard/notifications");

  const unreadCount = notificationSummary?.unread ?? 0;

  // Initial fetch
  useEffect(() => {
    fetchNotificationSummary();
    fetchNotifications();
  }, [fetchNotificationSummary, fetchNotifications]);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationSummary]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function openNotification(id: string, actionUrl?: string, type?: string, tenderId?: string, clarificationId?: number) {
    await markNotificationRead(id);
    setOpen(false);
    // Route to clarification detail if applicable
    if (type?.toLowerCase().includes("clarification") && tenderId) {
      const clarId = clarificationId ?? actionUrl?.match(/clarifications\/(\d+)/)?.[1] ?? "1";
      router.push(`/officer-dashboard/clarifications/${tenderId}/${clarId}`);
    } else if (actionUrl) {
      router.push(actionUrl);
    } else {
      router.push("/officer-dashboard/notifications");
    }
  }

  const tabs = [
    { label: "Procuments", href: "/officer-dashboard/procuments", active: isProcuments },
    { label: "Tenders", href: "/officer-dashboard/tenders/pending", active: isTenders },
    { label: "Clarifications", href: "/officer-dashboard/clarifications", active: isClarifications },
  ];

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
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`dash-subnav-tab ${tab.active ? "dash-subnav-tab--active" : ""}`}
              style={tab.label === "Clarifications" ? { display: "inline-flex", alignItems: "center", gap: "0.35rem" } : undefined}
            >
              {tab.label === "Clarifications" && <MessageSquare size={14} />}
              {tab.label}
            </Link>
          ))}
        </div>

        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            type="button"
            className={`dash-subnav-tab ${isNotifications ? "dash-subnav-tab--active" : ""}`}
            style={{ paddingRight: 0, background: "transparent", border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            onClick={() => setOpen((value) => !value)}
            aria-label="Notifications"
          >
            <Bell size={16} />
            Notifications
            {unreadCount > 0 && (
              <span
                className="dash-notification-badge"
                style={{
                  marginLeft: "0.35rem",
                  minWidth: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  background: "#ef4444",
                  color: "#fff",
                  padding: "0 6px",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 48,
                zIndex: 50,
                width: 380,
                maxWidth: "calc(100vw - 2rem)",
                background: "#fff",
                border: "1px solid var(--te-border, #e2e8f0)",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
                overflow: "hidden",
              }}
            >
              {/* Dropdown header */}
              <div style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--te-border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--te-gray-7, #f8fafc)",
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--te-gray-1)" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>
                    {unreadCount} new
                  </span>
                )}
              </div>

              {notifications.slice(0, 5).length === 0 ? (
                <div style={{ padding: "1.5rem", color: "var(--te-gray-4)", fontSize: "0.85rem", textAlign: "center" }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(
                      notification.id,
                      notification.actionUrl,
                      notification.type,
                      notification.tenderId?.toString(),
                      notification.clarificationId
                    )}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "32px 1fr",
                      gap: "0.75rem",
                      padding: "0.85rem 1rem",
                      border: 0,
                      borderBottom: "1px solid var(--te-border, #f1f5f9)",
                      background: notification.isRead ? "#fff" : "#fafbff",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = notification.isRead ? "#fff" : "#fafbff"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "8px",
                      background: "#eff6ff", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {notification.type?.toLowerCase().includes("clarification")
                        ? <MessageSquare size={15} color="#2563eb" />
                        : <FileText size={15} color="#2563eb" />
                      }
                    </div>
                    <span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {!notification.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: 700, color: "var(--te-gray-1)", fontSize: "0.82rem" }}>
                          {notification.title}
                        </span>
                      </span>
                      {notification.tenderTitle && (
                        <span style={{ display: "block", marginTop: 3, color: "var(--te-gray-4)", fontSize: "0.78rem" }}>
                          {notification.tenderTitle}
                        </span>
                      )}
                      {notification.questionPreview && (
                        <span style={{ display: "block", marginTop: 3, color: "var(--te-gray-5)", fontSize: "0.78rem", fontStyle: "italic" }}>
                          &ldquo;{notification.questionPreview}&rdquo;
                        </span>
                      )}
                      <span style={{ display: "block", marginTop: 4, color: "var(--te-gray-4)", fontSize: "0.72rem" }}>
                        {notification.time}
                      </span>
                    </span>
                  </button>
                ))
              )}
              <Link
                href="/officer-dashboard/notifications"
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "0.7rem 1rem",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: "#2563eb",
                  textDecoration: "none",
                  borderTop: "1px solid var(--te-border, #e2e8f0)",
                  background: "var(--te-gray-7, #f8fafc)",
                }}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
