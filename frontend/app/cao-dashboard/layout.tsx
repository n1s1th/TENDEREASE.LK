import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import SubNav from "@/components/cao-dashboard/SubNav";
import Toast from "@/components/cao-dashboard/Toast";
import RecommendationReviewModal from "@/components/cao-dashboard/modals/RecommendationReviewModal";
import TenderSummaryModal from "@/components/cao-dashboard/modals/TenderSummaryModal";
import ConfirmApprovalModal from "@/components/cao-dashboard/modals/ConfirmApprovalModal";
import ConfirmRejectionModal from "@/components/cao-dashboard/modals/ConfirmRejectionModal";
import OfficerDetailsModal from "@/components/cao-dashboard/modals/OfficerDetailsModal";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAO Dashboard — TenderEase.lk",
  description: "Chief Accounting Officer dashboard for managing government tenders, approvals, and officer assignments.",
};

export default function CAODashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-page">
      <SubNav />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0.5rem 1.5rem 2rem" }}>{children}</main>

      {/* Same Footer as home page */}
      <Footer />

      {/* Global modals */}
      <RecommendationReviewModal />
      <TenderSummaryModal />
      <ConfirmApprovalModal />
      <ConfirmRejectionModal />
      <OfficerDetailsModal />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
