"use client";

import { useEffect, useState, useRef } from "react";
import EvaluationKpiCards from "@/components/officer-dashboard/EvaluationKpiCards";
import QuickActions from "@/components/officer-dashboard/QuickActions";
import EvaluationStatusPanel from "@/components/officer-dashboard/EvaluationStatusPanel";
import AssignedTenderTable from "@/components/officer-dashboard/AssignedTenderTable";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import { useAuthStore } from "@/store";
import { Loader2, Bell } from "lucide-react";

export default function OfficerDashboardPage() {
  const { activeTendersCount, fetchDashboardMetrics } = useEvaluationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const { fetchDashboardNotifications } = await import('@/lib/api/officer-dashboard.api');
      const list = await fetchDashboardNotifications();
      setNotificationsList(list);
      setUnreadCount(list.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { markNotificationRead } = await import('@/lib/api/officer-dashboard.api');
      await markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics().finally(() => setLoading(false));
  }, [fetchDashboardMetrics]);

  if (loading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Officer Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div style={{ padding: "2.25rem 0 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }} className="w-full flex-col sm:flex-row sm:items-center">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ width: 4, height: 60, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }} className="shrink-0"></div>
            <div>
              <h1 style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "#1e293b",
                letterSpacing: "0.01em",
                margin: 0,
                lineHeight: 1.2
              }}>
                Officer Dashboard
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, margin: "0.6rem 0 0" }}>
                Centralized hub for secure bid openings and multi-criteria evaluation management.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE NOTIFICATION BELL */}
          <div style={{ position: "relative", marginLeft: "auto" }} ref={dropdownRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  height: 16,
                  minWidth: 16,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  border: "2px solid #fff"
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                width: 320,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e2e8f0",
                zIndex: 50,
                overflow: "hidden"
              }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={async () => {
                        const { markAllNotificationsRead } = await import('@/lib/api/officer-dashboard.api');
                        await markAllNotificationsRead();
                        loadNotifications();
                      }}
                      style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notificationsList.length === 0 ? (
                    <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      No new notifications
                    </div>
                  ) : (
                    notificationsList.slice(0, 8).map((notif: any) => (
                      <div 
                        key={notif.id}
                        style={{
                          padding: "1rem",
                          borderBottom: "1px solid #f1f5f9",
                          background: notif.isRead ? "#fff" : "#eff6ff",
                          display: "flex",
                          gap: "0.75rem",
                          cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                        onClick={() => {
                          handleMarkAsRead(notif.id);
                          window.location.href = notif.actionUrl;
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = notif.isRead ? "#f8fafc" : "#e0f2fe"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = notif.isRead ? "#fff" : "#eff6ff"; }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", background: notif.isRead ? "transparent" : "#3b82f6", marginTop: 6, flexShrink: 0
                        }}></div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{notif.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4 }}>{notif.message}</div>
                          <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>
                            {new Date(notif.time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: "0.75rem", borderTop: "1px solid #e2e8f0", textAlign: "center", background: "#f8fafc" }}>
                  <button onClick={() => setNotificationDropdownOpen(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm py-3.5 px-5 mb-6 border border-gray-100">
        <h2 className="text-[17px] font-black text-gray-900">Welcome Back, {user?.name || "Officer"}.</h2>
        <p className="text-[14px] text-gray-500 mt-0.5">
          You have {activeTendersCount} active tender{activeTendersCount !== 1 ? 's' : ''} requiring your attention today.
        </p>
      </div>

      <EvaluationKpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        <QuickActions />
        <EvaluationStatusPanel />
      </div>

      <AssignedTenderTable
        title="Approved Tenders"
        subtitle="Log of all officially approved and verified tenders."
      />
    </div>
  );
}
