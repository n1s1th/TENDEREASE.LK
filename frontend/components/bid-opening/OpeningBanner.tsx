"use client";

import React from "react";
import { Clock } from "lucide-react";

import { OpeningStatus } from "@/lib/types/opening.types";

interface OpeningBannerProps {
  status: OpeningStatus;
  scheduledTime?: string;
}

export default function OpeningBanner({ status, scheduledTime }: OpeningBannerProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00"
  });

  React.useEffect(() => {
    if (!scheduledTime) return;

    const targetDate = new Date(scheduledTime);
    
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
  }, [scheduledTime]);

  const isStarted = status === 'OPEN';
  const isClosed = status === 'CLOSED';

  return (
    <div className={`border rounded-3xl p-4 flex items-center justify-between shadow-sm transition-all ${
      isStarted ? 'bg-[#FFF9E6] border-[#FFB401]/30' : 'bg-[#F5F5F5] border-[#4F4F4F]/30'
    }`}>
      <div className="flex items-center gap-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isStarted ? 'bg-[#FFB401]/10 text-[#FFB401]' : 'bg-[#4F4F4F]/10 text-[#4F4F4F]'
        }`}>
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-base font-black ${isStarted ? 'text-[#FFB401]' : 'text-[#4F4F4F]'}`}>
            {isStarted ? "Bid opening session is active" : isClosed ? "Bid opening has concluded" : "Bid opening has not yet commenced"}
          </h3>
          <p className={`${isStarted ? 'text-[#FFB401]/80' : 'text-[#4F4F4F]/80'} text-xs font-medium mt-0.5`}>
            {isStarted ? "Bids are currently being unsealed and verified by the committee." : 
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
            <div className={`${isStarted ? 'bg-[#FFB401] shadow-lg shadow-[#FFB401]/20' : 'bg-[#1A1D1F]'} text-white rounded-xl px-3 py-2 min-w-[60px] flex flex-col items-center transition-colors duration-500`}>
              <span className="text-xl font-black leading-none mb-0.5 tracking-tighter">{item.value}</span>
              <span className="text-[8px] font-black tracking-widest leading-none opacity-60">{item.label}</span>
            </div>
            {idx < 3 && <span className={`${isStarted ? 'text-[#FFB401]' : 'text-[#1A1D1F]'} text-xl font-black transition-colors duration-500`}>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
