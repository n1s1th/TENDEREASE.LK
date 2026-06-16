"use client";

import { useState, useEffect } from "react";
import { X, Lock, FileText, Download, Trophy, ArrowRight, Loader2, FileDown } from "lucide-react";
import { getTendersForOpening, getOpeningLogs, getTendersWithBids, getTendersPendingAward } from "@/lib/api/officer.api";
import { useRouter } from "next/navigation";

interface QuickActionModalProps {
  type: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionModal({ type, isOpen, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [tenders, setTenders] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tendersWithBids, setTendersWithBids] = useState<any[]>([]);
  const [tendersPendingAward, setTendersPendingAward] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === "Open Bid Session") {
        const fetchTenders = async () => {
          setIsLoading(true);
          try {
            const res = await getTendersForOpening();
            setTenders(res.data);
          } catch (error) {
            console.error("Failed to fetch tenders for opening:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTenders();
      } else if (type === "View Opening Records") {
        const fetchLogs = async () => {
          setIsLoading(true);
          try {
            const res = await getOpeningLogs();
            setLogs(res.data);
          } catch (error) {
            console.error("Failed to fetch opening logs:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchLogs();
      } else if (type === "Download Bid Documents") {
        const fetchTendersWithBids = async () => {
          setIsLoading(true);
          try {
            const res = await getTendersWithBids();
            setTendersWithBids(res.data);
          } catch (error) {
            console.error("Failed to fetch tenders with bids:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTendersWithBids();
      } else if (type === "Award Processing") {
        const fetchTendersPendingAward = async () => {
          setIsLoading(true);
          try {
            const res = await getTendersPendingAward();
            setTendersPendingAward(res.data);
          } catch (error) {
            console.error("Failed to fetch tenders pending award:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTendersPendingAward();
      }
    }
  }, [isOpen, type]);
  
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case "Open Bid Session":
        return {
          icon: <Lock className="w-5 h-5 text-[#953002]" />,
          title: "Select Tender",
          desc: "Choose a tender from the list below to initialize a secure bid opening session.",
          primaryAction: "Close",
          extra: (
            <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading Tenders...</p>
                </div>
              ) : tenders.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-medium text-gray-400">No tenders ready for opening</p>
                </div>
              ) : (
                tenders.map((tender) => (
                  <div key={tender.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-[#953002]/20 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#953002] uppercase tracking-wider truncate">{tender.tenderNo}</p>
                        <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{tender.title}</p>
                      </div>
                      <button 
                        onClick={() => {
                          onClose();
                          router.push(`/tenders/${tender.tenderNo}/bid-opening`);
                        }}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-[#953002] hover:text-white rounded-lg transition-all"
                        title="Open Session"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
            <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading Logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-medium text-gray-400">No historical logs found</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#953002]/20 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-gray-700 uppercase tracking-tighter">{log.tenderNo}</p>
                      <p className="text-[10px] font-bold text-gray-400">{log.openingDate}</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-900 mt-1 truncate">{log.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#953002] bg-[#953002]/5 px-1.5 py-0.5 rounded border border-[#953002]/10">
                        {log.category}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        };
      case "Download Bid Documents":
        return {
          icon: <Download className="w-5 h-5 text-[#953002]" />,
          title: "Document Export",
          desc: "Select a tender to export all its bid documents and technical specifications in bulk.",
          primaryAction: "Close",
          extra: (
            <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading Tenders...</p>
                </div>
              ) : tendersWithBids.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-medium text-gray-400">No tenders with bids found</p>
                </div>
              ) : (
                tendersWithBids.map((tender) => (
                  <div key={tender.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-[#953002]/20 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#953002] uppercase tracking-wider truncate">{tender.tenderNo}</p>
                        <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{tender.title}</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{tender.category}</p>
                      </div>
                      <button 
                        onClick={() => {
                          alert(`Downloading all bid documents for ${tender.tenderNo} as ZIP...`);
                        }}
                        className="p-2.5 bg-orange-50 text-[#953002] hover:bg-[#953002] hover:text-white rounded-lg transition-all border border-orange-100/50"
                        title="Download ZIP"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        };
      case "Award Processing":
        return {
          icon: <Trophy className="w-5 h-5 text-[#953002]" />,
          title: "Award Finalization",
          desc: "Review final evaluation scores and process formal award letters to successful bidders.",
          primaryAction: "Close",
          extra: (
            <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading Tenders...</p>
                </div>
              ) : tendersPendingAward.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs font-medium text-gray-400">No tenders pending award found</p>
                </div>
              ) : (
                tendersPendingAward.map((tender) => (
                  <div key={tender.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-[#953002]/20 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#953002] uppercase tracking-wider truncate">{tender.tenderNo}</p>
                        <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{tender.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#953002] bg-[#953002]/5 px-1.5 py-0.5 rounded border border-[#953002]/10">
                            {tender.category}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          onClose();
                          router.push(`/officer-dashboard/tenders/${tender.tenderNo}/award`);
                        }}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-[#953002] hover:text-white rounded-lg transition-all"
                        title="Process Award"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
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

          <div className="mt-8 flex">
            <button 
              className="flex-1 py-3 px-4 rounded-xl bg-[#953002]/5 text-[#953002] border border-[#953002]/10 font-bold text-[10px] uppercase tracking-widest hover:bg-[#953002]/10 transition-all flex items-center justify-center gap-2"
              onClick={() => {
                if (content.primaryAction === "Close") {
                  onClose();
                } else {
                  alert(`Action: ${content.primaryAction} triggered!`);
                  onClose();
                }
              }}
            >
              {content.primaryAction}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
