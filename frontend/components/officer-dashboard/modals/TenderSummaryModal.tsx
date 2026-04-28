"use client";

import { X, Calendar, DollarSign, Building2, Clock, Check, Circle, Plus, MessageSquare, FileEdit } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import type { DashboardTender, ApprovalStep } from "@/lib/types/officer-dashboard.types";

export default function TenderSummaryModal() {
  const activeModal = useOfficerDashboardStore((s) => s.activeModal);
  const modalData = useOfficerDashboardStore((s) => s.modalData);
  const closeModal = useOfficerDashboardStore((s) => s.closeModal);
  const openModal = useOfficerDashboardStore((s) => s.openModal);

  if (activeModal !== "tender-summary") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;
  const timeline = (modalData?.timeline as ApprovalStep[]) ?? [];

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "850px" }}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={20} />
        </button>

        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: "1.5rem" }}>
          <h2 className="dash-modal-title" style={{ fontSize: "1.75rem", textAlign: "center", width: "100%", fontWeight: 700 }}>
            Tender Summary
          </h2>
          <p style={{ textAlign: "center", width: "100%", fontSize: "1.125rem", fontWeight: 600, color: "var(--te-gray-1)", marginTop: "0.5rem" }}>
            {tender?.title ?? "Title of The Tender"}
          </p>
        </div>

        <div className="dash-modal-body" style={{ padding: "0 2.5rem 2.5rem" }}>
          {/* Top KPI Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar size={24} style={{ color: "var(--te-gray-1)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600 }}>Closing Date</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{tender?.closingDate ?? "N/A"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <DollarSign size={24} style={{ color: "var(--te-gray-1)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600 }}>Estimated Budget</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{tender?.estimatedBudget ? `RS.${tender.estimatedBudget.toLocaleString()}` : "N/A"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Building2 size={24} style={{ color: "var(--te-gray-1)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600 }}>Department</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{tender?.department ?? "N/A"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Clock size={24} style={{ color: "var(--te-gray-1)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600 }}>Status</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{tender?.status ?? "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="dash-eval-header" style={{ textAlign: "center", background: "none", borderBottom: "1px solid var(--te-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            Evaluation Summary
          </div>

          {/* Score Breakdown Table */}
          <div style={{ border: "1px solid var(--te-border)", borderRadius: "8px", overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--te-gray-7)", padding: "0.75rem 1rem", borderBottom: "1px solid var(--te-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Score Breakdown Table and Ranking — Sorted by Composite Score</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", border: "1px solid var(--te-border)", borderRadius: "4px" }}>
                  <option>Sort: Final Score</option>
                </select>
                <button style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", border: "1px solid var(--te-border)", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                   Filter
                </button>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--te-gray-4)", borderBottom: "1px solid var(--te-border-light)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Rank</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Bidder</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Technical Score <span style={{ fontWeight: 400 }}>/50</span></th>
                  <th style={{ padding: "0.75rem 1rem" }}>Financial Score <span style={{ fontWeight: 400 }}>/50</span></th>
                  <th style={{ padding: "0.75rem 1rem" }}>Composite Score <span style={{ fontWeight: 400 }}>/100</span></th>
                  <th style={{ padding: "0.75rem 1rem" }}>Compliance</th>
                  <th style={{ padding: "0.75rem 1rem" }}>SME Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Real evaluation data would be mapped here */}
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "3rem", color: "var(--te-gray-4)" }}
                  >
                    Evaluation results are not yet available for this tender.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SME Participation (Hidden if no data) */}
          <div style={{ marginBottom: "2rem" }} />

          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Comments:</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--te-gray-4)" }}>No comments yet.</p>
          </div>

          {/* Approval History */}
          <div style={{ borderTop: "1px solid var(--te-border-light)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
               <Clock size={18} style={{ color: "var(--te-gray-4)" }} />
               <span style={{ fontWeight: 700, fontSize: "1rem" }}>Approval History</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", padding: "0 2rem" }}>
              {timeline && timeline.length > 0 ? (
                timeline.map((step, idx) => (
                  <div key={idx} style={{ textAlign: "center", width: "140px" }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: step.status === "completed" ? "var(--te-success)" : "var(--te-gray-5)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.5rem"
                    }}>
                       {step.status === "completed" ? <Check size={14} /> : null}
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{step.role} – {step.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--te-gray-4)" }}>{step.timestamp || "Pending"}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>No approval history available.</div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-modal-footer" style={{ borderTop: "none", padding: "1.5rem 2.5rem 2.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <button className="dash-btn" style={{ background: "var(--te-gray-4)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Add Score
          </button>
          <button className="dash-btn" style={{ background: "var(--te-gray-4)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <MessageSquare size={18} /> Add Comments
          </button>
          <button
            className="dash-btn"
            style={{ background: "var(--te-gray-2)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            onClick={() => openModal("create-recommendation", { tender })}
          >
            <FileEdit size={18} /> Create Recommendation Note
          </button>
        </div>
      </div>
    </div>
  );
}
