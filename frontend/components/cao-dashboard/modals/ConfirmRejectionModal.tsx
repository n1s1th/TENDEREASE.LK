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
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: 0, position: "relative" }}>
          <h2 className="dash-modal-title" style={{ width: "100%", textAlign: "center", fontSize: "1.5rem", marginTop: "1.5rem", fontWeight: 700 }}>
            Confirm Rejection?
          </h2>
          <button 
            className="dash-modal-close" 
            onClick={closeModal}
            style={{ position: "absolute", top: "1rem", right: "1rem" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="dash-modal-body" style={{ padding: "1.5rem 2.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--te-gray-2)",
              marginBottom: "0.75rem",
            }}
          >
            Enter the reason for rejection
          </label>
          <textarea
            className="dash-textarea"
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid var(--te-gray-2)",
              outline: "none",
              fontSize: "1rem"
            }}
          />
        </div>

        <div className="dash-modal-footer" style={{ borderTop: "none", padding: "0 2.5rem 2.5rem 2.5rem", display: "flex", gap: "1rem" }}>
          <button
            className="dash-btn"
            style={{ 
              flex: 1, 
              background: "#111827", 
              color: "#FFF", 
              fontWeight: 700, 
              height: "44px",
              borderRadius: "6px"
            }}
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm
          </button>
          <button 
            className="dash-btn"
            style={{ 
              flex: 1, 
              background: "#FFF", 
              border: "1px solid var(--te-border)", 
              color: "var(--te-gray-2)", 
              fontWeight: 700,
              height: "44px",
              borderRadius: "6px"
            }} 
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
