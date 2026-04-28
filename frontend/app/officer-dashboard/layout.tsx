import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import SubNav from "@/components/officer-dashboard/SubNav";
import Toast from "@/components/officer-dashboard/Toast";
import RecommendationReviewModal from "@/components/officer-dashboard/modals/RecommendationReviewModal";
import TenderSummaryModal from "@/components/officer-dashboard/modals/TenderSummaryModal";
import ConfirmApprovalModal from "@/components/officer-dashboard/modals/ConfirmApprovalModal";
import ConfirmRejectionModal from "@/components/officer-dashboard/modals/ConfirmRejectionModal";
import AssignOfficersModal from "@/components/officer-dashboard/modals/AssignOfficersModal";
import OfficerDetailsModal from "@/components/officer-dashboard/modals/OfficerDetailsModal";
import EditRecommendationModal from "@/components/officer-dashboard/modals/EditRecommendationModal";
import CreateRecommendationNoteModal from "@/components/officer-dashboard/modals/CreateRecommendationNoteModal";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Officer Dashboard — TenderEase.lk",
  description: "Chief Accounting Officer dashboard for managing government tenders, approvals, and officer assignments.",
};

export default function OfficerDashboardLayout({
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
      <AssignOfficersModal />
      <OfficerDetailsModal />
      <EditRecommendationModal />
      <CreateRecommendationNoteModal />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
