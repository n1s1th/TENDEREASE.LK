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
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

interface DynamicTenderPreviewProps {
  sections: TemplateSection[];
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-sm text-foreground font-medium">{value || "—"}</dd>
    </div>
  );
}

export function DynamicTenderPreview({ sections }: DynamicTenderPreviewProps) {
  const router = useRouter();
  const {
    baseData,
    dynamicData,
    referenceData,
    isSubmitting,
    error,
    setShowPreview,
    submitTender,
    reset,
  } = useDynamicTenderCreationStore();

  // Resolve names from reference data instead of showing raw IDs
  const ministryName =
    referenceData.ministries.find((m) => String(m.id) === String(baseData.ministryId))?.name ||
    baseData.ministryId || "—";

  const departmentName =
    referenceData.departments.find((d) => String(d.id) === String(baseData.departmentAgencyId))?.name ||
    baseData.departmentAgencyId || "—";

  const procurementTypeName =
    referenceData.procurementTypes.find(
      (p) => String(p.code ?? p.id) === String(baseData.procurementType)
    )?.name || baseData.procurementType || "—";

  const biddingMethodName =
    referenceData.biddingMethods.find(
      (b) => String(b.code ?? b.id) === String(baseData.biddingMethod)
    )?.name || baseData.biddingMethod || "—";

  const fundingSourceName =
    referenceData.fundingSources.find(
      (f) => String(f.code ?? f.id) === String(baseData.fundingSource)
    )?.name || baseData.fundingSource || "—";

  const tenderTypeName =
    referenceData.tenderTypes.find(
      (t) => String(t.code ?? t.id) === String(baseData.tenderType)
    )?.name || baseData.tenderType || "—";

  const handleSubmit = async () => {
    const tenderId = await submitTender();

    if (tenderId) {
      try {
        await api.submitForApproval(tenderId);
        toast.success(`Tender submitted for approval! Reference: ${baseData.referenceNumber}`);
        reset();
        router.push("/tenders");
      } catch (err: any) {
        toast.warning(
          `Tender created (ID: ${tenderId}) but failed to submit for approval: ${err.message}`
        );
      }
    } else {
      const currentError = useDynamicTenderCreationStore.getState().error;
      toast.error(`Failed to create tender: ${currentError || "Unknown error occurred"}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 px-5 py-3.5">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Please review carefully</p>
          <p className="text-xs text-grey-5 mt-0.5">
            You cannot edit after submission. Click "Edit Information" to go back and make changes.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* ── Core Details ─────────────────────────────────────────── */}
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
            <div className="sm:col-span-2 lg:col-span-3 space-y-0.5">
              <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider">Tender Title</dt>
              <dd className="text-sm text-foreground font-medium">{baseData.title || "—"}</dd>
            </div>
            <Field label="Reference Number" value={baseData.referenceNumber || ""} />
            <Field label="Procurement Type" value={procurementTypeName} />
            <Field label="Bidding Method" value={biddingMethodName} />
            <Field label="Ministry" value={ministryName} />
            <Field label="Department / Agency" value={departmentName} />
            <Field
              label="Estimated Budget (LKR)"
              value={
                baseData.estimatedBudget
                  ? `LKR ${Number(baseData.estimatedBudget).toLocaleString()}`
                  : ""
              }
            />
            <Field label="Funding Source" value={fundingSourceName} />
            <Field label="Tender Type" value={tenderTypeName} />
          </dl>
          {baseData.description && (
            <div className="mt-6 pt-5 border-t border-border">
              <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider mb-2">
                Description
              </dt>
              <dd className="text-sm text-foreground whitespace-pre-wrap bg-grey-1/30 p-4 rounded-md border border-border">
                {baseData.description}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dynamic Template Sections ──────────────────────────────── */}
      {sections.map((section) => (
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
              {section.fields.map((field) => {
                let displayVal = dynamicData[field.id];

                if (Array.isArray(displayVal)) {
                  displayVal = displayVal.join(", ");
                }

                if (field.type === "CURRENCY" && displayVal) {
                  displayVal = `LKR ${Number(displayVal).toLocaleString()}`;
                }

                if (field.type === "PARAGRAPH") {
                  return (
                    <div key={field.id} className="col-span-full">
                      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider mb-2">
                        {field.title}
                        {field.required && <span className="text-error ml-1">*</span>}
                      </dt>
                      <dd className="text-sm text-foreground whitespace-pre-wrap bg-grey-1/30 p-4 rounded-md border border-border">
                        {displayVal || "—"}
                      </dd>
                    </div>
                  );
                }

                if (field.type === "FILE_UPLOAD" || field.type === "DOCUMENT_UPLOAD") {
                  return (
                    <div key={field.id} className="col-span-full space-y-0.5">
                      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider">
                        {field.title}
                        {field.required && <span className="text-error ml-1">*</span>}
                      </dt>
                      <dd className="text-sm text-grey-5 italic">File upload (pending attachment)</dd>
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="space-y-0.5">
                    <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider">
                      {field.title}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </dt>
                    <dd className="text-sm text-foreground font-medium">{displayVal || "—"}</dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      ))}

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-5 mt-10">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowPreview(false)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="size-4 mr-2" />
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
              <SendHorizontal className="size-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
