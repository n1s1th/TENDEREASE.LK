"use client";

import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { CheckCircle, X } from "lucide-react";
import { DashboardTender, Recommendation } from "@/lib/types/cao-dashboard.types";

export default function ApproveRecommendationModal() {
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as { tender?: DashboardTender; recommendation?: Recommendation };
  const showToast = useCAODashboardStore((s) => s.showToast);

  if (!modalData?.tender) return null;

  const handleApprove = () => {
    // In a real app this would call an API
    showToast("success", "Recommendation approved successfully.");
    closeModal();
  };

  const tender = modalData.tender;
  const rec = modalData.recommendation;

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <h2 className="dash-modal-title" style={{ width: "100%", textAlign: "center", fontSize: "1.25rem", marginTop: "1rem" }}>
            Are you sure you want to approve this recommendation?
          </h2>
          <button className="dash-modal-close" onClick={closeModal} style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <X size={20} />
          </button>
        </div>

        <div className="dash-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem 2rem" }}>
          
          <div style={{ background: "#FDF8F4", padding: "1rem", borderRadius: "8px", border: "1px solid var(--te-border)" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--te-gray-4)", marginBottom: "0.25rem" }}>Selected Bidder</div>
            <div style={{ fontWeight: 700, color: "var(--te-gray-1)", fontSize: "1.1rem" }}>{rec?.bidderName || "Tech Solutions Ltd."}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--te-gray-3)", marginTop: "0.25rem" }}>
              Bid ID: {rec?.bidId || "BID-0041-003"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#FFF", padding: "1rem", borderRadius: "8px", border: "1px solid var(--te-border)", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--te-gray-1)", lineHeight: 1 }}>{rec?.finalScore || "87.4"}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", textTransform: "uppercase", marginTop: "0.5rem", fontWeight: 600 }}>Final Score</div>
            </div>
            <div style={{ background: "#FFF", padding: "1rem", borderRadius: "8px", border: "1px solid var(--te-border)", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--te-primary)", lineHeight: 1, marginTop: "0.5rem" }}>
                Rs. {rec?.recommendedValue.toLocaleString() || "4,850,000"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", textTransform: "uppercase", marginTop: "0.5rem", fontWeight: 600 }}>Award Value</div>
            </div>
          </div>

        </div>

        <div className="dash-modal-footer" style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={closeModal}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "#FFF", border: "1px solid var(--te-border)", color: "var(--te-gray-2)", fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "var(--te-primary)", color: "#111827", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            Yes, approve
          </button>
        </div>
      </div>
    </div>
  );
}
