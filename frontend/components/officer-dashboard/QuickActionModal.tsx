"use client";

import { useState, useEffect } from "react";
import { X, Lock, FileText, Download, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  getTendersForOpening, 
  getOpeningLogs, 
  getTendersWithBids,
  getTendersPendingAward
} from "@/lib/api/officer.api";

interface QuickActionModalProps {
  type: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionModal({ type, isOpen, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [selectedTenderId, setSelectedTenderId] = useState<string>("");
  const [tendersList, setTendersList] = useState<any[]>([]);
  const [openingLogsList, setOpeningLogsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase().replace(/_/g, " ");
    if (s.includes("PENDING") || s === "APPROVED" || s === "PUBLISHED") {
      return (
        <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#953002] border border-[#953002]/15">
          {s}
        </span>
      );
    }
    if (s === "COMPLETED" || s === "EVALUATED" || s === "AWARDED" || s === "CLOSED") {
      const displayText = s === "COMPLETED" ? "EVALUATION COMPLETED" : s;
      return (
        <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          {displayText}
        </span>
      );
    }
    if (s === "OPEN") {
      return (
        <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {s}
        </span>
      );
    }
    if (s === "EVALUATION") {
      return (
        <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E2B93B]/10 text-[#E2B93B] border border-[#E2B93B]/20">
          {s}
        </span>
      );
    }
    return (
      <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        {s}
      </span>
    );
  };

  useEffect(() => {
    if (!isOpen || !type) return;

    window.dispatchEvent(new CustomEvent("quick-modal-open"));

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (type === "Open Bid Session") {
          const res = await getTendersForOpening();
          const list = (res.data || []).filter(
            (tender: any) =>
              tender.status === "PENDING_OPENING" ||
              tender.status === "PUBLISHED"
          );
          setTendersList(list);
        } else if (type === "Reports & Audit") {
          const res = await getTendersWithBids();
          setTendersList(res.data || []);
        } else if (type === "View Opening Records") {
          const res = await getOpeningLogs();
          setOpeningLogsList(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load quick action data", err);
        setTendersList([]);
        setOpeningLogsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setSelectedTenderId("");
  }, [isOpen, type]);

  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case "Open Bid Session":
        return {
          icon: <Lock className="w-5 h-5 text-[#953002]" />,
          title: "Open Bid Session",
          desc: "Initialize a new bid opening session. Select an approved tender to begin.",
          primaryAction: "Start Session",
          extra: (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-900 ml-1 uppercase tracking-widest block mb-1.5">Select Approved Tender</label>
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-5 h-5 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : tendersList.length === 0 ? (
                  <p className="text-xs italic text-gray-400 text-center py-8">No approved tenders available...</p>
                ) : (
                  tendersList.map((tender) => {
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
                          <span className="font-mono text-[11.5px] font-black text-[#953002]">
                            {tender.tenderNo || tender.reference || tender.id}
                          </span>
                          {renderStatusBadge(tender.status)}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-gray-955 font-extrabold' : 'text-gray-700'}`}>
                          {tender.title}
                        </span>
                      </button>
                    );
                  })
                )}
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
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-900 ml-1 uppercase tracking-widest block mb-1.5">Recent Records</label>
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="w-5 h-5 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : openingLogsList.length === 0 ? (
                  <p className="text-xs italic text-gray-400 text-center py-4">No records found...</p>
                ) : (
                   openingLogsList.map((log) => (
                    <div key={log.id} className="w-full text-left px-4 py-3 rounded-xl flex flex-col gap-1.5 border bg-gray-50/50 border-gray-100">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-mono text-[11.5px] font-black text-[#953002]">
                          {log.tenderNo}
                        </span>
                        {renderStatusBadge(log.status)}
                      </div>
                      <div className="flex justify-between items-end gap-2 mt-0.5">
                        <span className="text-[13px] font-bold text-gray-700 truncate max-w-[70%]">
                          {log.title}
                        </span>
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider shrink-0">
                          {log.openingDate}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        };
      case "Reports & Audit":
        return {
          icon: <Download className="w-5 h-5 text-[#953002]" />,
          title: "Reports & Audit",
          desc: "View the completed bid report, evaluation report, and audit logs. Select a tender to begin.",
          primaryAction: "View Reports",
          extra: (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-900 ml-1 uppercase tracking-widest block mb-1.5">Select Tender</label>
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-5 h-5 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : tendersList.length === 0 ? (
                  <p className="text-xs italic text-gray-400 text-center py-8">No tenders available...</p>
                ) : (
                  tendersList.map((tender) => {
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
                          <span className="font-mono text-[11.5px] font-black text-[#953002]">
                            {tender.tenderNo || tender.reference || tender.id}
                          </span>
                          {renderStatusBadge(tender.status)}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-gray-955 font-extrabold' : 'text-gray-700'}`}>
                          {tender.title}
                        </span>
                      </button>
                    );
                  })
                )}
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

  const isPrimaryDisabled = (type === "Open Bid Session" || type === "Reports & Audit") && !selectedTenderId;
  const hasPrimaryButton = type !== "View Opening Records";

  const handlePrimaryAction = () => {
    if (type === "Open Bid Session") {
      if (!selectedTenderId) return;
      router.push(`/tenders/${selectedTenderId}/bid-opening`);
      onClose();
    } else if (type === "Reports & Audit") {
      if (!selectedTenderId) return;
      const tender = tendersList.find(t => t.id === selectedTenderId);
      const tenderNo = tender ? (tender.tenderNo || tender.reference || tender.id) : "";
      router.push(`/reports-and-audit?tenderId=${selectedTenderId}&tenderNo=${tenderNo}`);
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
        className="bg-white rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="py-4 px-6 border-b border-gray-50 bg-[#F9FAFB] flex justify-between items-center rounded-t-[32px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 text-[#953002] flex items-center justify-center shrink-0">
              {content.icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">{content.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-normal pr-4">{content.desc}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {content.extra}

          {hasPrimaryButton && (
            <div className="mt-8">
              <button 
                disabled={isPrimaryDisabled}
                className={`w-full py-3 px-4 rounded-[16px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                  isPrimaryDisabled
                    ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                    : "bg-[#953002] text-white border-transparent hover:bg-[#802801] shadow-lg shadow-[#953002]/20"
                }`}
                onClick={handlePrimaryAction}
              >
                {content.primaryAction}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
