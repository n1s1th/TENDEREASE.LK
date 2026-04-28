"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { templateService } from "@/services/template.service";
import { StepIndicator } from "@/components/tender/creation/StepIndicator";
import { BaseDetailsStep } from "@/components/tender/creation/dynamic/BaseDetailsStep";
import { DynamicSectionStep } from "@/components/tender/creation/dynamic/DynamicSectionStep";
import { DynamicTenderPreview } from "@/components/tender/creation/dynamic/DynamicTenderPreview";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Eye, Loader2, ArrowLeft } from "lucide-react";

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
    nextStep,
    prevStep,
    goToStep,
    setShowPreview,
    setTemplateId,
    fetchReferenceData,
  } = useDynamicTenderCreationStore();

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

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

  const handleSaveDraft = () => {
    alert("Save as Draft \u2014 not yet wired to backend.");
  };

  // ── Preview mode ────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="min-h-screen bg-grey-1">
        <div className="border-b border-border bg-white">
          <div className="max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Review Dynamic Tender
            </h1>
            <span className="text-xs font-medium text-grey-4">Preview</span>
          </div>
        </div>

        <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
          <DynamicTenderPreview sections={sections} />
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {template.name}
            </h1>
          </div>
          <span className="text-xs font-medium text-grey-4">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[960px] mx-auto px-5 py-10 space-y-10">
        {/* StepIndicator handles max 5 standard steps, we constrain it visually */}
        <StepIndicator
          currentStep={currentStep > 4 ? 4 : currentStep}
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
              <Button type="button" size="sm" onClick={() => nextStep(totalSteps - 1)}>
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
