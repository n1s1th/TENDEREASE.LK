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

  return (
    <div className="mb-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-5">
          <div className="w-1 h-14 bg-[#953002] rounded-full mt-1 shadow-sm"></div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none mb-4">
              Bid Opening & Attendance
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <Link href="/officer-dashboard" className="hover:text-[#953002] transition-colors">OFFICER DASHBOARD</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{tenderId}</span>
              <ChevronRight className="w-3 h-3 text-[#953002]" />
              <span className="text-[#953002]">BID OPENING</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
