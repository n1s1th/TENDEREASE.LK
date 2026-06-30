"use client";

import React from "react";

interface SchedulePanelProps {
  scheduledTime?: string;
}

export default function SchedulePanel({ scheduledTime }: SchedulePanelProps) {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const date = scheduledTime ? new Date(scheduledTime) : null;
  if (date) {
    date.setSeconds(0, 0);
  }
  const timeStr = date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00` : "--:--:--";
  const dateStr = date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-- --- ----";

  const curTimeStr = currentTime ? currentTime.toTimeString().split(' ')[0] : "--:--:--";
  const curDateStr = currentTime ? currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-- --- ----";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[14px] font-black text-gray-500 uppercase tracking-widest">Opening Schedule</h3>
        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">AUTO-SYNCED</span>
      </div>
      
      <div className="flex flex-1 items-stretch">
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5">SCHEDULED</span>
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
      
      <div className="mt-3 pt-2 border-t border-dashed border-gray-100">
        <p className="text-[12px] text-center font-medium text-gray-400 leading-tight px-2">
          Opening time is fixed once bids are received.
        </p>
      </div>
    </div>
  );
}
