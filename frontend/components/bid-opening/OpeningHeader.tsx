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
          <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-1.5">
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
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-2.5 flex flex-col items-center">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1.5">SESSION DATA</span>
            <div className="flex gap-2">
              <span className="bg-[#EBF1F4] text-[#4F626C] text-[12px] font-black px-2.5 py-1 rounded uppercase">{bidsCount}</span>
              <span className="bg-[#EBF1F4] text-[#4F626C] text-[12px] font-black px-2.5 py-1 rounded uppercase">{scheduledDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
