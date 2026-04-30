"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import QuickActionModal from "./QuickActionModal";

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    { label: "Open Bid Session", isHighlight: true },
    { label: "View Opening Records", isHighlight: false },
    { label: "Download Bid Documents", isHighlight: false },
    { label: "Committee Roster", isHighlight: false },
    { label: "System Settings", isHighlight: false },
  ];

  const handleActionClick = (label: string) => {
    setActiveAction(label);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 text-gray-800">
        QUICK ACTIONS
      </h3>
      <div className="flex flex-col gap-2 mt-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleActionClick(action.label)}
            className={`w-full text-left group flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
              action.isHighlight
                ? "bg-orange-50 text-[#9A3B12] font-semibold hover:bg-orange-100/50"
                : "text-gray-700 hover:bg-gray-50 hover:pl-5"
            }`}
          >
            <span>{action.label}</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
              action.isHighlight ? "text-[#9A3B12] group-hover:translate-x-1" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
            }`} />
          </button>
        ))}
      </div>

      <QuickActionModal 
        type={activeAction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
