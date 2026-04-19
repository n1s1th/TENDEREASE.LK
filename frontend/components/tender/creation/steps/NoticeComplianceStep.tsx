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
  const { formData, updateComplianceItem } = useTenderCreationStore();
  const cl = formData.complianceChecklist;

  const checklistItems: {
    key: keyof typeof cl;
    label: string;
  }[] = [
    {
      key: "procurementPlanApproved",
      label: "Procurement plan approved",
    },
    {
      key: "budgetAvailabilityConfirmed",
      label: "Budget availability confirmed",
    },
    {
      key: "sbdComplyWithGuidelines",
      label: "SBDs comply with guidelines",
    },
    {
      key: "evaluationCriteriaDefined",
      label: "Evaluation criteria defined",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Notice Preview */}
      <div>
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
        </div>

      {/* Compliance Checklist */}
      <div>
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
                    onChange={(e) =>
                      updateComplianceItem(item.key, e.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded border-2 border-grey-3 peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                    {cl[item.key] && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-foreground group-hover:text-foreground">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
    </div>
  );
}

