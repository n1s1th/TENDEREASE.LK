"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

export default function ConfirmRejectionModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as any;
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const rejectTender = useCAODashboardStore((s) => s.rejectTender);
  const [reason, setReason] = useState("");

  if (activeModal !== "confirm-rejection") return null;

  const tenderId = modalData?.tender?.id;

  const handleConfirm = () => {
    if (tenderId && reason.trim()) {
      rejectTender(tenderId, reason.trim());
      setReason("");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn" onClick={closeModal}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Confirm Rejection?
        </h3>
        
        <p className="text-base text-slate-600 mb-4 leading-relaxed">
          Enter the reason for rejection
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a clear explanation for the rejection..."
          rows={4}
          className="w-full p-4 rounded-xl border-2 border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-[#953002]/10 focus:border-[#953002] outline-none transition-all resize-none mb-8 font-sans"
        />

        <div className="flex items-center justify-end gap-4">
          <button
            className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md flex items-center gap-2 border border-[#953002]"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
