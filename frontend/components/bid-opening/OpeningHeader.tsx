"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface OpeningHeaderProps {
  tenderId: string;
  title: string;
  category: string;
  division: string;
}

import { useOpeningStore } from "@/store/opening/opening.store";

export default function OpeningHeader({ tenderId, title, category, division }: OpeningHeaderProps) {
  const { session } = useOpeningStore();
    const scheduledDate = session?.scheduledOpeningTime 
    ? new Date(session.scheduledOpeningTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() 
    : "-- ---";
  const bidsCount = session?.bidsCount !== undefined ? `${session.bidsCount} BIDS` : "-- BIDS";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-end">
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
              Bid Opening & Attendance
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
              <Link href="/committee-dashboard" className="hover:text-[#953002] transition-colors">COMMITTEE DASHBOARD</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{tenderId} — {title}</span>
              <ChevronRight className="w-3 h-3 text-[#953002]" />
              <span className="text-[#953002]">BID OPENING</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">SESSION DATA</span>
            <div className="flex gap-3">
              <span className="bg-[#F8F9FA] text-gray-400 text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100 italic">DATA UNAVAILABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
