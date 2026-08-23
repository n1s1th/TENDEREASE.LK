"use client";

import { CheckCircle2, ShieldCheck, FileCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RequirementsTab({ tender }: any) {
  const specialRequirements = tender?.specialRequirements ? tender.specialRequirements.split("\n").filter((i: string) => i.trim() !== "") : [];
  const technicalSpecifications = tender?.scopeOfWork ? tender.scopeOfWork.split("\n").filter((i: string) => i.trim() !== "") : [];

  return (
    <div className="space-y-6">
      {/* Dynamic Requirements from Backend */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-info/10">
              <ShieldCheck className="h-4 w-4 text-info" />
            </div>
            <CardTitle>Special Requirements & Eligibility</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4">
            {specialRequirements.length > 0 ? (
              specialRequirements.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-md border border-border bg-white hover:border-primary/20 transition-colors">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-foreground">
                    {item}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-grey-1 border border-dashed border-border rounded-md">
                <p className="text-sm text-muted-foreground">Refer to the official tender documents for eligibility criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications from Scope of Work */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-warning/10">
              <FileCode className="h-4 w-4 text-warning" />
            </div>
            <CardTitle>Technical Specifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {technicalSpecifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {technicalSpecifications.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-md border border-border bg-grey-1 hover:border-primary/20 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <span className="text-sm text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Detailed technical specifications are available in the downloaded package.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}