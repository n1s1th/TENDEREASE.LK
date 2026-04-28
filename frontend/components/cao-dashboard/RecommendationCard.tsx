"use client";

import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { DashboardTender, Recommendation } from "@/lib/types/cao-dashboard.types";
import { Download, CheckCircle, XCircle, FileText } from "lucide-react";

interface RecommendationCardProps {
  tender: DashboardTender;
  recommendation?: Recommendation;
  status: "pending" | "accepted" | "rejected";
  timestamp?: string;
  reason?: string;
}

export default function RecommendationCard({
  tender,
  recommendation,
  status,
  timestamp,
  reason,
}: RecommendationCardProps) {
  const openModal = useCAODashboardStore((s) => s.openModal);

  const StatusTag = () => {
    switch (status) {
      case "pending":
        return <span className="dash-notif-item-tag--generated">Pending</span>;
      case "accepted":
        return <span className="dash-notif-item-tag--sent">Accepted</span>;
      case "rejected":
        return <span className="dash-notif-item-tag--failed">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dash-kpi-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderLeft: "4px solid var(--te-primary)", width: "100%", marginBottom: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: "var(--te-gray-1)" }}>
            {tender.title}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--te-gray-3)", margin: 0 }}>
            Tender ID: {tender.id} • {tender.category} / {tender.type}
          </p>
        </div>
        <StatusTag />
      </div>

      {timestamp && (
        <div style={{ fontSize: "0.8rem", color: "var(--te-gray-4)" }}>
          {status === "accepted" ? "Accepted on: " : "Rejected on: "}
          {timestamp}
        </div>
      )}

      {reason && status === "rejected" && (
        <div style={{ fontSize: "0.85rem", color: "var(--te-gray-2)", background: "#FFF5F5", padding: "0.75rem", borderRadius: "6px", border: "1px solid #FFEBEB" }}>
          <strong>Rejection Reason:</strong> {reason}
        </div>
      )}

      {/* Tender Details (Summary) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", background: "#FDF8F4", padding: "1rem", borderRadius: "8px" }}>
        <div>
          <div style={{ color: "var(--te-gray-4)", marginBottom: "0.25rem" }}>Department</div>
          <div style={{ fontWeight: 600, color: "var(--te-gray-2)" }}>{tender.department}</div>
        </div>
        <div>
          <div style={{ color: "var(--te-gray-4)", marginBottom: "0.25rem" }}>Estimated Budget</div>
          <div style={{ fontWeight: 600, color: "var(--te-gray-2)" }}>RS. {tender.estimatedBudget.toLocaleString()}</div>
        </div>
      </div>

      {/* Officer's Recommendation */}
      <div style={{ border: "1px solid var(--te-border)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ background: "var(--te-gray-6)", padding: "0.75rem 1rem", borderBottom: "1px solid var(--te-border)", fontWeight: 600, fontSize: "0.9rem", color: "var(--te-gray-2)" }}>
          Officer's Recommendation
        </div>
        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #111827", borderRadius: "6px", padding: "0.75rem", background: "#FFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#111827", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{recommendation?.bidderName || "Tech Solutions Ltd."}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-3)" }}>Recommended Value: Rs. {recommendation?.recommendedValue.toLocaleString() || "4,850,000"}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{recommendation?.finalScore || "87.4"}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--te-gray-4)", textTransform: "uppercase" }}>Final Score</div>
            </div>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--te-gray-2)" }}>
            <strong>Justification:</strong> {recommendation?.justification || "Meets all technical specifications and offers best value for money."}
          </div>

          {/* Files */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button className="dash-table-menu-btn" style={{ border: "1px solid var(--te-border)", borderRadius: "6px", padding: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFF", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                <FileText size={16} color="var(--te-primary)" />
                Evaluation report PDF
              </div>
              <Download size={16} color="var(--te-gray-3)" />
            </button>
            <button className="dash-table-menu-btn" style={{ border: "1px solid var(--te-border)", borderRadius: "6px", padding: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFF", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                <FileText size={16} color="var(--te-primary)" />
                Technical eval sheet
              </div>
              <Download size={16} color="var(--te-gray-3)" />
            </button>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      {status === "pending" && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", borderTop: "1px solid var(--te-border)", paddingTop: "1.25rem" }}>
          <button
            onClick={() => openModal("approve-recommendation", { tender, recommendation })}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "var(--te-primary)", color: "#111827", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <CheckCircle size={18} />
            Approve Recommendation
          </button>
          <button
            onClick={() => openModal("reject-recommendation", { tender, recommendation })}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "var(--te-white)", border: "1px solid var(--te-border)", color: "var(--te-gray-2)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <XCircle size={18} />
            Reject Recommendation
          </button>
        </div>
      )}
    </div>
  );
}
