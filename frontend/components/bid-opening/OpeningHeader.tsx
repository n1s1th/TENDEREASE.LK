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
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-4">
            Bid Opening & Attendance
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/committee-dashboard" className="hover:text-[#953002] transition-colors">COMMITTEE DASHBOARD</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{tenderId} — {title}</span>
            <ChevronRight className="w-3 h-3 text-[#953002]" />
            <span className="text-[#953002]">BID OPENING</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-white border border-gray-100 rounded-2xl px-10 py-5 flex flex-col items-center shadow-sm">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3">SESSION DATA</span>
            <div className="flex gap-3">
              <span className="bg-[#F8F9FA] text-gray-400 text-[13px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest border border-gray-100 italic">DATA UNAVAILABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
