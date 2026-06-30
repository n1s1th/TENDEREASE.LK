"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
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
import { FileText } from "lucide-react";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1">{message}</p>;
}

export function TenderDetailsStep() {
  const { formData, referenceData, formErrors, updateFormData, fetchDepartments } =
    useTenderCreationStore();

  const handleMinistryChange = (value: string) => {
    updateFormData({ ministryId: value, departmentAgencyId: "" });
    fetchDepartments(value);
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>Basic Tender Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
          {/* Tender Title */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-title">Tender Title <span className="text-error">*</span></Label>
            <Input
              id="tc-title"
              placeholder="Enter tender title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              aria-invalid={!!formErrors.title}
            />
            <FieldError message={formErrors.title} />
          </div>

          {/* Reference Number */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-ref">Tender / Reference Number <span className="text-error">*</span></Label>
            <Input
              id="tc-ref"
              placeholder="e.g. NC/200/2031"
              value={formData.referenceNumber}
              onChange={(e) => updateFormData({ referenceNumber: e.target.value })}
              aria-invalid={!!formErrors.referenceNumber}
            />
            <FieldError message={formErrors.referenceNumber} />
          </div>

          {/* Procurement Type */}
          <div className="space-y-1.5">
            <Label>Procurement Type <span className="text-error">*</span></Label>
            <Select
              value={formData.procurementType}
              onValueChange={(v) => updateFormData({ procurementType: v })}
            >
              <SelectTrigger className={`w-full ${formErrors.procurementType ? "border-error" : ""}`}>
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
            <FieldError message={formErrors.procurementType} />
          </div>

          {/* Bidding Method */}
          <div className="space-y-1.5">
            <Label>Bidding Method <span className="text-error">*</span></Label>
            <Select
              value={formData.biddingMethod}
              onValueChange={(v) => updateFormData({ biddingMethod: v })}
            >
              <SelectTrigger className={`w-full ${formErrors.biddingMethod ? "border-error" : ""}`}>
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
            <FieldError message={formErrors.biddingMethod} />
          </div>

          {/* Ministry */}
          <div className="space-y-1.5">
            <Label>Ministry <span className="text-error">*</span></Label>
            <Select
              value={formData.ministryId}
              onValueChange={handleMinistryChange}
            >
              <SelectTrigger className={`w-full ${formErrors.ministryId ? "border-error" : ""}`}>
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
            <FieldError message={formErrors.ministryId} />
          </div>

          {/* Department / Agency */}
          <div className="space-y-1.5">
            <Label>Department / Agency <span className="text-error">*</span></Label>
            <Select
              value={formData.departmentAgencyId}
              onValueChange={(v) => updateFormData({ departmentAgencyId: v })}
              disabled={!formData.ministryId}
            >
              <SelectTrigger className={`w-full ${formErrors.departmentAgencyId ? "border-error" : ""}`}>
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
            <FieldError message={formErrors.departmentAgencyId} />
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="tc-desc">Description <span className="text-error">*</span></Label>
            <Textarea
              id="tc-desc"
              placeholder="Provide a brief description of the tender"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              aria-invalid={!!formErrors.description}
            />
            <FieldError message={formErrors.description} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
