"use client";

import { useState, useEffect } from "react";
import { X, Lock, FileText, Download, Users, Settings, Shield } from "lucide-react";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import { useRouter } from "next/navigation";

interface QuickActionModalProps {
  type: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionModal({ type, isOpen, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [selectedTenderId, setSelectedTenderId] = useState<string>("");

  const { assignedTenders, fetchAssignedTenders } = useEvaluationStore();

  useEffect(() => {
    if (isOpen && (type === "Open Bid Session" || type === "Download Bid Documents")) {
      fetchAssignedTenders();
      setSelectedTenderId("");
    }
  }, [isOpen, type, fetchAssignedTenders]);

  if (!isOpen || !type) return null;

  const fallbackTenders = [
    { id: "TND-2024-001", reference: "TND-2024-001", title: "Supply & Delivery of Enterprise Servers", status: "PENDING_OPENING" },
    { id: "TND-2024-002", reference: "TND-2024-002", title: "Development of National Procurement Portal", status: "PENDING_OPENING" },
    { id: "TND-2024-003", reference: "TND-2024-003", title: "Implementation of Cloud Security Framework", status: "OPEN" },
  ];

  const tendersList = (assignedTenders && assignedTenders.length > 0) ? assignedTenders : fallbackTenders;

  const getContent = () => {
    switch (type) {
      case "Open Bid Session":
        return {
          icon: <Lock className="w-5 h-5 text-[#953002]" />,
          title: "Secure Bid Opening",
          desc: "Initialize a new bid opening session. Select an approved tender to begin.",
          primaryAction: "Start Session",
          extra: (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Select Approved Tender</label>
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {tendersList.map((tender) => {
                  const isSelected = selectedTenderId === tender.id;
                  return (
                    <button
                      key={tender.id}
                      type="button"
                      onClick={() => setSelectedTenderId(tender.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1.5 border ${
                        isSelected
                          ? "bg-orange-50/40 border-[#953002] ring-1 ring-[#953002]/20"
                          : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border ${
                          isSelected
                            ? "text-[#953002] bg-white border-[#953002]/20"
                            : "text-[#953002] bg-orange-50 border-orange-100/50"
                        }`}>
                          {tender.reference || (tender as any).tenderNo || tender.id}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          {tender.status}
                        </span>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-gray-955 font-extrabold' : 'text-gray-700'}`}>
                        {tender.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        };
      case "View Opening Records":
        return {
          icon: <FileText className="w-5 h-5 text-[#953002]" />,
          title: "Opening Logs",
          desc: "Review the historical records of previously opened bid sessions.",
          primaryAction: "View Full Logs",
          extra: (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recent Records</label>
              <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-700">TR-2024-00{i}</p>
                    <p className="text-[10px] text-gray-400">12 May 2026</p>
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case "Download Bid Documents":
        return {
          icon: <Download className="w-5 h-5 text-[#953002]" />,
          title: "Document Export",
          desc: "Export active bid documents and technical specifications. Select a tender to begin.",
          primaryAction: "Download ZIP",
          extra: (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Select Tender</label>
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {tendersList.map((tender) => {
                  const isSelected = selectedTenderId === tender.id;
                  return (
                    <button
                      key={tender.id}
                      type="button"
                      onClick={() => setSelectedTenderId(tender.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1.5 border ${
                        isSelected
                          ? "bg-orange-50/40 border-[#953002] ring-1 ring-[#953002]/20"
                          : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border ${
                          isSelected
                            ? "text-[#953002] bg-white border-[#953002]/20"
                            : "text-[#953002] bg-orange-50 border-orange-100/50"
                        }`}>
                          {tender.reference || (tender as any).tenderNo || tender.id}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          {tender.status}
                        </span>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-gray-955 font-extrabold' : 'text-gray-700'}`}>
                        {tender.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        };
      case "Committee Roster":
        return {
          icon: <Users className="w-5 h-5 text-[#953002]" />,
          title: "Member Directory",
          desc: "View and manage the assigned committee members for current projects.",
          primaryAction: "Manage Roster",
          extra: (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Committee Roster</label>
              <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {[
                  { name: "Dr. Sarah Jenkins", role: "Chair / Evaluator" },
                  { name: "John Doe", role: "Technical Officer" },
                  { name: "Mrs. Priyanthi Perera", role: "Financial Advisor" },
                  { name: "Mr. Amal Silva", role: "Procurement Specialist" },
                  { name: "Miss Dharshani de Silva", role: "Secretary" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900">{member.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case "System Settings":
        return {
          icon: <Settings className="w-5 h-5 text-[#953002]" />,
          title: "Dashboard Config",
          desc: "Adjust your workspace preferences, notifications, and display settings.",
          primaryAction: "Save Changes",
          extra: (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                <span>Real-time Updates</span>
                <button 
                  onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-[#953002]/20 ${isRealtimeEnabled ? 'bg-[#953002]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRealtimeEnabled ? 'left-[1.125rem]' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  const isPrimaryDisabled = (type === "Open Bid Session" || type === "Download Bid Documents") && !selectedTenderId;
  const hasPrimaryButton = type !== "View Opening Records" && type !== "Committee Roster";

  const handlePrimaryAction = () => {
    if (type === "Open Bid Session") {
      if (!selectedTenderId) return;
      router.push(`/tenders/${selectedTenderId}/bid-opening`);
      onClose();
    } else if (type === "Download Bid Documents") {
      if (!selectedTenderId) return;
      alert(`Downloading documents for tender ${selectedTenderId} in ZIP format...`);
      onClose();
    } else {
      alert(`Action: ${content.primaryAction} triggered!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#953002]/10 rounded-md">
              {content.icon}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quick Action</span>
          </div>
          
          <h2 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight">{content.title}</h2>
          <p className="text-gray-500 text-xs font-medium mt-2 leading-relaxed">
            {content.desc}
          </p>

          {content.extra}

          <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose}
              className={`${hasPrimaryButton ? "flex-1" : "w-full"} py-3 px-4 rounded-xl border border-gray-200 font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:bg-gray-50 transition-all`}
            >
              Cancel
            </button>
            {hasPrimaryButton && (
              <button 
                disabled={isPrimaryDisabled}
                className={`flex-[1.5] py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                  isPrimaryDisabled
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-[#953002]/5 text-[#953002] border-[#953002]/10 hover:bg-[#953002]/10"
                }`}
                onClick={handlePrimaryAction}
              >
                {content.primaryAction}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
