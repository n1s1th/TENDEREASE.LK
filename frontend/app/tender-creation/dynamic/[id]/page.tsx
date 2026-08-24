"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { templateService } from "@/services/template.service";
import { DynamicStepIndicator } from "@/components/tender/creation/dynamic/DynamicStepIndicator";
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
  const totalSteps = sections.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Step labels correspond 1-to-1 with the template's defined sections
  const stepLabels = sections.map((s: any, idx: number) => s.title || `Section ${idx + 1}`);

  // ── Mandatory field validation for the active section ──────────────
  const validateCurrentStep = (): boolean => {
    const section = sections[currentStep];
    if (!section) return true;

    const missing: string[] = [];
    for (const field of section.fields || []) {
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
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Review Tender
              </h1>
              <p className="text-xs text-grey-5 mt-0.5">{template.name}</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Preview Mode
            </span>
          </div>
        </div>

        <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
          <DynamicTenderPreview sections={sections} template={template} />
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
                {totalSteps > 0 ? (
                  <>Step {currentStep + 1} of {totalSteps} — {stepLabels[currentStep]}</>
                ) : (
                  "No sections configured"
                )}
              </p>
            </div>
          </div>
          {totalSteps > 0 && (
            <span className="hidden sm:flex items-center text-xs font-semibold text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-full">
              {stepLabels[currentStep]}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
        {/* Dynamic step indicator matching template sections */}
        {totalSteps > 1 && (
          <DynamicStepIndicator
            steps={stepLabels}
            currentStep={currentStep}
            onStepClick={(step) => {
              // Only allow jumping to previous steps or next if valid
              if (step < currentStep || validateCurrentStep()) {
                goToStep(step);
              }
            }}
          />
        )}

        {error && (
          <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Active step form */}
        <div className="min-h-[400px]">
          {sections[currentStep] ? (
            <DynamicSectionStep section={sections[currentStep]} />
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-grey-2 text-grey-5">
              No fields configured for this template.
            </div>
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
            {!isLastStep && totalSteps > 1 && (
              <Button type="button" size="sm" onClick={handleNext}>
                Next Step
                <ChevronRight className="size-4 ml-1" />
              </Button>
            )}

            {(isLastStep || totalSteps <= 1) && (
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
