"use client";

import { X, FileText, Calendar, DollarSign, Building2 } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

export default function ConfirmApprovalModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData);
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const approveTender = useCAODashboardStore((s) => s.approveTender);

  if (activeModal !== "confirm-approval") return null;

  const tenderId = modalData?.tenderId as string | undefined;
  const tenderTitle = (modalData?.tenderTitle as string) ?? "XXXXXX";
  const closingDate = (modalData?.closingDate as string) ?? "—";
  const estimatedBudget = (modalData?.estimatedBudget as string) ?? "—";
  const department = (modalData?.department as string) ?? "—";

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--sm" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        <div className="dash-modal-header">
          <h2 className="dash-modal-title" style={{ fontSize: "1.125rem" }}>
            Are you sure you want to approve this tender?
          </h2>
        </div>

        <div className="dash-modal-body">
          <div className="dash-modal-details">
            <div className="dash-modal-detail">
              <FileText size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Tender Title</div>
                <div className="dash-modal-detail-value">{tenderTitle}</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <Calendar size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Closing Date</div>
                <div className="dash-modal-detail-value">{closingDate}</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <DollarSign size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Estimated Budget</div>
                <div className="dash-modal-detail-value">{estimatedBudget}</div>
              </div>
            </div>
            <div className="dash-modal-detail">
              <Building2 size={18} className="dash-modal-detail-icon" />
              <div>
                <div className="dash-modal-detail-label">Department</div>
                <div className="dash-modal-detail-value">{department}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-modal-footer">
          <button
            className="dash-btn dash-btn--secondary"
            onClick={() => tenderId && approveTender(tenderId)}
          >
            Yes, confirm
          </button>
          <button className="dash-btn dash-btn--outline" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
