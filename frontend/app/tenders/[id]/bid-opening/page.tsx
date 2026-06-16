"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OpeningHeader from "@/components/bid-opening/OpeningHeader";
import OpeningBanner from "@/components/bid-opening/OpeningBanner";
import SchedulePanel from "@/components/bid-opening/SchedulePanel";
import OpeningActionPanel from "@/components/bid-opening/OpeningActionPanel";
import AttendanceSection from "@/components/bid-opening/AttendanceSection";
import ReceivedBidsLog from "@/components/bid-opening/ReceivedBidsLog";
import { useOpeningStore } from "@/store/opening/opening.store";
import TenderLayout from "@/components/tender/TenderLayout";
import { getTenders } from "@/services/tender.service";

const DEMO_SESSION = {
  id: "TND-0000-SESSION",
  tenderId: "TND-XXXX",
  tenderTitle: "TENDER OPENING SESSION",
  category: "UNSPECIFIED",
  division: "PROCUREMENT",
  status: "PENDING_OPENING" as const,
  scheduledOpeningTime: null as string | null,
  bidSubmissionDeadline: null as string | null,
  bidsCount: 0
};

export default function BidOpeningPage() {
  const params = useParams();
  const id = params?.id as string;
  const { session, fetchSession, fetchAttendance, isLoading } = useOpeningStore();
  const [tender, setTender] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      getTenders(0, 10, { keyword: id })
        .then((res) => {
          const content = res.content || res;
          const found = content.find((t: any) => t.tenderNumber === id);
          if (found) {
            setTender(found);
          }
        })
        .catch((err) => console.error("Error fetching tender by number:", err));
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
      <TenderLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F3F5F7]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#9A3B12] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading session data...</p>
          </div>
        </div>
      </TenderLayout>
    );
  }

  // If we still have no session (e.g., fetch failed and no demo desired), we show the demo anyway to fulfill user request
  const displaySession = activeSession || DEMO_SESSION;

  const deadline = tender?.closingDate || displaySession.bidSubmissionDeadline;

  return (
    <TenderLayout>
      <div className="min-h-screen bg-[#F3F5F7] p-8">
        <div className="max-w-[98%] mx-auto flex flex-col gap-8">
          <OpeningHeader
            tenderId={id || displaySession.tenderId}
            title={tender?.title || displaySession.tenderTitle || "Tender Opening Session"}
            category={tender?.procurementType || displaySession.category || "General"}
            division={displaySession.division || "Procurement"}
          />

          <OpeningBanner
            status={displaySession.status}
            scheduledTime={displaySession.scheduledOpeningTime}
            bidSubmissionDeadline={deadline}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SchedulePanel
              scheduledTime={displaySession.scheduledOpeningTime}
              bidSubmissionDeadline={deadline}
            />
            <OpeningActionPanel bidSubmissionDeadline={deadline} />
          </div>

          <AttendanceSection />
          <ReceivedBidsLog />
        </div>
      </div>
    </TenderLayout>
  );
}
