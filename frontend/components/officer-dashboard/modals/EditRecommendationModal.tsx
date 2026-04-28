"use client";

import { X, Upload, FileText } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { DashboardTender } from "@/lib/types/officer-dashboard.types";

export default function EditRecommendationModal() {
  const activeModal = useOfficerDashboardStore((s) => s.activeModal);
  const modalData = useOfficerDashboardStore((s) => s.modalData);
  const closeModal = useOfficerDashboardStore((s) => s.closeModal);

  if (activeModal !== "edit-recommendation") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={18} />
        </button>

        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <h2 className="dash-modal-title" style={{ fontSize: "1.75rem", textAlign: "center", width: "100%" }}>
            Edit Recommendation
          </h2>
        </div>

        <div className="dash-modal-body">
          {/* Rejection Reason Section */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Rejection Reason</h3>
            <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--te-gray-1)" }}>Rejected by CAO</span>
              <span style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", background: "var(--te-gray-6)", padding: "0.125rem 0.5rem", borderRadius: "4px" }}>Timestamp</span>
            </div>
            <div style={{
              background: "rgba(63, 134, 237, 0.03)",
              border: "1px dashed #3F86ED",
              borderRadius: "8px",
              padding: "1.5rem",
              fontSize: "0.875rem",
              color: "var(--te-gray-3)",
              lineHeight: 1.6
            }}>
              <p>Rejection Reason will appear here...(read-only)</p>
              <p style={{ marginTop: "0.5rem" }}>Example :<br />Insufficient technical justification.</p>
            </div>
          </div>

          {/* Editable Section */}
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.5rem" }}>Editable Section</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
                  Selected Bidder
                </label>
                <input
                  type="text"
                  placeholder="ABC Pvt Ltd"
                  className="dash-tab-search-input"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
                  Award Value
                </label>
                <input
                  type="text"
                  placeholder="LKR 4,850,000"
                  className="dash-tab-search-input"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--te-border)", borderRadius: "8px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
                Justification / Recommendation
              </label>
              <textarea
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="dash-textarea"
                style={{ minHeight: "100px" }}
              ></textarea>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.5rem" }}>
                Upload Revised Documents
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                border: "1px solid var(--te-border)",
                borderRadius: "8px",
                background: "#f9f9f9"
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
        </div>

        <div className="dash-modal-footer" style={{ borderTop: "none", justifyContent: "flex-end", gap: "1rem" }}>
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
            Resubmit to Approval Chain
          </button>
        </div>
      </div>
    </div>
  );
}
