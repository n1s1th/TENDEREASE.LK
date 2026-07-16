"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Eye, ClipboardCheck, CheckCircle2 } from "lucide-react";

export function NoticeComplianceStep() {
  const { formData, formErrors, updateComplianceItem } = useTenderCreationStore();
  const cl = formData.complianceChecklist;

  const checklistItems: {
    key: keyof typeof cl;
    label: string;
  }[] = [
    { key: "procurementPlanApproved", label: "Procurement plan approved" },
    { key: "budgetAvailabilityConfirmed", label: "Budget availability confirmed" },
    { key: "sbdComplyWithGuidelines", label: "SBDs comply with guidelines" },
    { key: "evaluationCriteriaDefined", label: "Evaluation criteria defined" },
  ];

  const hasComplianceError = checklistItems.some((item) => formErrors[item.key]);

  return (
    <div className="space-y-5">
      {/* Notice Preview */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Tender Notice Preview</CardTitle>
              <CardDescription>Auto-generated from your inputs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="rounded-md border border-border bg-grey-1 p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-primary mb-3">
              INVITATION FOR BIDS
            </h3>
            <div className="space-y-1.5 text-sm text-grey-5">
              <p>
                <span className="font-medium text-foreground">Contract:</span>{" "}
                {formData.title || "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Reference:</span>{" "}
                {formData.referenceNumber || "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Deadline:</span>{" "}
                {formData.bidSubmissionDeadline || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card className={hasComplianceError ? "border-error/40" : ""}>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <ClipboardCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>
                Compliance Checklist <span className="text-error">*</span>
              </CardTitle>
              {hasComplianceError && (
                <p className="text-xs text-error mt-0.5">All items must be confirmed before proceeding.</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 cursor-pointer group rounded-md p-2.5 -mx-2.5 hover:bg-grey-1 transition-colors"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={cl[item.key]}
                    onChange={(e) => updateComplianceItem(item.key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`h-5 w-5 rounded border-2 transition-colors flex items-center justify-center ${
                    cl[item.key]
                      ? "border-primary bg-primary"
                      : formErrors[item.key]
                      ? "border-error"
                      : "border-grey-3"
                  }`}>
                    {cl[item.key] && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                </div>
                <span className={`text-sm ${formErrors[item.key] && !cl[item.key] ? "text-error" : "text-foreground"}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
