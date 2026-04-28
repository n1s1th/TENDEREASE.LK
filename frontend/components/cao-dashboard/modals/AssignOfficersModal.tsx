"use client";

import { X, FileText, Calendar, DollarSign, Building2 } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import type { DashboardTender } from "@/lib/types/cao-dashboard.types";

export default function AssignOfficersModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData);
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const openModal = useCAODashboardStore((s) => s.openModal);

  if (activeModal !== "assign-officers") return null;

  const tender = (modalData?.tender as DashboardTender) ?? null;

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--sm" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Assign Officers</h2>
        </div>

        <div className="dash-modal-body">
          <div className="dash-modal-details">
            <div className="dash-modal-detail">
              <FileText size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Tender Title</div>
                <div className="dash-modal-detail-value">{tender?.title ?? "XXXXXX"}</div>
              </div>
            </div>
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
          </div>
        </div>

        <div className="dash-modal-footer">
          <button
            className="dash-btn dash-btn--secondary dash-btn--full"
            onClick={() => openModal("officer-details", { tender })}
          >
            Click Here to Assign Officers
          </button>
        </div>
      </div>
    </div>
  );
}
