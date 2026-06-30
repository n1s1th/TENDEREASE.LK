"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote } from "lucide-react";

export function FinancialInfoStep() {
  const { formData, referenceData, updateFormData } =
    useTenderCreationStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Estimated Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-budget">Estimated Budget / Cost (LKR)</Label>
            <Input
              id="tc-budget"
              type="number"
              placeholder="0.00"
              value={formData.estimatedBudget}
              onChange={(e) =>
                updateFormData({ estimatedBudget: e.target.value })
              }
            />
          </div>

          {/* Funding Source */}
          <div className="space-y-1.5">
            <Label>Govt. Funding Source</Label>
            <Select
              value={formData.fundingSource}
              onValueChange={(v) => updateFormData({ fundingSource: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Funding Source" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.fundingSources.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.code ?? item.id)}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tender Type */}
          <div className="space-y-1.5">
            <Label>Tender Type</Label>
            <Select
              value={formData.tenderType}
              onValueChange={(v) => updateFormData({ tenderType: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Tender Type" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.tenderTypes.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.code ?? item.id)}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
  );
}

