import Footer from "@/components/home/Footer";
import SubNav from "@/components/cao-dashboard/SubNav";
import Toast from "@/components/cao-dashboard/Toast";
import ConfirmApprovalModal from "@/components/cao-dashboard/modals/ConfirmApprovalModal";
import ConfirmRejectionModal from "@/components/cao-dashboard/modals/ConfirmRejectionModal";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TenderEase.lk - CAO Dashboard",
  description: "Chief Accounting Officer dashboard for managing government tenders, approvals, and officer assignments.",
};

export default function CAODashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-page">

      {/* Dashboard Identity Header */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "1.75rem 1.5rem 1.25rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ width: 4, height: 60, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }}></div>
          <div>
            <h1 style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: "0.01em",
              margin: 0,
              lineHeight: 1.2
            }}>
              CAO Dashboard
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, margin: "0.6rem 0 0" }}>
              Chief Accounting Officer • Tender Management & Approvals
            </p><br></br>
          </div>
        </div>
      </div>

      <SubNav />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0.5rem 1.5rem 2rem" }}>{children}</main>

      {/* Same Footer as home page */}
      <Footer />

      {/* Global modals */}
      <ConfirmApprovalModal />
      <ConfirmRejectionModal />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
