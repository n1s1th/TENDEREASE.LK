import Navbar from "@/components/home/Navbar";
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
      <Navbar />
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
