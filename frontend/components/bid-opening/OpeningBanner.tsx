"use client";

import React from "react";
import { Clock, ShieldCheck } from "lucide-react";

import { OpeningStatus } from "@/lib/types/opening.types";

interface OpeningBannerProps {
  status: OpeningStatus;
  scheduledTime?: string | null;
  bidSubmissionDeadline?: string | null;
}

export default function OpeningBanner({ status, scheduledTime, bidSubmissionDeadline }: OpeningBannerProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00"
  });

  const isStarted = status === 'OPEN';
  const isClosed = status === 'CLOSED';

  // Use deadline for countdown when session is open, otherwise use scheduled time
  const countdownTarget = isStarted ? bidSubmissionDeadline : scheduledTime;

  React.useEffect(() => {
    if (!countdownTarget) return;

    const targetDate = new Date(countdownTarget);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", mins: "00", secs: "00" });
        return;
      }
      
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        mins: m.toString().padStart(2, '0'),
        secs: s.toString().padStart(2, '0')
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [countdownTarget]);

  return (
    <div className={`border rounded-3xl p-4 flex items-center justify-between shadow-sm transition-all duration-500 ${
      isStarted ? `bg-[#FFF7ED] border-[#953002]/30` : 'bg-[#F5F5F5] border-[#4F4F4F]/30'
    }`}>
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isStarted ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' : 'bg-[#4F4F4F]/10 text-[#4F4F4F]'
        }`}>
          {isStarted ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
        </div>
        <div>
          <h3 className={`text-[16px] font-black transition-colors duration-500 ${isStarted ? 'text-[#953002]' : 'text-[#4F4F4F]'}`}>
            {isStarted ? "Bid opening session is officially active" : isClosed ? "Bid opening has concluded" : "Bid opening has not yet commenced"}
          </h3>
          <p className={`${isStarted ? 'text-[#953002]/80' : 'text-[#4F4F4F]/80'} text-[13px] font-medium mt-0.5`}>
            {isStarted ? "Bids are being received. Countdown shows time remaining until submission closes." : 
             `The "Open Bids" action will become available only at the scheduled opening time.`}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {[
          { label: "DAYS", value: timeLeft.days },
          { label: "HOURS", value: timeLeft.hours },
          { label: "MINS", value: timeLeft.mins },
          { label: "SECS", value: timeLeft.secs }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className={`transition-all duration-700 ${
              isStarted ? 'bg-[#953002] shadow-lg shadow-[#953002]/20' : 'bg-[#1A1D1F]'
            } text-white rounded-2xl px-4 py-3 min-w-[65px] flex flex-col items-center`}>
              <span className="text-2xl font-black leading-none mb-1 tracking-tighter">{item.value}</span>
              <span className="text-[9px] font-black tracking-widest leading-none opacity-60">{item.label}</span>
            </div>
            {idx < 3 && <span className={`${isStarted ? 'text-[#953002]' : 'text-[#1A1D1F]'} text-2xl font-black transition-colors duration-500`}>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
