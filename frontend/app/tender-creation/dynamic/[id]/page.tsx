"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { templateService } from "@/services/template.service";
import { DynamicStepIndicator } from "@/components/tender/creation/dynamic/DynamicStepIndicator";
import { BaseDetailsStep } from "@/components/tender/creation/dynamic/BaseDetailsStep";
import { DynamicSectionStep } from "@/components/tender/creation/dynamic/DynamicSectionStep";
import { DynamicTenderPreview } from "@/components/tender/creation/dynamic/DynamicTenderPreview";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Loader2, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function DynamicTenderCreationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);

  const {
    currentStep,
    showPreview,
    isSubmitting,
    error,
    baseData,
    dynamicData,
    nextStep,
    prevStep,
    goToStep,
    setShowPreview,
    setTemplateId,
    fetchReferenceData,
    reset,
  } = useDynamicTenderCreationStore();

  // Reset store on fresh page load so step/data from previous session is cleared
  useEffect(() => {
    reset();
    if (id) {
      loadTemplate(id);
      fetchReferenceData();
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await templateService.getTemplateById(templateId);
      setTemplate(data);
      setTemplateId(templateId);
    } catch (err) {
      console.error("Failed to load template", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-grey-1">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-grey-1 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Template Not Found</h2>
        <button
          onClick={() => router.push('/tender-templates')}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </button>
      </div>
    );
  }

  const sections = template.schema?.sections || [];
  const totalSteps = 1 + sections.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Build step labels: "Core Details" + one per template section
  const stepLabels = ["Core Details", ...sections.map((s: any) => s.title || "Section")];

  // ── Mandatory field validation ──────────────────────────────
  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      // Validate base mandatory fields
      const missing: string[] = [];
      if (!baseData.title?.trim())              missing.push("Tender Title");
      if (!baseData.referenceNumber?.trim())    missing.push("Reference Number");
      if (!baseData.procurementType)            missing.push("Procurement Type");
      if (!baseData.ministryId)                 missing.push("Ministry");
      if (!baseData.departmentAgencyId)         missing.push("Department / Agency");
      if (!baseData.estimatedBudget)            missing.push("Estimated Budget");
      if (!baseData.tenderType)                 missing.push("Tender Type");
      if (!baseData.biddingMethod)              missing.push("Bidding Method");

      if (missing.length > 0) {
        toast.error(`Please fill in required fields: ${missing.join(", ")}`);
        return false;
      }
      return true;
    }

    // Validate dynamic section fields
    const section = sections[currentStep - 1];
    if (!section) return true;

    const missing: string[] = [];
    for (const field of section.fields) {
      if (!field.required) continue;
      const val = dynamicData[field.id];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (isEmpty) missing.push(field.title);
    }

    if (missing.length > 0) {
      toast.error(`Please fill in required fields: ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    nextStep(totalSteps - 1);
  };

  const handleReview = () => {
    if (!validateCurrentStep()) return;
    setShowPreview(true);
  };

  // ── Preview mode ────────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="min-h-screen bg-grey-1">
        <Toaster position="top-right" richColors />
        <div className="border-b border-border bg-white">
          <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Review Tender — {template.name}
            </h1>
            <span className="text-xs font-medium text-grey-4 bg-primary/10 text-primary px-3 py-1 rounded-full">
              Preview
            </span>
          </div>
        </div>

        <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
          <DynamicTenderPreview sections={sections} />
        </div>
      </div>
    );
  }

  // ── Normal wizard mode ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-grey-1">
      <Toaster position="top-right" richColors />

      {/* Top bar */}
      <div className="border-b border-border bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {template.name}
              </h1>
              <p className="text-xs text-grey-5 mt-0.5">
                Step {currentStep + 1} of {totalSteps} — {stepLabels[currentStep]}
              </p>
            </div>
          </div>
          <span className="hidden sm:flex items-center text-xs font-medium text-grey-5 bg-grey-1 px-3 py-1.5 rounded-full border border-grey-2">
            {stepLabels[currentStep]}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
        {/* Dynamic step indicator */}
        <DynamicStepIndicator
          steps={stepLabels}
          currentStep={currentStep}
          onStepClick={(step) => goToStep(step)}
        />

        {error && (
          <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Active step form */}
        <div className="min-h-[400px]">
          {currentStep === 0 ? (
            <BaseDetailsStep />
          ) : (
            <DynamicSectionStep section={sections[currentStep - 1]} />
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between pt-5 border-t border-border">
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
          </div>

          <div className="flex gap-3">
            {!isLastStep && (
              <Button type="button" size="sm" onClick={handleNext}>
                Next Step
                <ChevronRight className="size-4 ml-1" />
              </Button>
            )}

            {isLastStep && (
              <Button type="button" size="sm" onClick={handleReview}>
                <Eye className="size-4 mr-1" />
                Review Tender
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
