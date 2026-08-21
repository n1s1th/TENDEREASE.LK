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
import { ArrowLeft, Loader2 } from "lucide-react";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { getTenders, getTenderById } from "@/services/tender.service";

const DEMO_SESSION = {
  id: "TND-0000-SESSION",
  tenderId: "TND-XXXX",
  tenderTitle: "",
  category: "UNSPECIFIED",
  division: "PROCUREMENT",
  status: "SCHEDULED" as const,
  scheduledOpeningTime: new Date().toISOString(),
  bidsCount: 0
};

const SEED_TENDERS_FALLBACK: Record<string, { title: string; tenderNumber: string; procurementType: string; departmentName: string }> = {
  "a1111111-1111-1111-1111-111111111111": {
    title: "Supply of Office Equipment for Ministry HQ",
    tenderNumber: "TND-2025-001",
    procurementType: "GOODS",
    departmentName: "Ministry HQ"
  },
  "a2222222-2222-2222-2222-222222222222": {
    title: "Road Rehabilitation - Colombo to Kandy A1 Section",
    tenderNumber: "TND-2025-002",
    procurementType: "WORKS",
    departmentName: "Road Development Authority"
  },
  "b1111111-1111-1111-1111-111111111111": {
    title: "IT Consultancy for Digital Transformation Project",
    tenderNumber: "TND-2025-003",
    procurementType: "SERVICES",
    departmentName: "Information Technology"
  },
  "b2222222-2222-2222-2222-222222222222": {
    title: "Medical Equipment Procurement - District Hospitals",
    tenderNumber: "TND-2025-004",
    procurementType: "GOODS",
    departmentName: "Health Services"
  },
  "c1111111-1111-1111-1111-111111111111": {
    title: "Security Guard Services for Government Buildings",
    tenderNumber: "TND-2025-005",
    procurementType: "SERVICES",
    departmentName: "Security & Administration"
  },
  "c2222222-2222-2222-2222-222222222222": {
    title: "Construction of Multi-Story Car Park - Government Complex",
    tenderNumber: "TND-2025-006",
    procurementType: "WORKS",
    departmentName: "Engineering Services"
  },
  "c3333333-3333-3333-3333-333333333333": {
    title: "Supply of Laboratory Chemicals and Reagents",
    tenderNumber: "TND-2025-007",
    procurementType: "GOODS",
    departmentName: "Laboratory & Research"
  },
  "d1111111-1111-1111-1111-111111111111": {
    title: "Annual Stationery Supply Contract",
    tenderNumber: "TND-2025-008",
    procurementType: "GOODS",
    departmentName: "Administration"
  },
  "d2222222-2222-2222-2222-222222222222": {
    title: "Janitorial Services for Central Government Complex",
    tenderNumber: "TND-2025-009",
    procurementType: "SERVICES",
    departmentName: "Maintenance & Operations"
  },
  "e1111111-1111-1111-1111-111111111111": {
    title: "Specialized Environmental Monitoring Equipment",
    tenderNumber: "TND-2025-010",
    procurementType: "GOODS",
    departmentName: "Environmental Authority"
  }
};

export default function BidOpeningPage() {
  const params = useParams();
  const id = params?.id as string;
  const { session, fetchSession, fetchAttendance, isLoading } = useOpeningStore();
  const [tender, setTender] = useState<any | null>(null);

  const fallbackTender = SEED_TENDERS_FALLBACK[id] || Object.values(SEED_TENDERS_FALLBACK).find(t => t.tenderNumber === id);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    if (id) {
      getTenderById(id)
        .then((res) => {
          if (res) {
            setTender(res);
          }
        })
        .catch((err) => {
          console.warn("Error fetching tender by ID direct:", err);
          // Fallback to searching by keyword/tender number
          getTenders(0, 10, { keyword: id })
            .then((res) => {
              const content = res.content || res.data?.content || res.data || res;
              const found = content.find((t: any) => t.tenderNumber === id || t.id === id);
              if (found) {
                setTender(found);
              }
            })
            .catch((err2) => console.warn("Error fetching tender by search:", err2));
        });
    }
  }, [id]);

  useEffect(() => {
    const tenderIdToFetch = tender?.id || (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null);
    if (!tenderIdToFetch) return;

    // Initial fetch (normal, shows loading spinner if needed)
    fetchSession(tenderIdToFetch);

    // Polling interval (silent, background fetch)
    const sessionInterval = setInterval(() => {
      fetchSession(tenderIdToFetch, true);
    }, 3000);

    return () => clearInterval(sessionInterval);
  }, [id, tender?.id, fetchSession]);

  useEffect(() => {
    if (!session?.id) return;

    // Initial fetch (normal, shows loading spinner if needed)
    fetchAttendance(session.id);

    // Polling interval (silent, background fetch)
    const attendanceInterval = setInterval(() => {
      fetchAttendance(session.id, true);
    }, 3000);

    return () => clearInterval(attendanceInterval);
  }, [session?.id, fetchAttendance]);

  // Fallback to demo data if not loading and no session found
  const activeSession = session || (isLoading ? null : DEMO_SESSION);

  if (isLoading && !activeSession) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">Loading Bid Opening and Attendance...</span>
        </div>
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
          <Link href="/tenders" className="flex items-center gap-2 hover:text-[#953002] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Tenders
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
            tenderId={tender?.tenderNumber || fallbackTender?.tenderNumber || id || displaySession.tenderId}
            title={tender?.title || fallbackTender?.title || (displaySession.tenderTitle === "TENDER OPENING SESSION" ? "" : displaySession.tenderTitle) || ""}
            category={tender?.procurementType || fallbackTender?.procurementType || displaySession.category || "General"}
            division={tender?.departmentName || fallbackTender?.departmentName || displaySession.division || "Procurement"}
          />

          <div className="pt-4">
            <OpeningBanner
              status={displaySession.status}
              scheduledTime={displaySession.scheduledOpeningTime}
              actualOpeningTime={displaySession.actualOpeningTime}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SchedulePanel
              status={displaySession.status}
              scheduledTime={displaySession.scheduledOpeningTime}
              actualOpeningTime={displaySession.actualOpeningTime}
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
