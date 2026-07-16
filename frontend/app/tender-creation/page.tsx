"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { StepIndicator } from "@/components/tender/creation/StepIndicator";
import { TenderDetailsStep } from "@/components/tender/creation/steps/TenderDetailsStep";
import { FinancialInfoStep } from "@/components/tender/creation/steps/FinancialInfoStep";
import { BiddingDocumentsStep } from "@/components/tender/creation/steps/BiddingDocumentsStep";
import { NoticeComplianceStep } from "@/components/tender/creation/steps/NoticeComplianceStep";
import { ScheduleStep } from "@/components/tender/creation/steps/ScheduleStep";
import { TenderPreview } from "@/components/tender/creation/steps/TenderPreview";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Eye, Wand2, ArrowLeft } from "lucide-react";
import type { StepIndex } from "@/lib/types/tender-creation.types";

const STEP_COMPONENTS = [
  TenderDetailsStep,
  FinancialInfoStep,
  BiddingDocumentsStep,
  NoticeComplianceStep,
  ScheduleStep,
];

function validateStep(step: number, formData: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (!formData.title.trim()) errors.title = "Tender title is required.";
    if (!formData.referenceNumber.trim()) errors.referenceNumber = "Reference number is required.";
    if (!formData.procurementType) errors.procurementType = "Procurement type is required.";
    if (!formData.biddingMethod) errors.biddingMethod = "Bidding method is required.";
    if (!formData.ministryId) errors.ministryId = "Ministry is required.";
    if (!formData.departmentAgencyId) errors.departmentAgencyId = "Department / Agency is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
  }

  if (step === 1) {
    if (!formData.estimatedBudget || Number(formData.estimatedBudget) <= 0)
      errors.estimatedBudget = "A valid estimated budget is required.";
    if (!formData.fundingSource) errors.fundingSource = "Funding source is required.";
    if (!formData.tenderType) errors.tenderType = "Tender type is required.";
  }

  if (step === 2) {
    if (!formData.sbdTemplate) errors.sbdTemplate = "Please select a Standard Bidding Document.";
  }

  if (step === 3) {
    const cl = formData.complianceChecklist;
    if (!cl.procurementPlanApproved) errors.procurementPlanApproved = "Procurement plan must be approved.";
    if (!cl.budgetAvailabilityConfirmed) errors.budgetAvailabilityConfirmed = "Budget availability must be confirmed.";
    if (!cl.sbdComplyWithGuidelines) errors.sbdComplyWithGuidelines = "SBDs must comply with guidelines.";
    if (!cl.evaluationCriteriaDefined) errors.evaluationCriteriaDefined = "Evaluation criteria must be defined.";
  }

  if (step === 4) {
    if (!formData.advertisementStartDate)
      errors.advertisementStartDate = "Advertisement start date is required.";
    if (!formData.bidSubmissionDeadline)
      errors.bidSubmissionDeadline = "Bid submission deadline is required.";
    if (
      formData.advertisementStartDate &&
      formData.bidSubmissionDeadline &&
      formData.bidSubmissionDeadline <= formData.advertisementStartDate
    ) {
      errors.bidSubmissionDeadline = "Deadline must be after the advertisement start date.";
    }
    if (formData.preBidMeetingEnabled && !formData.preBidMeetingDate)
      errors.preBidMeetingDate = "Pre-bid meeting date is required.";
  }

  return errors;
}

export default function TenderCreationPage() {
  const router = useRouter();
  const {
    currentStep,
    showPreview,
    isSubmitting,
    error,
    formData,
    nextStep,
    prevStep,
    goToStep,
    setShowPreview,
    setFormErrors,
    fetchReferenceData,
    updateFormData,
  } = useTenderCreationStore();

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  const ActiveStep = STEP_COMPONENTS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === 4;

  const handleNext = () => {
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    nextStep();
  };

  const handleReview = () => {
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowPreview(true);
  };

  const handleSaveDraft = () => {
    alert("Save as Draft — not yet wired to backend.");
  };

  const handleFillSampleData = () => {
    updateFormData({
      title: "Sample Tender for IT Equipment",
      referenceNumber: "TR-2026-001",
      procurementType: "GOODS",
      biddingMethod: "NCB",
      ministryId: "1",
      departmentAgencyId: "1",
      description: "Procurement of 100 laptops and 50 desktop computers for the new IT center. Must include 3 years warranty and on-site support.",
      estimatedBudget: "15000000",
      fundingSource: "1",
      tenderType: "OPEN_TENDER",
      sbdTemplate: "1",
      templateVersion: "1.0",
      complianceChecklist: {
        procurementPlanApproved: true,
        budgetAvailabilityConfirmed: true,
        sbdComplyWithGuidelines: true,
        evaluationCriteriaDefined: true,
      },
      advertisementStartDate: new Date().toISOString().split('T')[0],
      bidSubmissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preBidMeetingEnabled: true,
      preBidMeetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    goToStep(4);
    setShowPreview(true);
  };

  // ── Preview mode ────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="min-h-screen bg-grey-1">
        <div className="border-b border-border bg-white">
          <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center justify-center w-8 h-8 rounded-md text-grey-5 hover:text-foreground hover:bg-grey-1 transition-colors"
                title="Back to Form"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Review Tender</h1>
            </div>
            <span className="text-xs font-medium text-grey-4">Preview</span>
          </div>
        </div>

        <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
          <TenderPreview />
        </div>
      </div>
    );
  }

  // ── Normal wizard mode ──────────────────────────────────
  return (
    <div className="min-h-screen bg-grey-1">
      {/* Top bar */}
      <div className="border-b border-border bg-white">
        <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-md text-grey-5 hover:text-foreground hover:bg-grey-1 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Create New Tender</h1>
          </div>
          <span className="text-xs font-medium text-grey-4">
            Step {currentStep + 1} of 5
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={(step: StepIndex) => goToStep(step)}
        />

        {/* Error banner */}
        {error && (
          <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Active step form */}
        <ActiveStep />

        {/* Bottom action bar */}
        <div className="flex items-center justify-between pt-5 border-t border-border">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
            >
              <Save data-icon="inline-start" className="size-4" />
              Save as Draft
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleFillSampleData}
                title="Fill sample data for development"
              >
                <Wand2 data-icon="inline-start" className="size-4" />
                Auto Fill (Dev)
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft data-icon="inline-start" className="size-4" />
              Previous
            </Button>

            {!isLastStep && (
              <Button type="button" size="sm" onClick={handleNext}>
                Next Step
                <ChevronRight data-icon="inline-end" className="size-4" />
              </Button>
            )}

            {isLastStep && (
              <Button type="button" size="sm" onClick={handleReview}>
                <Eye data-icon="inline-start" className="size-4" />
                Review Tender
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
