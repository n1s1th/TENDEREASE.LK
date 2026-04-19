"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Banknote,
  FolderOpen,
  ClipboardCheck,
  CalendarDays,
  SendHorizontal,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ── tiny helper ──────────────────────────────────────────── */
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

export function TenderPreview() {
  const {
    formData,
    isSubmitting,
    error,
    setShowPreview,
    submitTender,
    reset,
  } = useTenderCreationStore();

  const handleSubmit = async () => {
    // 1. Create tender and upload files (handled by store's submitTender)
    const tenderId = await submitTender();
    
    if (tenderId) {
      try {
        // 2. Submit for actual approval (this triggers the backend events)
        await api.submitForApproval(tenderId);
        alert(`Tender submitted for approval successfully! Reference: ${formData.referenceNumber}`);
        reset();
      } catch (err: any) {
        alert(`Tender created (ID: ${tenderId}) but failed to submit for approval: ${err.message}`);
      }
    } else {
      const currentError = useTenderCreationStore.getState().error;
      alert(`Failed to create tender: ${currentError || "Unknown error occurred"}`);
    }
  };

  const cl = formData.complianceChecklist;

  return (
    <div className="space-y-5">
      {/* ── Warning banner ─────────────────────────────── */}
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

      {/* ── Error banner ───────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-5 py-3 text-sm text-error flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* ─────────────────────────────────────────────────
          Section 1 — Tender Details
         ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Tender Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Tender Title" value={formData.title} />
            <Field label="Reference Number" value={formData.referenceNumber} />
            <Field label="Procurement Type" value={formData.procurementType} />
            <Field label="Bidding Method" value={formData.biddingMethod} />
            <Field label="Ministry" value={formData.ministryId} />
            <Field label="Department / Agency" value={formData.departmentAgencyId} />
            <div className="sm:col-span-2">
              <Field label="Description" value={formData.description} />
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────
          Section 2 — Financial Information
         ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Financial Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field
              label="Estimated Budget (LKR)"
              value={
                formData.estimatedBudget
                  ? Number(formData.estimatedBudget).toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                    })
                  : ""
              }
            />
            <Field label="Funding Source" value={formData.fundingSource} />
            <Field label="Tender Type" value={formData.tenderType} />
          </dl>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────
          Section 3 — Bidding Documents
         ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Bidding Documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="SBD Template" value={formData.sbdTemplate} />
            <Field label="Template Version" value={formData.templateVersion} />
          </dl>

          {formData.pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-grey-4 uppercase tracking-wider">
                Attached Files ({formData.pendingFiles.length})
              </p>
              <ul className="space-y-1">
                {formData.pendingFiles.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-grey-4">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {formData.pendingFiles.length === 0 && (
            <p className="text-sm text-grey-4 italic">No files attached.</p>
          )}
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────
          Section 4 — Compliance Checklist
         ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <ClipboardCheck className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Compliance Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <ul className="space-y-2.5">
            {([
              { key: "procurementPlanApproved" as const, label: "Procurement plan approved" },
              { key: "budgetAvailabilityConfirmed" as const, label: "Budget availability confirmed" },
              { key: "sbdComplyWithGuidelines" as const, label: "SBDs comply with guidelines" },
              { key: "evaluationCriteriaDefined" as const, label: "Evaluation criteria defined" },
            ]).map(({ key, label }) => (
              <li key={key} className="flex items-center gap-2.5 text-sm">
                {cl[key] ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-grey-3 shrink-0" />
                )}
                <span className={cl[key] ? "text-foreground" : "text-grey-4"}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────
          Section 5 — Schedule
         ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Schedule & Key Dates</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field
              label="Advertisement Start Date"
              value={formData.advertisementStartDate}
            />
            <Field
              label="Bid Submission Deadline"
              value={formData.bidSubmissionDeadline}
            />
            <Field
              label="Pre-Bid Meeting"
              value={
                formData.preBidMeetingEnabled
                  ? formData.preBidMeetingDate || "Scheduled (date not set)"
                  : "Not scheduled"
              }
            />
          </dl>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────
          Action Bar
         ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-5 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(false)}
        >
          <ArrowLeft data-icon="inline-start" className="size-4" />
          Edit Details
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <SendHorizontal data-icon="inline-start" className="size-4" />
          {isSubmitting ? "Submitting…" : "Submit for Approval"}
        </Button>
      </div>
    </div>
  );
}
