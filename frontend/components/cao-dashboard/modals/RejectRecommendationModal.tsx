"use client";

import { useState } from "react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { X, AlertCircle } from "lucide-react";
import { Recommendation } from "@/lib/types/cao-dashboard.types";

export default function RejectRecommendationModal() {
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as { recommendation: Recommendation };
  const updateRecommendationStatus = useCAODashboardStore((s) => s.updateRecommendationStatus);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!modalData?.recommendation) return null;

  const rec = modalData.recommendation;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please enter a reason for rejection.");
      return;
    }
    await updateRecommendationStatus(rec.id, "REJECTED", reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn" onClick={closeModal}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors" onClick={closeModal}>
          <X size={24} />
        </button>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight flex items-center gap-2">
          Confirm Rejection?
        </h3>
        <p className="text-base text-slate-600 mb-4 font-medium leading-relaxed">
          Please provide a reason for rejecting the recommendation for <span className="text-slate-900 font-bold">{rec.bidderName}</span>.
        </p>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Please provide a clear explanation for the rejection..."
              className={`w-full min-h-[140px] p-5 rounded-xl border-2 transition-all duration-200 outline-none text-slate-700 font-medium leading-relaxed ${
                error ? "border-red-100 bg-red-50/30 focus:border-red-200" : "border-slate-200 bg-slate-50/30 focus:ring-4 focus:ring-[#953002]/10 focus:border-[#953002]"
              }`}
            />
            {error && (
              <div className="flex items-center gap-1.5 mt-2 ml-1 text-red-500 font-bold text-xs">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            className="flex-1 px-8 py-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-8 py-4 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border border-[#953002]"
            onClick={handleSubmit}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
