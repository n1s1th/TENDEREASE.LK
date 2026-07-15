"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote } from "lucide-react";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1">{message}</p>;
}

export function FinancialInfoStep() {
  const { formData, referenceData, formErrors, updateFormData } =
    useTenderCreationStore();

  return (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
          {/* Estimated Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-budget">Estimated Budget / Cost (LKR) <span className="text-error">*</span></Label>
            <Input
              id="tc-budget"
              type="number"
              placeholder="0.00"
              value={formData.estimatedBudget}
              onChange={(e) => updateFormData({ estimatedBudget: e.target.value })}
              aria-invalid={!!formErrors.estimatedBudget}
            />
            <FieldError message={formErrors.estimatedBudget} />
          </div>

          {/* Funding Source */}
          <div className="space-y-1.5">
            <Label>Govt. Funding Source <span className="text-error">*</span></Label>
            <Select
              value={formData.fundingSource}
              onValueChange={(v) => updateFormData({ fundingSource: v })}
            >
              <SelectTrigger className={`w-full ${formErrors.fundingSource ? "border-error" : ""}`}>
                <SelectValue placeholder="Select Funding Source" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.fundingSources.map((item) => (
                  <SelectItem key={item.id} value={String(item.code ?? item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={formErrors.fundingSource} />
          </div>

          {/* Tender Type */}
          <div className="space-y-1.5">
            <Label>Tender Type <span className="text-error">*</span></Label>
            <Select
              value={formData.tenderType}
              onValueChange={(v) => updateFormData({ tenderType: v })}
            >
              <SelectTrigger className={`w-full ${formErrors.tenderType ? "border-error" : ""}`}>
                <SelectValue placeholder="Select Tender Type" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.tenderTypes.map((item) => (
                  <SelectItem key={item.id} value={String(item.code ?? item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={formErrors.tenderType} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
