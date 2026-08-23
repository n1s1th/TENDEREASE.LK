"use client";

import { CheckCircle2, Info, Target, TrendingUp, Building2, Layers, FileSearch, CircleDollarSign } from "lucide-react";
import type { TenderDetailsDTO } from "@/lib/types/tender.types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OverviewTab({ tender }: { tender: TenderDetailsDTO }) {
  const overview = tender?.projectOverview || tender?.description || "No project overview available.";

  const scopeItems = tender?.scopeOfWork
    ? tender.scopeOfWork.split("\n").filter((i) => i.trim() !== "")
    : ["Refer to the technical documentation for the full scope of work."];

  const formatBudget = (amount?: number) => {
    if (!amount) return "TBA";
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metaCards = [
    {
      icon: <Building2 className="h-4 w-4 text-info" />,
      label: "Ministry",
      value: tender?.ministryName || "N/A",
    },
    {
      icon: <Building2 className="h-4 w-4 text-primary" />,
      label: "Department",
      value: tender?.departmentName || "N/A",
    },
    {
      icon: <Layers className="h-4 w-4 text-warning" />,
      label: "Procurement Type",
      value: tender?.procurementType?.replace(/_/g, " ") || "N/A",
    },
    {
      icon: <FileSearch className="h-4 w-4 text-success" />,
      label: "Bidding Method",
      value: tender?.biddingMethod?.replace(/_/g, " ") || "N/A",
    },
    {
      icon: <CircleDollarSign className="h-4 w-4 text-success" />,
      label: "Estimated Budget",
      value: formatBudget(tender?.estimatedBudget),
    },
    ...(tender?.fundingSourceName
      ? [{
          icon: <TrendingUp className="h-4 w-4 text-secondary" />,
          label: "Funding Source",
          value: tender.fundingSourceName,
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* PROJECT OVERVIEW */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Project Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="prose prose-gray max-w-none mb-5">
            <p className="text-sm text-foreground leading-[1.6] whitespace-pre-line">
              {overview}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <TrendingUp size={16} className="text-success" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Verified Strategic Initiative • Priority Level: High
            </span>
          </div>
        </CardContent>
      </Card>

      {/* PROCUREMENT METADATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metaCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-grey-1 border border-border">
                {card.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{card.label}</p>
                <p className="text-sm font-semibold text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SCOPE OF WORK */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Scope of Work</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scopeItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-md border border-border bg-grey-1 hover:border-primary/20 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
