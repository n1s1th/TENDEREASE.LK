"use client";

import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { FileText, Banknote } from "lucide-react";

export function BaseDetailsStep() {
  const { baseData, referenceData, updateBaseData, fetchDepartments } =
    useDynamicTenderCreationStore();

  const handleMinistryChange = (value: string) => {
    updateBaseData({ ministryId: value, departmentAgencyId: "" });
    fetchDepartments(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Mandatory Procurement Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {/* Tender Title */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="tc-title">Tender Title <span className="text-error">*</span></Label>
              <Input
                id="tc-title"
                placeholder="Enter tender title"
                value={baseData.title}
                onChange={(e) => updateBaseData({ title: e.target.value })}
              />
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5">
              <Label htmlFor="tc-ref">Tender / Reference Number <span className="text-error">*</span></Label>
              <Input
                id="tc-ref"
                placeholder="e.g. NC/200/2031"
                value={baseData.referenceNumber}
                onChange={(e) => updateBaseData({ referenceNumber: e.target.value })}
              />
            </div>

            {/* Procurement Type */}
            <div className="space-y-1.5">
              <Label>Procurement Type <span className="text-error">*</span></Label>
              <Select
                value={baseData.procurementType}
                onValueChange={(v) => updateBaseData({ procurementType: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.procurementTypes.map((item) => (
                    <SelectItem key={item.id} value={String(item.code ?? item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ministry */}
            <div className="space-y-1.5">
              <Label>Ministry <span className="text-error">*</span></Label>
              <Select
                value={baseData.ministryId}
                onValueChange={handleMinistryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Ministry" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.ministries.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department / Agency */}
            <div className="space-y-1.5">
              <Label>Department / Agency <span className="text-error">*</span></Label>
              <Select
                value={baseData.departmentAgencyId}
                onValueChange={(v) => updateBaseData({ departmentAgencyId: v })}
                disabled={!baseData.ministryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.departments.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="tc-desc">Description</Label>
              <Textarea
                id="tc-desc"
                className="min-h-[100px]"
                placeholder="Enter description..."
                value={baseData.description}
                onChange={(e) => updateBaseData({ description: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Mandatory Financial Information</CardTitle>
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
                value={baseData.estimatedBudget}
                onChange={(e) => updateBaseData({ estimatedBudget: e.target.value })}
              />
            </div>

            {/* Funding Source */}
            <div className="space-y-1.5">
              <Label>Govt. Funding Source</Label>
              <Select
                value={baseData.fundingSource}
                onValueChange={(v) => updateBaseData({ fundingSource: v })}
              >
                <SelectTrigger className="w-full">
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
            </div>

            {/* Tender Type */}
            <div className="space-y-1.5">
              <Label>Tender Type <span className="text-error">*</span></Label>
              <Select
                value={baseData.tenderType}
                onValueChange={(v) => updateBaseData({ tenderType: v })}
              >
                <SelectTrigger className="w-full">
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
            </div>
            
            {/* Bidding Method */}
            <div className="space-y-1.5">
              <Label>Bidding Method <span className="text-error">*</span></Label>
              <Select
                value={baseData.biddingMethod}
                onValueChange={(v) => updateBaseData({ biddingMethod: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {referenceData.biddingMethods.map((item) => (
                    <SelectItem key={item.id} value={String(item.code ?? item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
