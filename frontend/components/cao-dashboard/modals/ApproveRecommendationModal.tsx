"use client";

import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { CheckCircle, X } from "lucide-react";
import { Recommendation } from "@/lib/types/cao-dashboard.types";

export default function ApproveRecommendationModal() {
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as { recommendation: Recommendation };
  const updateRecommendationStatus = useCAODashboardStore((s) => s.updateRecommendationStatus);

  if (!modalData?.recommendation) return null;

  const rec = modalData.recommendation;

  const handleApprove = async () => {
    await updateRecommendationStatus(rec.id, "APPROVED");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn" onClick={closeModal}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors" onClick={closeModal}>
          <X size={24} />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Approve Recommendation
        </h2>
        <p className="text-base text-slate-500 mb-8 font-medium">
          Are you sure you want to approve this recommendation for award?
        </p>

        <div className="space-y-6 mb-10">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Bidder</div>
            <div className="text-xl font-extrabold text-[#953002]">{rec.bidderName}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">
              Tender: {rec.tenderName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-black text-slate-900 leading-none">{rec.finalScore}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Final Score</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="text-xl font-bold text-[#953002] leading-none mt-1">
                Rs. {rec.recommendedValue.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Award Value</div>
            </div>
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
            className="flex-1 px-8 py-4 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#953002] active:scale-95"
            onClick={handleApprove}
          >
            <CheckCircle size={18} />
            Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );
}
