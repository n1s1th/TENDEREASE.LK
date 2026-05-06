"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { useEffect, useRef } from "react";

export default function SubNav() {
  const pathname = usePathname();
  const notificationSummary = useCAODashboardStore((s) => s.notificationSummary);
  const fetchNotificationSummary = useCAODashboardStore((s) => s.fetchNotificationSummary);
  const hasFetched = useRef(false);

  // Only fetch notification summary ONCE on first mount, never on tab switches
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      // Fire-and-forget: don't await, don't block rendering
      fetchNotificationSummary().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isTenders = pathname.startsWith("/cao-dashboard/tenders");
  const isRegistration = pathname.startsWith("/cao-dashboard/registration");
  const isRecommendations = pathname.startsWith("/cao-dashboard/recommendations");
  const isNotifications = pathname.startsWith("/cao-dashboard/notifications");

  const unreadCount = notificationSummary?.unread ?? 0;

  return (
    <div className="sticky top-0 z-20" id="dashboard-subnav">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-14 border-b border-slate-200/80">
        <div className="flex items-center gap-8 h-full">
          <Link
            href="/cao-dashboard/tenders/pending"
            className={`flex items-center h-full text-sm font-semibold tracking-wide transition-all border-b-2 px-2 ${
              isTenders 
                ? "border-[#953002] text-[#953002]" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Tenders
          </Link>
          <Link
            href="/cao-dashboard/recommendations/pending"
            className={`flex items-center h-full text-sm font-semibold tracking-wide transition-all border-b-2 px-2 ${
              isRecommendations 
                ? "border-[#953002] text-[#953002]" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Recommendation Notes
          </Link>
          <Link
            href="/cao-dashboard/registration"
            className={`flex items-center h-full text-sm font-semibold tracking-wide transition-all border-b-2 px-2 ${
              isRegistration 
                ? "border-[#953002] text-[#953002]" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Registration
          </Link>
        </div>

        <Link
          href="/cao-dashboard/notifications"
          className={`flex items-center gap-2 h-full text-sm font-semibold tracking-wide transition-all border-b-2 px-2 ${
            isNotifications 
              ? "border-[#953002] text-[#953002]" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bell size={18} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-2xs bg-[#953002] text-white font-bold rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
