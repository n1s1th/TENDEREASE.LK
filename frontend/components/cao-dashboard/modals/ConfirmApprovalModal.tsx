"use client";

import { X, FileText, Calendar, Wallet, Building2 } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

export default function ConfirmApprovalModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const modalData = useCAODashboardStore((s) => s.modalData) as any;
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const approveTender = useCAODashboardStore((s) => s.approveTender);

  if (activeModal !== "confirm-approval") return null;

  const tender = modalData?.tender;
  const tenderId = tender?.id;
  const tenderTitle = tender?.title ?? "XXXXXX";
  const closingDate = tender?.closingDate ?? "Dec 22, 2025";
  const estimatedBudget = tender?.estimatedBudget 
    ? `RS. ${tender.estimatedBudget.toLocaleString()}` 
    : "RS. 5,000,000";
  const department = tender?.department ?? "Ministry of Infrastructure";

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="dash-modal-header" style={{ borderBottom: "none", paddingBottom: 0, position: "relative" }}>
          <h2 className="dash-modal-title" style={{ width: "100%", textAlign: "center", fontSize: "1.25rem", marginTop: "1.5rem", fontWeight: 700 }}>
            Are you sure you want to approve this tender?
          </h2>
          <button 
            className="dash-modal-close" 
            onClick={closeModal}
            style={{ position: "absolute", top: "1rem", right: "1rem" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="dash-modal-body" style={{ padding: "1.5rem 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <FileText size={20} className="text-gray-400" style={{ marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 500, textTransform: "uppercase" }}>Tender Title</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--te-gray-1)" }}>{tenderTitle}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Calendar size={20} className="text-gray-400" style={{ marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 500, textTransform: "uppercase" }}>Closing Date</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--te-gray-1)" }}>{closingDate}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Wallet size={20} className="text-gray-400" style={{ marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 500, textTransform: "uppercase" }}>Estimated Budget</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--te-gray-1)" }}>{estimatedBudget}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Building2 size={20} className="text-gray-400" style={{ marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", fontWeight: 500, textTransform: "uppercase" }}>Department</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--te-gray-1)" }}>{department}</div>
              </div>
            </div>

          </div>
        </div>

        <div className="dash-modal-footer" style={{ borderTop: "none", padding: "1rem 2.5rem 2.5rem 2.5rem", display: "flex", gap: "1rem" }}>
          <button
            className="dash-btn"
            style={{ 
              flex: 1, 
              background: "#111827", 
              color: "#FFF", 
              fontWeight: 700, 
              height: "44px",
              borderRadius: "6px"
            }}
            onClick={() => tenderId && approveTender(tenderId)}
          >
            Yes,confirm
          </button>
          <button 
            className="dash-btn"
            style={{ 
              flex: 1, 
              background: "#FFF", 
              border: "1px solid var(--te-border)", 
              color: "var(--te-gray-2)", 
              fontWeight: 700,
              height: "44px",
              borderRadius: "6px"
            }} 
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
