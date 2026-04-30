"use client";

import React from "react";
import { Package, Hash, CheckCircle2 } from "lucide-react";

export default function OverviewPanel() {
  const stats = [
    {
      label: "Bids Sealed",
      value: "0",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Bids Opened",
      value: "0",
      icon: Hash,
      color: "text-[#9A3B12]",
      bg: "bg-[#9A3B12]/5"
    },
    {
      label: "Opening Status",
      value: "Pending Opening",
      icon: CheckCircle2,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
      <h3 className="text-[15px] font-bold text-gray-900 mb-6 uppercase tracking-wider">Session Overview</h3>
      
      <div className="flex flex-col gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
