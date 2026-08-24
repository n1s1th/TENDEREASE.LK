"use client";

import { useState } from "react";
import { ArrowRight, Lock, Download, Trophy, SquarePen, FileText, Globe2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import QuickActionModal from "./QuickActionModal";

export default function QuickActions() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); 
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    { 
      label: "Create Tender", 
      icon: SquarePen,
      path: "https://www.tenderease.me/tender-templates"
    },
    { 
      label: "Open Bid Session", 
      icon: Lock,
      path: "#"
    },
    { 
      label: "Reports & Audit", 
      icon: Download,
      path: "/reports-and-audit"
    },
    { 
      label: "Awards Processing", 
      icon: Trophy,
      path: "/officer-dashboard/awards-processing"
    },
    {
      label: "Tender Clarifications",
      icon: MessageSquare,
      path: "/officer-dashboard/clarifications"
    },
    {
      label: "Global Q&A",
      icon: Globe2,
      path: "/officer-dashboard/qa"
    },
  ];

  const handleActionClick = (idx: number, label: string, path: string) => {
    setSelectedIdx(idx);
    if (label === "Awards Processing") {
      router.push("/officer-dashboard/awards-processing");
      return;
    }
    if (path !== "#") {
      if (path.startsWith("http")) {
        window.location.href = path;
      } else {
        router.push(path);
      }
    } else {
      setActiveModal(label);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400">Quick Actions</h3>
        </div>
        
        <div className="flex flex-col gap-2">
          {actions.map((action, idx) => {
            const isSelected = selectedIdx === idx;
            const Icon = action.icon;
            
            return (
              <button
                key={idx}
                onClick={() => handleActionClick(idx, action.label, action.path)}
                className={`group flex w-full items-center gap-5 rounded-lg px-6 py-2 text-left text-[14px] font-extrabold transition-all duration-200 ${
                  isSelected 
                    ? "bg-[#953002]/5 text-[#953002]"
                    : "bg-white text-[#2f3f55] hover:bg-gray-50 hover:text-[#953002]"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected ? "bg-white text-[#953002] shadow-sm" : "bg-[#f8fafc] text-[#9aa4b5] group-hover:text-[#953002]"
                  }`}>
                    <Icon className="w-4 h-4" />
                </span>
                <span className="leading-tight">{action.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#953002]" />
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
