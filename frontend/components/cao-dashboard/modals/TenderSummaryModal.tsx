"use client";

import { X, Calendar, DollarSign, Building2, Clock, Check, Circle, User } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { DashboardTender, ApprovalStep, AssignedOfficer } from "@/lib/types/cao-dashboard.types";

export default function TenderSummaryModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData);
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const openModal = useCAODashboardStore((s) => s.openModal);

  if (activeModal !== "tender-summary") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;
  const timeline = (modalData?.timeline as ApprovalStep[]) ?? [];
  const assignedOfficers = (modalData?.assignedOfficers as AssignedOfficer[]) ?? [];

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Tender Summary</h2>
          <div className="dash-score-badge" style={{ marginTop: "0.5rem" }}>
            Score {tender?.score ?? "—"}%
          </div>
          <p className="dash-modal-subtitle" style={{ marginTop: "0.5rem", fontWeight: 600 }}>
            {tender?.title ?? "Title of The Tender"}
          </p>
        </div>

        <div className="dash-modal-body">
          {/* Approval Progress Tracker */}
          <div className="dash-eval-header">Approval Progress Tracker</div>

          <div className="dash-timeline">
            {timeline.length > 0 ? (
              timeline.map((step, idx) => (
                <div
                  key={idx}
                  className={`dash-timeline-step dash-timeline-step--${step.status}`}
                >
                  <div className="dash-timeline-icon">
                    {step.status === "completed" ? <Check size={12} /> : <Circle size={12} />}
                  </div>
                  <div className="dash-timeline-label">
                    {step.role} – {step.label}
                  </div>
                  <div className="dash-timeline-meta">{step.timestamp ?? "Time and Date"}</div>
                </div>
              ))
            ) : (
              <>
                <div className="dash-timeline-step dash-timeline-step--completed">
                  <div className="dash-timeline-icon"><Check size={12} /></div>
                  <div className="dash-timeline-label">Officer – Approved</div>
                  <div className="dash-timeline-meta">Time and Date</div>
                </div>
                <div className="dash-timeline-step dash-timeline-step--completed">
                  <div className="dash-timeline-icon"><Check size={12} /></div>
                  <div className="dash-timeline-label">Technical Committee – Approved</div>
                  <div className="dash-timeline-meta">Time and Date</div>
                </div>
                <div className="dash-timeline-step dash-timeline-step--completed">
                  <div className="dash-timeline-icon"><Check size={12} /></div>
                  <div className="dash-timeline-label">Procurement Head – Approved</div>
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

          {/* Tender Details */}
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

          {/* Description */}
          {tender?.description && (
            <p style={{ fontSize: "0.875rem", color: "var(--te-gray-3)", lineHeight: 1.6, margin: "1rem 0" }}>
              {tender.description}
            </p>
          )}

          {/* List of Officers Assigned */}
          <h4 style={{ textAlign: "center", fontSize: "0.95rem", fontWeight: 600, color: "var(--te-gray-1)", margin: "1.25rem 0 0.75rem" }}>
            List of Officers Assigned
          </h4>

          {assignedOfficers.length > 0 ? (
            <div className="dash-assigned-officers">
              {assignedOfficers.map((officer) => (
                <div key={officer.id} className="dash-assigned-officer">
                  <div className="dash-assigned-officer-avatar">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="dash-assigned-officer-name">{officer.name}</div>
                    <div className="dash-assigned-officer-meta">
                      {officer.designation}
                      <br />
                      {officer.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--te-gray-4)", padding: "0.5rem 0" }}>
              No officers assigned yet.
            </p>
          )}
        </div>

        <div className="dash-modal-footer">
          <button
            className="dash-btn dash-btn--secondary dash-btn--lg"
            onClick={() =>
              openModal("assign-officers", { tender })
            }
          >
            Click Here to Assign Officers
          </button>
        </div>
      </div>
    </div>
  );
}
