"use client";

import React from "react";

import { useOpeningStore } from "@/store/opening/opening.store";

export default function OverviewPanel() {
  const { session, attendance } = useOpeningStore();

  const stats = [
    { label: "BIDS SEALED", value: session?.bidsCount?.toString() || "0", sub: "Awaiting unlock" },
    { label: "ATTENDANCE LOGGED", value: attendance.length.toString(), sub: "Members present" },
    { label: "OPENING STATUS", value: session?.status === 'PENDING_OPENING' ? "Pending Opening" : (session?.status || "Pending"), sub: session?.status === 'OPEN' ? "Session Active" : "Not yet commenced", highlight: true },
    { label: "REPORT GENERATED", value: "\u00A0", sub: "Pending" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-widest mb-3">Session Overview</h3>
      
      <div className="grid grid-cols-2 gap-2 flex-1">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-2.5 flex flex-col justify-center">
            <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className={`text-[15px] font-black uppercase tracking-tight ${stat.highlight ? 'text-[#953002]' : 'text-gray-900'}`}>
              {stat.value}
            </span>
            <span className="text-[14px] font-bold text-gray-600 mt-0.5">{stat.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
