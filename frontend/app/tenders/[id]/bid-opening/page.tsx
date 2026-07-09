"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OpeningHeader from "@/components/bid-opening/OpeningHeader";
import OpeningBanner from "@/components/bid-opening/OpeningBanner";
import SchedulePanel from "@/components/bid-opening/SchedulePanel";
import OverviewPanel from "@/components/bid-opening/OverviewPanel";
import OpeningActionPanel from "@/components/bid-opening/OpeningActionPanel";
import AttendanceSection from "@/components/bid-opening/AttendanceSection";
import ReceivedBidsLog from "@/components/bid-opening/ReceivedBidsLog";
import { useOpeningStore } from "@/store/opening/opening.store";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { getTenders, getTenderById } from "@/services/tender.service";

const DEMO_SESSION = {
  id: "TND-0000-SESSION",
  tenderId: "TND-XXXX",
  tenderTitle: "TENDER OPENING SESSION",
  category: "UNSPECIFIED",
  division: "PROCUREMENT",
  status: "SCHEDULED" as const,
  scheduledOpeningTime: new Date().toISOString(),
  bidsCount: 0
};

export default function BidOpeningPage() {
  const params = useParams();
  const id = params?.id as string;
  const { session, fetchSession, fetchAttendance, isLoading } = useOpeningStore();
  const [tender, setTender] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      getTenderById(id)
        .then((res) => {
          if (res) {
            setTender(res);
          }
        })
        .catch((err) => {
          console.error("Error fetching tender by ID direct:", err);
          // Fallback to searching by keyword/tender number
          getTenders(0, 10, { keyword: id })
            .then((res) => {
              const content = res.content || res.data?.content || res.data || res;
              const found = content.find((t: any) => t.tenderNumber === id || t.id === id);
              if (found) {
                setTender(found);
              }
            })
            .catch((err2) => console.error("Error fetching tender by search:", err2));
        });
    }
  }, [id]);

  useEffect(() => {
    if (tender?.id) {
      fetchSession(tender.id);
    } else if (id && id.length > 10) {
      fetchSession(id);
    }
  }, [id, tender?.id, fetchSession]);

  useEffect(() => {
    if (session?.id) {
      fetchAttendance(session.id);
    }
  }, [session?.id, fetchAttendance]);

  // Fallback to demo data if not loading and no session found
  const activeSession = session || (isLoading ? null : DEMO_SESSION);

  if (isLoading && !activeSession) {
    return (
      <div className="bg-white min-h-screen text-gray-900 font-inter flex flex-col">
        <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-6 text-sm font-bold text-gray-500 whitespace-nowrap">
            <Link href="/officer-dashboard" className="flex items-center gap-2 hover:text-[#953002] transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Officer Dashboard
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Session</span>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#9A3B12] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading session data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we still have no session (e.g., fetch failed and no demo desired), we show the demo anyway to fulfill user request
  const displaySession = activeSession || DEMO_SESSION;

  const deadline = tender?.closingDate || (displaySession as any).bidSubmissionDeadline;

  return (
    <div className="bg-white min-h-screen text-gray-900 font-inter flex flex-col">
      {/* --- Breadcrumbs / Sub-Navigation --- */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500 whitespace-nowrap">
          <Link href="/officer-dashboard" className="flex items-center gap-2 hover:text-[#953002] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Officer Dashboard
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      {/* --- Main Content Section --- */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-10">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          <OpeningHeader
            tenderId={tender?.tenderNumber || id || displaySession.tenderId}
            title={tender?.title || displaySession.tenderTitle || "Tender Opening Session"}
            category={tender?.procurementType || displaySession.category || "General"}
            division={tender?.departmentName || displaySession.division || "Procurement"}
          />

          <div className="pt-4">
            <OpeningBanner
              status={displaySession.status}
              scheduledTime={displaySession.scheduledOpeningTime}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SchedulePanel
              scheduledTime={displaySession.scheduledOpeningTime}
            />
            <OpeningActionPanel bidSubmissionDeadline={deadline} />
          </div>

          <AttendanceSection />
          <ReceivedBidsLog />
        </div>
      </main>

      <Footer />
    </div>
  );
}
