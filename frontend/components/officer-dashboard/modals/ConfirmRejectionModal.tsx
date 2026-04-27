"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";

export default function ConfirmRejectionModal() {
  const activeModal = useOfficerDashboardStore((s) => s.activeModal);
  const modalData = useOfficerDashboardStore((s) => s.modalData);
  const closeModal = useOfficerDashboardStore((s) => s.closeModal);
  const rejectTender = useOfficerDashboardStore((s) => s.rejectTender);
  const [reason, setReason] = useState("");

  if (activeModal !== "confirm-rejection") return null;

  const tenderId = modalData?.tenderId as string | undefined;

  const handleConfirm = () => {
    if (tenderId && reason.trim()) {
      rejectTender(tenderId, reason.trim());
      setReason("");
    }
  };

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--sm" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        <div className="dash-modal-header">
          <h2 className="dash-modal-title" style={{ fontSize: "1.125rem" }}>
            Confirm Rejection?
          </h2>
        </div>

        <div className="dash-modal-body">
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--te-gray-2)",
              marginBottom: "0.5rem",
            }}
          >
            Enter the reason for rejection
          </label>
          <textarea
            className="dash-textarea"
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="dash-modal-footer">
          <button
            className="dash-btn dash-btn--secondary"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm
          </button>
          <button className="dash-btn dash-btn--outline" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
