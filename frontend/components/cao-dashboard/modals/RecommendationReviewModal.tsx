"use client";

import { X, FileText, Calendar, DollarSign, Building2, Clock, Users, BarChart3, Download, Check, Circle } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { DashboardTender, ApprovalStep, Recommendation } from "@/lib/types/cao-dashboard.types";

export default function RecommendationReviewModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData);
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const openModal = useCAODashboardStore((s) => s.openModal);

  if (activeModal !== "recommendation-review") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;
  const recommendation = (modalData?.recommendation as Recommendation) ?? null;
  const timeline = (modalData?.timeline as ApprovalStep[]) ?? [];

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        {/* Header */}
        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Recommendation Review</h2>
          {tender && (
            <>
              <div className="dash-score-badge" style={{ marginTop: "0.5rem" }}>
                Score {tender.score ?? "—"}%
              </div>
              <p className="dash-modal-subtitle" style={{ marginTop: "0.5rem", fontWeight: 600 }}>
                {tender.title || "Title of The Tender"}
              </p>
            </>
          )}
        </div>

        <div className="dash-modal-body">
          {/* Evaluation Summary & Tender Details */}
          <div className="dash-eval-header">Evaluation Summary &amp; Tender Details</div>

          <div className="dash-modal-details">
            <div className="dash-modal-detail">
              <Users size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">List of bidders</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <BarChart3 size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Ranking table</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <FileText size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">SME Indicator</div>
                <div className="dash-modal-detail-value">
                  {tender?.smeIndicator ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>

          <div className="dash-modal-details">
            <div className="dash-modal-detail">
              <Calendar size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Closing Date</div>
                <div className="dash-modal-detail-value">{tender?.closingDate ?? "—"}</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <DollarSign size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Estimated Budget</div>
                <div className="dash-modal-detail-value">
                  {tender?.estimatedBudget ? `RS.${tender.estimatedBudget.toLocaleString()}` : "—"}
                </div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <Building2 size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Department</div>
                <div className="dash-modal-detail-value">{tender?.department ?? "—"}</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <Clock size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Time Remaining</div>
                <div className="dash-modal-detail-value">{tender?.timeRemaining ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* Officer's Recommendation */}
          <div className="dash-eval-header" style={{ marginTop: "1rem" }}>
            Officer&apos;s Recommendation
          </div>

          {recommendation ? (
            <div className="dash-bidder-card">
              <div className="dash-bidder-rank">{recommendation.rank}</div>
              <div className="dash-bidder-info">
                <div className="dash-bidder-name">
                  {recommendation.bidderName}
                  {recommendation.isTopRanked && (
                    <span className="dash-bidder-tag">Top Ranked</span>
                  )}
                </div>
                <div className="dash-bidder-meta">
                  Bid ID: {recommendation.bidId} · Category: {recommendation.category} ·
                  Recommended Award Value: Rs. {recommendation.recommendedValue.toLocaleString()}
                </div>
                <div className="dash-bidder-meta">
                  Justification: {recommendation.justification}
                </div>
              </div>
              <div className="dash-bidder-scores">
                <div className="dash-bidder-score">
                  <div className="dash-bidder-score-value">{Number(recommendation.finalScore).toFixed(2)}</div>
                  <div className="dash-bidder-score-label">Final Score</div>
                </div>
                <div className="dash-bidder-score">
                  <div className="dash-bidder-score-value">{recommendation.technicalScore}</div>
                  <div className="dash-bidder-score-label">Technical</div>
                </div>
                <div className="dash-bidder-score">
                  <div className="dash-bidder-score-value">{recommendation.financialScore}</div>
                  <div className="dash-bidder-score-label">Financial</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem", color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
              No recommendation data available.
            </div>
          )}

          {/* Download buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
            <button className="dash-download-btn">
              <FileText size={18} />
              Evaluation report PDF
              <Download size={16} className="dash-download-icon" />
            </button>
            <button className="dash-download-btn">
              <FileText size={18} />
              Technical evaluation sheet
              <Download size={16} className="dash-download-icon" />
            </button>
          </div>

          {/* Approval Timeline */}
          <div className="dash-eval-header" style={{ marginTop: "1.25rem" }}>
            Approval Timeline
          </div>

          <div className="dash-timeline">
            {timeline.length > 0 ? (
              timeline.map((step, idx) => (
                <div
                  key={idx}
                  className={`dash-timeline-step dash-timeline-step--${step.status}`}
                >
                  <div className="dash-timeline-icon">
                    {step.status === "completed" ? (
                      <Check size={12} />
                    ) : (
                      <Circle size={12} />
                    )}
                  </div>
                  <div className="dash-timeline-label">
                    {step.role} – {step.label}
                  </div>
                  <div className="dash-timeline-meta">
                    {step.timestamp ?? "Time and Date"}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="dash-timeline-step dash-timeline-step--completed">
                  <div className="dash-timeline-icon"><Check size={12} /></div>
                  <div className="dash-timeline-label">Officer – Submitted</div>
                  <div className="dash-timeline-meta">Time and Date</div>
                </div>
                <div className="dash-timeline-step dash-timeline-step--completed">
                  <div className="dash-timeline-icon"><Check size={12} /></div>
                  <div className="dash-timeline-label">Technical Head – Approved</div>
                  <div className="dash-timeline-meta">Time and Date</div>
                </div>
                <div className="dash-timeline-step dash-timeline-step--pending">
                  <div className="dash-timeline-icon"><Circle size={12} /></div>
                  <div className="dash-timeline-label">CAO – Pending</div>
                  <div className="dash-timeline-meta">Time and Date</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="dash-modal-footer">
          <button
            className="dash-btn dash-btn--success"
            onClick={() =>
              openModal("confirm-approval", { tenderId: tender?.id })
            }
          >
            <Check size={16} /> Approve Recommendation
          </button>
          <button
            className="dash-btn dash-btn--danger"
            onClick={() =>
              openModal("confirm-rejection", { tenderId: tender?.id })
            }
          >
            <X size={16} /> Reject Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
