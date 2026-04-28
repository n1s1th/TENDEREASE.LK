"use client";

import { X } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { DashboardTender } from "@/lib/types/officer-dashboard.types";

export default function CreateRecommendationNoteModal() {
  const activeModal = useOfficerDashboardStore((s) => s.activeModal);
  const modalData = useOfficerDashboardStore((s) => s.modalData);
  const closeModal = useOfficerDashboardStore((s) => s.closeModal);

  if (activeModal !== "create-recommendation") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={18} />
        </button>

        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: "1rem" }}>
          <h2 className="dash-modal-title" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Create Recommendation Note
          </h2>
        </div>

        <div className="dash-modal-body" style={{ padding: "0 2rem 2rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Tender ID
            </label>
            <input
              type="text"
              readOnly
              value={tender?.id ?? "T-1001"}
              className="dash-tab-search-input"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px", background: "var(--te-gray-7)" }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Selected Bidder
            </label>
            <input
              type="text"
              placeholder="ABC Pvt Ltd"
              className="dash-tab-search-input"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px", background: "var(--te-gray-7)" }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Final Evaluation Score
            </label>
            <input
              type="text"
              placeholder="e.g. 92%"
              className="dash-tab-search-input"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Award Value (LKR)
            </label>
            <input
              type="text"
              placeholder="e.g. 4,850,000"
              className="dash-tab-search-input"
              style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Justification / Recommendation
            </label>
            <textarea
              placeholder="Provide detailed justification for selecting the bidder..."
              className="dash-textarea"
              style={{ minHeight: "120px" }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
              Attach Supporting Documents
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              border: "1px solid var(--te-border)",
              borderRadius: "8px"
            }}>
              <label style={{
                background: "#333",
                color: "#fff",
                padding: "0.375rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer"
              }}>
                Choose File
                <input type="file" style={{ display: "none" }} />
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--te-gray-4)" }}>No file chosen</span>
            </div>
          </div>
        </div>

        <div className="dash-modal-footer" style={{ borderTop: "none", padding: "0 2rem 2rem", justifyContent: "flex-end", gap: "1rem" }}>
          <button
            className="dash-btn"
            style={{ background: "var(--te-gray-6)", color: "var(--te-gray-1)", fontWeight: 600 }}
            onClick={closeModal}
          >
            Save as Draft
          </button>
          <button
            className="dash-btn"
            style={{ background: "#333", color: "#fff", fontWeight: 600 }}
          >
            Submit to Approval Chain
          </button>
        </div>
      </div>
    </div>
  );
}
