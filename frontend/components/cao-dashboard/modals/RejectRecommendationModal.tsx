"use client";

import { useState } from "react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { X } from "lucide-react";
import { DashboardTender, Recommendation } from "@/lib/types/cao-dashboard.types";

export default function RejectRecommendationModal() {
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as { tender?: DashboardTender; recommendation?: Recommendation };
  const showToast = useCAODashboardStore((s) => s.showToast);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!modalData?.tender) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please enter a reason for cancellation.");
      return;
    }
    // In a real app this would call an API with the reason
    showToast("success", "Recommendation rejected successfully.");
    closeModal();
  };

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <h2 className="dash-modal-title" style={{ width: "100%", textAlign: "center", fontSize: "1.25rem", marginTop: "1rem" }}>
            Confirm Rejection?
          </h2>
          <button className="dash-modal-close" onClick={closeModal} style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <X size={20} />
          </button>
        </div>

        <div className="dash-modal-body" style={{ padding: "1.5rem 2rem" }}>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--te-gray-2)", marginBottom: "0.5rem" }}>
              Enter the reason for rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Reason"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "0.75rem",
                borderRadius: "6px",
                border: error ? "1px solid var(--te-error)" : "1px solid var(--te-border)",
                resize: "vertical",
                fontSize: "0.9rem",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
            {error && <div style={{ color: "var(--te-error)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{error}</div>}
          </div>

        </div>

        <div className="dash-modal-footer" style={{ display: "flex", gap: "1rem", paddingTop: 0, paddingBottom: "2rem", paddingLeft: "2rem", paddingRight: "2rem", borderTop: "none" }}>
          <button
            onClick={closeModal}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "#FFF", border: "1px solid var(--te-border)", color: "var(--te-gray-2)", fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "#111827", color: "#FFF", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
