"use client";

import React from "react";

import { OpeningStatus } from "@/lib/types/opening.types";

interface SchedulePanelProps {
  status: OpeningStatus;
  scheduledTime?: string;
  actualOpeningTime?: string;
}

export default function SchedulePanel({ status, scheduledTime, actualOpeningTime }: SchedulePanelProps) {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const baseDateStr = (status === 'OPEN' || status === 'CLOSED') && actualOpeningTime 
    ? actualOpeningTime 
    : scheduledTime;

  const date = baseDateStr ? new Date(baseDateStr) : null;
  if (date) {
    // Evaluation deadline is 15 days from scheduled or actual opening time
    date.setDate(date.getDate() + 15);
  }

  const isSessionActive = status === 'OPEN' || status === 'CLOSED';
  const timeStr = !isSessionActive 
    ? "TBA" 
    : (mounted && date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}` : "--:--:--");
    
  const dateStr = !isSessionActive 
    ? "To be announced" 
    : (mounted && date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-- --- ----");

  const curTimeStr = mounted && currentTime ? currentTime.toTimeString().split(' ')[0] : "--:--:--";
  const curDateStr = mounted && currentTime ? currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-- --- ----";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[14px] font-black text-gray-500 uppercase tracking-widest">Opening Schedule</h3>
        <span className="text-[#953002] bg-orange-50 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest shrink-0">AUTO-SYNCED</span>
      </div>
      
      <div className="flex flex-1 items-stretch">
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 text-center">EVALUATION DEADLINE</span>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">{timeStr}</span>
          <span className="text-[13px] font-bold text-gray-500 mt-0.5">{dateStr}</span>
        </div>
        
        <div className="w-[2px] bg-[#953002] rounded-full mx-1.5 my-1.5 opacity-60" />
        
        <div className="flex-1 flex flex-col items-center justify-center pl-3">
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CURRENT</span>
          <span className="text-3xl font-black text-[#953002] tracking-tighter">{curTimeStr}</span>
          <span className="text-[13px] font-bold text-gray-500 mt-0.5">{curDateStr}</span>
        </div>
      </div>
      
    </div>
  );
}
