"use client";

import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { Recommendation } from "@/lib/types/cao-dashboard.types";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const openModal = useCAODashboardStore((s) => s.openModal);
  const tenders = useCAODashboardStore((s) => s.tenders);
  const matchedTender = tenders.find((t: any) => t.id === recommendation.tenderId);
  const displayTenderId = matchedTender?.tenderNumber || matchedTender?.referenceNumber || recommendation.tenderId;

  const StatusTag = () => {
    switch (recommendation.status) {
      case "PENDING":
        return <span className="dash-notif-item-tag dash-notif-item-tag--generated" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", fontWeight: 700 }}>Pending</span>;
      case "APPROVED":
        return <span className="dash-notif-item-tag dash-notif-item-tag--sent" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", fontWeight: 700 }}>Accepted</span>;
      case "REJECTED":
        return <span className="dash-notif-item-tag dash-notif-item-tag--failed" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", fontWeight: 700 }}>Rejected</span>;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (recommendation.status) {
      case "APPROVED": return "4px solid var(--te-success)";
      case "REJECTED": return "4px solid var(--te-error)";
      default: return "4px solid var(--te-primary)";
    }
  };

  return (
    <div className="dash-kpi-card shadow-sm hover:shadow-md transition-all duration-300" style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "1.25rem", 
      borderLeft: getBorderColor(), 
      width: "100%", 
      marginBottom: "1.25rem",
      padding: "1.75rem",
      borderRadius: "16px",
      background: "var(--te-white)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.35rem 0", color: "var(--te-gray-1)", letterSpacing: "-0.01em" }}>
            {recommendation.tenderName}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--te-gray-3)", fontWeight: 500, margin: 0 }}>
            Tender ID: <span style={{ color: "var(--te-gray-1)", fontWeight: 600 }}>{displayTenderId}</span> • {recommendation.department}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link 
            href={`/cao-dashboard/tenders/${recommendation.tenderId}/review`}
            className="inline-flex items-center px-4 py-1.5 bg-[#fdf6f2] hover:bg-[#faeadd] text-[#953002] text-[11px] font-bold rounded-md transition-colors border border-[#953002]/20 shadow-sm"
            style={{ letterSpacing: "0.02em" }}
          >
            View Full Tender Details
          </Link>
          <StatusTag />
        </div>
      </div>

      {recommendation.status !== "PENDING" && recommendation.actionedAt && (
        <div style={{ fontSize: "0.8rem", color: "var(--te-gray-4)", marginTop: "-0.75rem", fontWeight: 500 }}>
          {recommendation.status === "APPROVED" ? "Accepted on: " : "Rejected on: "}
          {new Date(recommendation.actionedAt).toLocaleDateString()}
        </div>
      )}

      {/* Rejection Reason */}
      {recommendation.status === "REJECTED" && recommendation.rejectionReason && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginTop: "-0.25rem",
        }}>
          <div style={{ fontSize: "0.75rem", color: "#991b1b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em", marginBottom: "0.35rem" }}>
            Rejection Reason
          </div>
          <div style={{ fontSize: "0.9rem", color: "#7f1d1d", lineHeight: 1.6, fontWeight: 500 }}>
            {recommendation.rejectionReason}
          </div>
        </div>
      )}

      {/* Tender Summary Details */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "1.25rem", 
        fontSize: "0.85rem", 
        background: "var(--te-gray-6)", 
        padding: "1.25rem", 
        borderRadius: "12px",
        border: "1px solid var(--te-border-light)"
      }}>
        <div>
          <div style={{ color: "var(--te-gray-4)", marginBottom: "0.35rem", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Estimated Budget</div>
          <div style={{ fontWeight: 700, color: "var(--te-gray-1)", fontSize: "1rem" }}>
            Rs. {recommendation.estimatedBudget.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--te-gray-4)", marginBottom: "0.35rem", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Created Date</div>
          <div style={{ fontWeight: 700, color: "var(--te-gray-1)", fontSize: "1rem" }}>
            {new Date(recommendation.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Recommended Bidder Box */}
      <div style={{ border: "1px solid var(--te-border-light)", borderRadius: "14px", overflow: "hidden", background: "#fdfdfd" }}>
        <div style={{ background: "var(--te-gray-6)", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--te-border-light)", fontWeight: 700, fontSize: "0.85rem", color: "var(--te-gray-2)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Recommended Bidder Details
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", border: "1.5px solid #111827", borderRadius: "12px", padding: "1.25rem", background: "#FFF" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#111827", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem", flexShrink: 0 }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--te-gray-1)" }}>{recommendation.bidderName}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--te-gray-3)", fontWeight: 600, marginTop: "0.25rem", marginBottom: "0.75rem" }}>
                  Proposed Value: <span style={{ color: "var(--te-primary-dark)" }}>Rs. {recommendation.recommendedValue.toLocaleString()}</span>
                </div>
                {recommendation.bidId && (
                  <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    Bid Reference: <span style={{ color: "var(--te-gray-2)" }}>{recommendation.bidId}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: "160px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.85rem", paddingBottom: "0.85rem", borderBottom: "1px dashed var(--te-border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "var(--te-gray-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Technical</span>
                  <span style={{ background: "#f1f5f9", padding: "0.15rem 0.4rem", borderRadius: "4px", color: "var(--te-gray-1)", fontWeight: 800 }}>
                    {recommendation.technicalScore ? Number(recommendation.technicalScore).toFixed(2) : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "var(--te-gray-4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Financial</span>
                  <span style={{ background: "#f1f5f9", padding: "0.15rem 0.4rem", borderRadius: "4px", color: "var(--te-gray-1)", fontWeight: 800 }}>
                    {recommendation.financialScore ? Number(recommendation.financialScore).toFixed(2) : "N/A"}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--te-gray-1)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {Number(recommendation.finalScore).toFixed(2)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--te-gray-4)", textTransform: "uppercase", fontWeight: 800, marginTop: "0.35rem", letterSpacing: "0.05em" }}>
                Final Score
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.95rem", color: "var(--te-gray-2)", lineHeight: "1.6" }}>
            <span style={{ fontWeight: 700, color: "var(--te-gray-3)", marginRight: "0.5rem" }}>Justification:</span> 
            <span style={{ color: "var(--te-gray-1)" }}>{recommendation.justification || "Recommended based on scoring criteria."}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {recommendation.status === "PENDING" && (
        <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.5rem", borderTop: "1px solid var(--te-border-light)", paddingTop: "1.75rem" }}>
          <button
            onClick={() => openModal("approve-recommendation", { recommendation })}
            className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
            style={{ background: "#953002", color: "#FFF", border: "none", fontSize: "0.95rem" }}
          >
            <CheckCircle size={20} />
            Approve Recommendation
          </button>
          <button
            onClick={() => openModal("reject-recommendation", { recommendation })}
            className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm"
            style={{ background: "#FFF", color: "var(--te-gray-2)", fontSize: "0.95rem" }}
          >
            <XCircle size={20} />
            Reject Recommendation
          </button>
        </div>
      )}
    </div>
  );
}
