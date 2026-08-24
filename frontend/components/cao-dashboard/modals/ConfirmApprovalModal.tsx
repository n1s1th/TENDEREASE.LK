"use client";

import { X } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

export default function ConfirmApprovalModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as any;
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const approveTender = useCAODashboardStore((s) => s.approveTender);

  if (activeModal !== "confirm-approval") return null;

  const tender = modalData?.tender;
  const tenderId = tender?.id;

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn" onClick={closeModal}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Approve Tender
        </h3>
        
        <p className="text-base text-slate-600 mb-8 leading-relaxed">
          Are you sure you want to approve this tender?
        </p>
        
        <div className="flex items-center justify-end gap-4">
          <button
            className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md flex items-center gap-2 border border-[#953002]"
            onClick={() => {
              if (tenderId) approveTender(tenderId);
            }}
          >
            Yes, Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );
}
