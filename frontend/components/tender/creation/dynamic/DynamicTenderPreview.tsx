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
  AlertTriangle,
  ArrowLeft,
  SendHorizontal,
  FolderOpen,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";

interface DynamicTenderPreviewProps {
  sections: TemplateSection[];
  template?: any;
}

export function DynamicTenderPreview({ sections, template }: DynamicTenderPreviewProps) {
  const router = useRouter();
  const {
    dynamicData,
    isSubmitting,
    error,
    setShowPreview,
    submitTender,
    reset,
  } = useDynamicTenderCreationStore();

  const handleSubmit = async () => {
    const { tenderId, tenderNumber } = await submitTender(sections, template?.name);

    if (tenderId) {
      try {
        await api.submitForApproval(tenderId);
        toast.success(`Tender submitted for approval! Reference: ${tenderNumber}`);
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

      {/* ── Template Header Card ─────────────────────────────────── */}
      {template && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.description && (
                    <p className="text-xs text-grey-5 mt-0.5">{template.description}</p>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {template.status || "PUBLISHED"}
              </span>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ── Dynamic Template Sections ──────────────────────────────── */}
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="border-b border-border bg-grey-1/30 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.description && (
                  <p className="text-xs text-grey-5 mt-0.5">{section.description}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-6">
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
                      <dt className="text-xs font-medium text-grey-4 uppercase tracking-wider mb-1.5">
                        {field.title}
                        {field.required && <span className="text-error ml-1">*</span>}
                      </dt>
                      <dd className="text-sm text-foreground whitespace-pre-wrap bg-grey-1/30 p-3.5 rounded-md border border-border">
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
                      <dd className="text-sm text-grey-5 italic">File attachment</dd>
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
