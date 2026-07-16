"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Lock, UserCheck, X, Eye, EyeOff, ShieldCheck, AlertTriangle, Check, HelpCircle } from "lucide-react";

import { useOpeningStore } from "@/store/opening/opening.store";
import { getTenderById } from "@/services/tender.service";

interface OpeningActionPanelProps {
  bidSubmissionDeadline?: string | null;
}

export default function OpeningActionPanel({ bidSubmissionDeadline }: OpeningActionPanelProps) {
  const { session, attendance, startOpening, isLoading } = useOpeningStore();
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isTenderClosed, setIsTenderClosed] = React.useState(false);

  React.useEffect(() => {
    const checkTenderStatus = async () => {
      if (!session?.tenderId) return;
      try {
        const tenderData = await getTenderById(session.tenderId);
        if (tenderData && (tenderData.status === "CLOSED" || tenderData.status === "COMPLETED")) {
          setIsTenderClosed(true);
        }
      } catch (err) {
        console.error("Error checking tender status in OpeningActionPanel:", err);
      }
    };
    checkTenderStatus();
  }, [session?.tenderId]);

  const canOpen = attendance.length >= 3 && (!session || (session.status as any) === 'SCHEDULED' || (session.status as any) === 'PENDING_OPENING');

  const [isUnlockModalOpen, setIsUnlockModalOpen] = React.useState(false);
  const [pin, setPin] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [isPinError, setIsPinError] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenBids = () => {
    if (!canOpen) {
      showToast(`Quorum not met: ${attendance.length}/3 members present.`, "warning");
      return;
    }
    setIsUnlockModalOpen(true);
  };

  const handleConfirmUnlock = async () => {
    if (!canOpen) {
      showToast("Quorum not met. Minimum 3 members required.", "warning");
      return;
    }
    
    if (pin === "ABC123") {
      // Use actual session ID if available, otherwise a fallback for demo
      await startOpening(session?.id || "TND-0000-SESSION");
      setIsUnlockModalOpen(false);
      setPin("");
      setIsPinError(false);
    } else {
      setIsPinError(true);
    }
  };

  const isOpen = session?.status === 'OPEN';
  const isClosed = session?.status === 'CLOSED' || isTenderClosed;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[14px] font-black text-gray-500 uppercase tracking-widest">
          BID OPENING ACTION
        </h3>
        <span className="text-[#953002] bg-orange-50 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest shrink-0">
          CHAIR ONLY
        </span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <p className="text-[13px] font-medium text-gray-500 leading-snug mb-4 max-w-[280px]">
          Clicking "Open Bids" will unseal all bids and log the timestamp.
        </p>
        
        <button 
          onClick={handleOpenBids}
          disabled={isOpen || isClosed}
          className={`w-full max-w-[280px] py-4 rounded-[20px] flex flex-col items-center justify-center gap-2 group transition-all duration-300 border ${
            isClosed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-transparent'
              : isOpen
                ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20 cursor-default border-transparent'
                : !canOpen
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-transparent'
                  : 'bg-[#953002]/5 text-[#953002] border-[#953002]/10 hover:bg-[#953002]/10 hover:scale-102 active:scale-98'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isClosed ? 'bg-gray-200' : isOpen ? 'bg-white/20' : !canOpen ? 'bg-gray-200' : 'bg-[#953002]/10 group-hover:bg-[#953002]/20'
          }`}>
            {isClosed ? <Lock className="w-4 h-4 text-gray-400" /> : isOpen ? <ShieldCheck className="w-4 h-4 text-white" /> : <Lock className={`w-4 h-4 transition-colors ${canOpen ? 'text-[#953002]' : 'text-gray-600'}`} />}
          </div>
          <span className="text-[14px] font-black tracking-[0.15em] uppercase">
            {isLoading 
              ? "UNLOCKING BIDS..." 
              : isClosed 
                ? "BIDS CLOSED" 
                : isOpen 
                  ? "BIDS OPEN" 
                  : "UNLOCK BIDS"
            }
          </span>
        </button>
      </div>
      
      <div className="mt-4">
        <div className="w-full py-2 border border-gray-200 rounded-xl flex items-center justify-center gap-2 bg-gray-50">
          <UserCheck className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">REQUIRES CHAIR CREDENTIALS</span>
        </div>
      </div>

      {/* Unlock PIN Modal */}
      {mounted && isUnlockModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#953002]" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Unlock Received Bids</h3>
              </div>
              <button 
                onClick={() => setIsUnlockModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6 pt-4">
              <p className="text-[13px] font-medium text-gray-500 leading-relaxed mb-6 text-center">
                Authorised credentials are required to unseal all submissions. This action will log your identity and timestamp the event.
              </p>

              <div className="space-y-2 relative group px-2">
                <label className="text-[11px] font-black text-gray-900 ml-1 uppercase tracking-widest flex items-center gap-2">
                  Chair / Deputy Chair PIN
                </label>
                <div className="relative">
                  <input 
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (isPinError) setIsPinError(false);
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-[#F9FAFB] border rounded-[16px] px-[16px] py-[14px] text-[15px] font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all pr-12 focus:ring-2 ${
                      isPinError ? 'border-[#EB5757] focus:ring-[#EB5757]/20' : 'border-gray-200 focus:ring-[#953002]/20 focus:border-[#953002]'
                    }`}
                    style={isPinError ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isPinError && (
                  <p className="text-[11px] text-[#EB5757] font-bold ml-1">Incorrect PIN. Try again</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsUnlockModalOpen(false)}
                className="flex-1 px-3 py-2.5 rounded-[12px] font-black text-[11px] tracking-widest uppercase border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-900 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmUnlock}
                disabled={pin.length < 4 || isLoading}
                className={`flex-[1.5] px-3 py-2.5 rounded-[12px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#953002]/10 ${
                  !canOpen 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#953002]/5 text-[#953002] hover:bg-[#953002]/10'
                } disabled:opacity-50`}
              >
                Confirm & Unlock
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && toast && createPortal(
        <div className={`fixed top-6 right-6 w-max max-w-[90vw] whitespace-nowrap z-[100000] flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl shadow-md border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-white border-[#27AE60]/30 text-[#27AE60]" :
          toast.type === "error" ? "bg-[#FFF5F5] border-[#EB5757]/30 text-red-750" :
          toast.type === "warning" ? "bg-[#FFF5F5] border-[#EB5757]/30 text-[#EB5757]" :
          "bg-white border-blue-200 text-blue-800"
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === "success" && <Check className="w-5 h-5 text-[#27AE60]" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-[#EB5757]" />}
            {toast.type === "info" && <HelpCircle className="w-5 h-5 text-[#3B82F6]" />}
            <span className="text-[13px] font-bold tracking-tight">{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            className={`ml-4 p-0.5 rounded-lg hover:bg-black/5 transition-colors ${
              toast.type === "success" ? "text-[#27AE60]/60 hover:text-[#27AE60]" :
              toast.type === "error" ? "text-red-750/60 hover:text-red-750" :
              toast.type === "warning" ? "text-[#EB5757]/60 hover:text-[#EB5757]" :
              "text-blue-800/60 hover:text-blue-800"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
