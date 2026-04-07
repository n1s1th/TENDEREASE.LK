"use client";

import { useEffect } from "react";
import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { StepIndicator } from "@/components/tender/creation/StepIndicator";
import { TenderDetailsStep } from "@/components/tender/creation/steps/TenderDetailsStep";
import { FinancialInfoStep } from "@/components/tender/creation/steps/FinancialInfoStep";
import { BiddingDocumentsStep } from "@/components/tender/creation/steps/BiddingDocumentsStep";
import { NoticeComplianceStep } from "@/components/tender/creation/steps/NoticeComplianceStep";
import { ScheduleStep } from "@/components/tender/creation/steps/ScheduleStep";
import { TenderPreview } from "@/components/tender/creation/steps/TenderPreview";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { StepIndex } from "@/lib/types/tender-creation.types";

const STEP_COMPONENTS = [
  TenderDetailsStep,
  FinancialInfoStep,
  BiddingDocumentsStep,
  NoticeComplianceStep,
  ScheduleStep,
];

export default function TenderCreationPage() {
  const {
    currentStep,
    showPreview,
    isSubmitting,
    error,
    nextStep,
    prevStep,
    goToStep,
    setShowPreview,
    fetchReferenceData,
  } = useTenderCreationStore();

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  const ActiveStep = STEP_COMPONENTS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === 4;

  const handleSaveDraft = () => {
    alert("Save as Draft — not yet wired to backend.");
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
              <Button type="button" size="sm" onClick={nextStep}>
                Next Step
                <ChevronRight data-icon="inline-end" className="size-4" />
              </Button>
            )}

            {isLastStep && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowPreview(true)}
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
