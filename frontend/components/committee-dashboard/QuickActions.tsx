"use client";

import { useState } from "react";
import { ArrowRight, Lock, FileText, Download, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import QuickActionModal from "./QuickActionModal";

export default function QuickActions() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0); 
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    { 
      label: "Open Bid Session", 
      icon: Lock,
      path: "/tenders/TND-2024-001/bid-opening"
    },
    { 
      label: "View Opening Records", 
      icon: FileText,
      path: "#" 
    },
    { 
      label: "Download Bid Documents", 
      icon: Download,
      path: "#"
    },
    { 
      label: "Committee Roster", 
      icon: Users,
      path: "#"
    },
    { 
      label: "System Settings", 
      icon: Settings,
      path: "#"
    },
  ];

  const handleActionClick = (idx: number, label: string, path: string) => {
    setSelectedIdx(idx);
    if (path !== "#") {
      router.push(path);
    } else {
      setActiveModal(label);
    }
  };

  // Branding Colors
  const activeBg = "bg-[#953002]/5";
  const activeText = "text-[#953002]";
  const activeBorder = "border-[#953002]/10";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Actions</h3>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {actions.map((action, idx) => {
            const isSelected = selectedIdx === idx;
            const Icon = action.icon;
            
            return (
              <button
                key={idx}
                onClick={() => handleActionClick(idx, action.label, action.path)}
                className={`w-full text-left group flex items-center justify-between px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 border ${
                  isSelected 
                    ? `${activeBg} ${activeText} ${activeBorder} shadow-sm translate-x-1`
                    : "text-gray-600 bg-white border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-white shadow-sm text-[#953002]' : 'bg-gray-50 text-gray-400 group-hover:text-[#953002]/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`tracking-tight transition-colors ${isSelected ? 'text-[#953002]' : 'group-hover:text-[#953002]'}`}>
                    {action.label}
                  </span>
                </div>
                <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                  isSelected ? `opacity-100 translate-x-0 ${activeText}` : "opacity-0 -translate-x-2 text-[#953002]"
                } group-hover:opacity-100 group-hover:translate-x-0`} />
              </button>
            );
          })}
        </div>
      </div>

      <QuickActionModal 
        type={activeModal}
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
