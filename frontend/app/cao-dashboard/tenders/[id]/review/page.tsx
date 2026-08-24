"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { fetchTenderDetails } from "@/lib/api/cao-dashboard.api";
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
  const activeTab = useCAODashboardStore((s) => s.activeTab);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const tendersLoading = useCAODashboardStore((s) => s.tendersLoading);

  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tenderUuid, setTenderUuid] = useState<string | null>(null);

  const isApproved = activeTab === "approved" || (tender && !["DRAFT", "PENDING_APPROVAL", "REJECTED"].includes(String(tender.status).toUpperCase()));
  const isRejected = activeTab === "rejected" || (tender && String(tender.status).toUpperCase() === "REJECTED");

  // Auto-fetch tenders list if it's empty (e.g. page refresh)
  useEffect(() => {
    if (tenders.length === 0 && !tendersLoading) {
      fetchTenders();
    }
  }, [tenders, tendersLoading, fetchTenders]);

  // Resolve the UUID from parameters/tenders list
  useEffect(() => {
    if (tenderUuid) return;

    // Check if the id parameter itself is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      setTenderUuid(id);
      return;
    }

    const found = tenders.find(t => 
      t.id === id || 
      t.tenderNumber === id || 
      t.referenceNumber === id ||
      (t.tenderNumber && t.tenderNumber.replace(/\//g, "-") === id) ||
      (t.referenceNumber && t.referenceNumber.replace(/\//g, "-") === id)
    );
    if (found) {
      setTenderUuid(found.id);
    }
  }, [id, tenders, tenderUuid]);

  // Fetch/re-fetch tender details based on the UUID
  useEffect(() => {
    if (!tenderUuid) {
      if (tenders.length > 0 && !tendersLoading) {
        // Look up failed, but maybe ID is a UUID. If not, stop loading.
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          setLoading(false);
          setTender(null);
          return;
        }
      }
      return;
    }

    setLoading(true);
    fetchTenderDetails(tenderUuid)
      .then(data => setTender(data))
      .catch(() => setTender(null))
      .finally(() => setLoading(false));
  }, [tenderUuid, id, tenders, tendersLoading, activeModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-slate-500 font-medium">
          Loading tender details...
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-3xl p-10 w-full max-w-md text-center shadow-xl border border-slate-100 animate-fadeIn">
          <div className="w-16 h-16 bg-[#953002]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-[#953002]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Tender Not Found
          </h2>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            The tender you are looking for could not be retrieved. It may have been processed or the ID is invalid.
          </p>
          <Button 
            className="w-full bg-[#953002] text-white border border-[#953002] hover:bg-[#b03b03] transition-all shadow-md py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            onClick={() => router.push("/cao-dashboard")}
          >
            <ArrowLeft size={16} />
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Map backend TenderResponse fields to the TenderPreview data format
  const previewData = {
    title: tender.title || "",
    referenceNumber: tender.tenderNumber || tender.referenceNumber || id,
    procurementType: tender.procurementType || tender.type || "",
    biddingMethod: tender.biddingMethod || "",
    ministryId: tender.ministryName || tender.ministry || "",
    departmentAgencyId: tender.departmentName || tender.department || "",
    description: tender.description || "",
    estimatedBudget: String(tender.estimatedBudget || ""),
    fundingSource: tender.fundingSourceName || tender.fundingSource || "",
    tenderType: tender.tenderType || "",
    sbdTemplate: tender.sbdTemplate || tender.dynamicData?.sbdTemplate || "",
    templateVersion: tender.templateVersion || tender.dynamicData?.templateVersion || "",
    complianceChecklist: {
      procurementPlanApproved: tender.complianceChecklist?.procurementPlanApproved || false,
      budgetAvailabilityConfirmed: tender.complianceChecklist?.budgetAvailabilityConfirmed || false,
      sbdComplyWithGuidelines: tender.complianceChecklist?.sbdComplyWithGuidelines || tender.complianceChecklist?.sbdsCompliantWithGuidelines || false,
      evaluationCriteriaDefined: tender.complianceChecklist?.evaluationCriteriaDefined || false,
    },
    advertisementStartDate: tender.schedule?.advertisementStartDate 
      ? new Date(tender.schedule.advertisementStartDate).toISOString().split('T')[0] 
      : "",
    bidSubmissionDeadline: (tender.schedule?.bidSubmissionDeadline || tender.closingDate)
      ? new Date(tender.schedule?.bidSubmissionDeadline || tender.closingDate).toISOString().split('T')[0]
      : "",
    preBidMeetingEnabled: tender.schedule?.preBidMeetingEnabled || false,
    preBidMeetingDate: tender.schedule?.preBidMeetingDate 
      ? new Date(tender.schedule.preBidMeetingDate).toISOString().split('T')[0]
      : "",
    pendingFiles: (tender.documents || []).map((doc: any) => ({
      id: doc.id,
      name: doc.documentName || doc.name || "Document",
      size: doc.fileSizeBytes || doc.size || 0,
    })),
    uploadedFiles: tender.documents || [],
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#953002] bg-[#953002]/10 px-4 py-2 rounded-xl shadow-sm border border-[#953002]/20">
              {isApproved || isRejected
                ? `Tender Details of ${tender.tenderNumber || tender.referenceNumber || id}`
                : `Review Tender: ${tender.tenderNumber || tender.referenceNumber || id}`}
            </h1>
          </div>
          <div className="flex gap-3">
            {isApproved ? (
              <span className="px-4 py-2 text-sm font-bold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" />
                Approved
              </span>
            ) : isRejected ? (
              <span className="px-4 py-2 text-sm font-bold rounded-xl border border-[#953002]/20 bg-[#fdf6f2] text-[#953002] shadow-sm flex items-center gap-2">
                <XCircle size={18} className="text-[#953002]" />
                Rejected
              </span>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-[#953002] text-[#953002] bg-white hover:bg-[#fdf6f2] transition-all shadow-sm"
                  onClick={() => openModal("confirm-rejection", { tender })}
                >
                  <XCircle className="mr-2 size-4" />
                  Reject Tender
                </Button>
                <Button 
                  className="bg-[#953002] text-white border border-[#953002] hover:bg-[#b03b03] transition-all shadow-md"
                  onClick={() => openModal("confirm-approval", { tender })}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Approve Tender
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content — reuses the same TenderPreview from tender creation */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-6 flex-1 w-full">
        {isApproved && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-5 rounded-r-xl text-sm font-sans shadow-sm flex items-center justify-between">
            <div>
              <strong>Tender Approved:</strong> This tender has been approved and published to the portal.
            </div>
            <Button 
              variant="outline" 
              className="border-emerald-500 text-emerald-800 bg-white hover:bg-emerald-100 hover:text-emerald-900 transition-all font-bold text-xs px-3 py-1.5 flex items-center gap-1.5"
              onClick={() => router.push("/cao-dashboard")}
            >
              <ArrowLeft size={14} />
              Go Back to Dashboard
            </Button>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50/80 border-l-4 border-[#953002] text-[#953002] p-5 rounded-r-xl text-sm font-sans shadow-sm flex items-center justify-between">
            <div>
              <strong>Tender Rejected:</strong> This tender has been rejected.
              {tender.rejectionReason && <span> Reason: {tender.rejectionReason}</span>}
            </div>
            <Button 
              variant="outline" 
              className="border-[#953002] text-[#953002] bg-white hover:bg-[#fdf6f2] transition-all font-bold text-xs px-3 py-1.5 flex items-center gap-1.5"
              onClick={() => router.push("/cao-dashboard")}
            >
              <ArrowLeft size={14} />
              Go Back to Dashboard
            </Button>
          </div>
        )}
        
        <TenderPreview 
          readOnly={true} 
          data={previewData}
        />
      </div>

      {/* Modals */}
      {activeModal === "confirm-approval" && <ConfirmApprovalModal />}
      {activeModal === "confirm-rejection" && <ConfirmRejectionModal />}
    </div>
  );
}
