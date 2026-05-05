"use client";

import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { TemplateSection } from "@/store/tender-template/template-designer.store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  ArrowLeft,
  SendHorizontal,
  FolderOpen
} from "lucide-react";

interface DynamicTenderPreviewProps {
  sections: TemplateSection[];
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export function DynamicTenderPreview({ sections }: DynamicTenderPreviewProps) {
  const router = useRouter();
  const {
    baseData,
    dynamicData,
    isSubmitting,
    error,
    setShowPreview,
    submitTender,
    reset,
  } = useDynamicTenderCreationStore();

  const handleSubmit = async () => {
    const tenderId = await submitTender();
    
    if (tenderId) {
      try {
        await api.submitForApproval(tenderId);
        alert(`Tender submitted for approval successfully! Reference: ${baseData.referenceNumber}`);
        reset();
        router.push('/tenders');
      } catch (err: any) {
        alert(`Tender created (ID: ${tenderId}) but failed to submit for approval: ${err.message}`);
      }
    } else {
      const currentError = useDynamicTenderCreationStore.getState().error;
      alert(`Failed to create tender: ${currentError || "Unknown error occurred"}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 px-5 py-3.5">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Please review carefully
          </p>
          <p className="text-xs text-grey-5 mt-0.5">
            You cannot edit after submission.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* ── Base Details ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Mandatory Core Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Tender Title" value={baseData.title || ''} />
            <Field label="Reference Number" value={baseData.referenceNumber || ''} />
            <Field label="Procurement Type" value={baseData.procurementType || ''} />
            <Field label="Bidding Method" value={baseData.biddingMethod || ''} />
            <Field label="Ministry" value={baseData.ministryId || ''} />
            <Field label="Department" value={baseData.departmentAgencyId || ''} />
            <Field label="Estimated Budget (LKR)" value={baseData.estimatedBudget || ''} />
            <Field label="Funding Source" value={baseData.fundingSource || ''} />
            <Field label="Tender Type" value={baseData.tenderType || ''} />
          </dl>
          {baseData.description && (
            <div className="mt-6 pt-5 border-t border-border">
              <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider mb-2">Description</dt>
              <dd className="text-sm text-foreground whitespace-pre-wrap">{baseData.description}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dynamic Sections ───────────────────────────────────── */}
      {sections.map((section, idx) => (
        <Card key={section.id}>
          <CardHeader className="border-b border-border bg-grey-1/30">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <CardTitle>{section.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map(field => {
                let displayVal = dynamicData[field.id];
                if (Array.isArray(displayVal)) {
                  displayVal = displayVal.join(", ");
                }
                
                // For long text areas
                if (field.type === 'PARAGRAPH') {
                  return (
                    <div key={field.id} className="col-span-full">
                      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider mb-2">{field.title}</dt>
                      <dd className="text-sm text-foreground whitespace-pre-wrap bg-grey-1/30 p-4 rounded-md border border-border">
                        {displayVal || "—"}
                      </dd>
                    </div>
                  );
                }

                return <Field key={field.id} label={field.title} value={displayVal} />;
              })}
            </dl>
          </CardContent>
        </Card>
      ))}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-5 mt-10">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowPreview(false)}
          disabled={isSubmitting}
        >
          <ArrowLeft data-icon="inline-start" className="size-4" />
          Edit Information
        </Button>

        <Button
          size="lg"
          className="px-8 shadow-sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Submit for Approval
              <SendHorizontal data-icon="inline-end" className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
