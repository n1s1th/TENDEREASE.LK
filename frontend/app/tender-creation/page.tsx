"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { StepIndicator } from "@/components/tender/creation/StepIndicator";
import { TenderDetailsStep } from "@/components/tender/creation/steps/TenderDetailsStep";
import { FinancialInfoStep } from "@/components/tender/creation/steps/FinancialInfoStep";
import { BiddingDocumentsStep } from "@/components/tender/creation/steps/BiddingDocumentsStep";
import { NoticeComplianceStep } from "@/components/tender/creation/steps/NoticeComplianceStep";
import { ScheduleStep } from "@/components/tender/creation/steps/ScheduleStep";
import { TenderPreview } from "@/components/tender/creation/steps/TenderPreview";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Eye, Wand2 } from "lucide-react";
import type { StepIndex } from "@/lib/types/tender-creation.types";

const STEP_COMPONENTS = [
  TenderDetailsStep,
  FinancialInfoStep,
  BiddingDocumentsStep,
  NoticeComplianceStep,
  ScheduleStep,
];

const step0Schema = z.object({
  title: z.string().min(1, "Title is required"),
  referenceNumber: z.string().min(1, "Reference Number is required"),
  procurementType: z.string().min(1, "Procurement Type is required"),
  biddingMethod: z.string().min(1, "Bidding Method is required"),
  ministryId: z.string().min(1, "Ministry is required"),
  departmentAgencyId: z.string().min(1, "Department/Agency is required"),
  description: z.string().min(1, "Description is required"),
});

const step1Schema = z.object({
  estimatedBudget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valid Estimated Budget is required"),
  fundingSource: z.string().min(1, "Funding Source is required"),
  tenderType: z.string().min(1, "Tender Type is required"),
});

const step2Schema = z.object({
  sbdTemplate: z.string().min(1, "SBD Template is required"),
});

const step3Schema = z.object({
  complianceChecklist: z.object({
    procurementPlanApproved: z.boolean().refine((val) => val === true, "Procurement Plan must be approved"),
    budgetAvailabilityConfirmed: z.boolean().refine((val) => val === true, "Budget Availability must be confirmed"),
    sbdComplyWithGuidelines: z.boolean().refine((val) => val === true, "SBD must comply with guidelines"),
    evaluationCriteriaDefined: z.boolean().refine((val) => val === true, "Evaluation Criteria must be defined"),
  }),
});

const step4Schema = z.object({
  advertisementStartDate: z.string().min(1, "Advertisement Start Date is required"),
  bidSubmissionDeadline: z.string().min(1, "Bid Submission Deadline is required"),
  preBidMeetingEnabled: z.boolean(),
  preBidMeetingDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.preBidMeetingEnabled && !data.preBidMeetingDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pre-Bid Meeting Date is required when enabled",
      path: ["preBidMeetingDate"],
    });
  }
});

const schemas = [step0Schema, step1Schema, step2Schema, step3Schema, step4Schema];

export default function TenderCreationPage() {
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
    fetchReferenceData,
    updateFormData,
  } = useTenderCreationStore();
  
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Clear validation error when step changes
  useEffect(() => {
    setValidationError(null);
  }, [currentStep]);

  const ActiveStep = STEP_COMPONENTS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === 4;

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
    // Go to the last step and show preview
    goToStep(4);
    setShowPreview(true);
  };

  const handleNextStep = () => {
    const currentSchema = schemas[currentStep];
    const result = currentSchema.safeParse(formData);
    
    if (!result.success) {
      const firstError = result.error?.issues?.[0]?.message || result.error?.errors?.[0]?.message || "Please fill in all required fields correctly.";
      setValidationError(firstError);
      return;
    }
    
    setValidationError(null);
    nextStep();
  };

  const handleReviewTender = () => {
    const currentSchema = schemas[currentStep];
    const result = currentSchema.safeParse(formData);
    
    if (!result.success) {
      const firstError = result.error?.issues?.[0]?.message || result.error?.errors?.[0]?.message || "Please fill in all required fields correctly.";
      setValidationError(firstError);
      return;
    }
    
    setValidationError(null);
    setShowPreview(true);
  };

  // ── Preview mode ────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="min-h-screen bg-grey-1">
        {/* Top bar */}
        <div className="border-b border-border bg-white">
          <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Review Tender
            </h1>
            <span className="text-xs font-medium text-grey-4">
              Preview
            </span>
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Create New Tender
          </h1>
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
        {(error || validationError) && (
          <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
            <span className="font-medium">Error:</span> {error || validationError}
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
            
            {/* Development Mode: Fill Sample Data Button */}
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
              <Button type="button" size="sm" onClick={handleNextStep}>
                Next Step
                <ChevronRight data-icon="inline-end" className="size-4" />
              </Button>
            )}

            {isLastStep && (
              <Button
                type="button"
                size="sm"
                onClick={handleReviewTender}
              >
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

