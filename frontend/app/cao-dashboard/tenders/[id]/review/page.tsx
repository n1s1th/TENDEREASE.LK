"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { TenderPreview } from "@/components/tender/creation/steps/TenderPreview";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import ConfirmApprovalModal from "@/components/cao-dashboard/modals/ConfirmApprovalModal";
import ConfirmRejectionModal from "@/components/cao-dashboard/modals/ConfirmRejectionModal";

export default function CAOTenderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const tenders = useCAODashboardStore((s) => s.tenders);
  const openModal = useCAODashboardStore((s) => s.openModal);
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const [tender, setTender] = useState<any>(null);

  useEffect(() => {
    // In a real app, we would fetch the specific tender by ID
    // For now, let's try to find it in the current store or use mock data
    const found = tenders.find(t => t.id === id);
    if (found) {
      setTender(found);
    } else {
      // Mock data if not found in store
      setTender({
        id: id,
        title: "Sample Tender Title",
        estimatedBudget: 5000000,
        closingDate: "Dec 22, 2025",
        department: "Ministry of Infrastructure"
      });
    }
  }, [id, tenders]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Review Tender: {id}
            </h1>
          </div>
          <div className="flex gap-3">
             <Button 
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => openModal("confirm-rejection", { tender })}
            >
              <XCircle className="mr-2 size-4" />
              Reject Tender
            </Button>
            <Button 
              className="bg-primary text-black hover:bg-primary/90"
              onClick={() => openModal("confirm-approval", { tender })}
            >
              <CheckCircle className="mr-2 size-4" />
              Approve Tender
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10 flex-1 w-full">
        <TenderPreview 
          readOnly={true} 
          data={{
            title: tender?.title || "Sample Tender Title",
            referenceNumber: id,
            procurementType: tender?.type || "GOODS",
            biddingMethod: "NCB",
            ministryId: "Ministry of Finance",
            departmentAgencyId: tender?.department || "Infrastructure",
            description: "Detailed description of the tender for infrastructure development including all technical requirements.",
            estimatedBudget: tender?.estimatedBudget?.toString() || "5000000",
            fundingSource: "GOVERNMENT",
            tenderType: "OPEN",
            sbdTemplate: "Standard Goods SBD",
            templateVersion: "1.0",
            complianceChecklist: {
              procurementPlanApproved: true,
              budgetAvailabilityConfirmed: true,
              sbdComplyWithGuidelines: true,
              evaluationCriteriaDefined: true,
            },
            advertisementStartDate: "2025-12-01",
            bidSubmissionDeadline: tender?.closingDate || "2025-12-22",
            preBidMeetingEnabled: true,
            preBidMeetingDate: "2025-12-10",
            pendingFiles: [],
            uploadedFiles: [{ name: "Specifications.pdf", url: "#", size: 1024 }]
          }} 
        />
      </div>

      {/* Modals */}
      {activeModal === "confirm-approval" && <ConfirmApprovalModal />}
      {activeModal === "confirm-rejection" && <ConfirmRejectionModal />}
    </div>
  );
}
