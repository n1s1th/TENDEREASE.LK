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
import { Save, ChevronLeft, ChevronRight, Eye, Wand2 } from "lucide-react";
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
    updateFormData,
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
      <div className="min-h-screen bg-grey-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-br from-[#953002] to-[#FFB401] rounded-b-[40%] opacity-90 -z-10" />
        <div className="max-w-[960px] mx-auto px-5 pt-8 pb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Review Tender</h1>
          <Button variant="outline" className="border-grey-3 hover:bg-grey-2" onClick={() => setShowPreview(false)}>
            Back to Edit
          </Button>
        </div>
        <div className="max-w-[960px] mx-auto px-5 py-6 space-y-10">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <TenderPreview />
          </div>
        </div>
      </div>
    );
  }

  // ── Dynamic step texts ──
  const stepTitles = [
    "Your Profile & Basic Info",
    "Financial Information",
    "Bidding Documents",
    "Compliance Checklist",
    "Schedule & Dates"
  ];
  const stepDescriptions = [
    "Enter the primary details for your tender. You will be able to attach documents later.",
    "Provide budget details, funding source, and select the appropriate tender type.",
    "Select templates and attach all mandatory bidding documents.",
    "Ensure all pre-requisites are met before this tender can be approved.",
    "Define the advertisement, submission, and meeting dates."
  ];

  // ── Normal wizard mode ──────────────────────────────────
  return (
    <div className="min-h-screen bg-grey-1 relative overflow-hidden font-sans pb-20">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-br from-[#953002] via-[#d65011] to-[#FFB401] rounded-b-[40%] lg:rounded-b-[50%] opacity-90 -z-10 shadow-lg" />
      
      {/* Header */}
      <div className="max-w-[1024px] mx-auto px-5 pt-10 pb-6 flex items-center justify-center relative">
        <Button variant="ghost" className="absolute left-5 top-10 hover:bg-grey-2" onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Create New Tender
        </h1>
      </div>

      {/* Main Elevated Container */}
      <div className="max-w-[1024px] mx-auto px-5">
        <div className="bg-white rounded-[24px] shadow-xl p-6 md:p-10 min-h-[600px] flex flex-col relative z-10 border border-grey-2/50">
          
          {/* Top Step Indicator inside card */}
          <div className="mb-10">
            <StepIndicator
              currentStep={currentStep}
              onStepClick={(step: StepIndex) => goToStep(step)}
            />
          </div>

          {/* Dynamic Step Title Area */}
          <div className="text-center mb-10 max-w-xl mx-auto">
            <p className="text-[#9ca3af] font-medium text-sm tracking-widest uppercase mb-2">Step {currentStep + 1}</p>
            <h2 className="text-3xl font-semibold text-[#1f2937] mb-3">{stepTitles[currentStep]}</h2>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              {stepDescriptions[currentStep]}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4 text-sm text-error flex items-center gap-3 mb-8 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-xs bg-error text-white px-2 py-0.5 rounded-sm">Error</span> 
              <span>{error}</span>
            </div>
          )}

          {/* Active step form area */}
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <ActiveStep />
          </div>

          {/* Bottom action bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-10 border-t border-grey-2 gap-4">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              
              {/* Development Mode: Fill Sample Data Button */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleFillSampleData}
                  title="Fill sample data for development"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Auto Fill (Dev)
                </Button>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {!isLastStep && (
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {isLastStep && (
                <Button
                  type="button"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Review Tender
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

