"use client";

import { FileText, Download, AlertCircle, Tag, FilePlus2 } from "lucide-react";
import type { TenderAddendum } from "@/lib/types/tender.types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddendaTab({ addenda }: { addenda?: TenderAddendum[] }) {
  const items = addenda || [];

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-grey-1 flex items-center justify-center mb-4 text-muted-foreground">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No Addenda Issued</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no amendments or addenda issued for this tender yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FilePlus2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Addenda & Amendments</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {items.map((amendment, index) => (
            <div
              key={amendment.id ?? index}
              className="rounded-md border border-border bg-white p-5 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-warning/10 border border-warning/20 text-warning text-[10px] font-bold uppercase tracking-wider">
                    Addendum {String(amendment.amendmentNumber || index + 1).padStart(3, "0")}
                  </span>
                  {amendment.version && amendment.version > 1 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-info/10 border border-info/20 text-info text-[10px] font-bold uppercase tracking-wider">
                      <Tag size={10} />
                      v{amendment.version}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{formatDate(amendment.createdAt)}</span>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{amendment.title}</h3>

                {amendment.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{amendment.description}</p>
                )}

                {amendment.changeNote && (
                  <div className="bg-warning/5 border border-warning/10 rounded-md px-4 py-3">
                    <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1">Change Summary</p>
                    <p className="text-sm font-medium text-foreground">{amendment.changeNote}</p>
                  </div>
                )}

                {amendment.newClosingDate && (
                  <p className="text-xs font-medium text-muted-foreground">
                    New Closing Date:{" "}
                    <span className="text-error font-semibold">{formatDate(amendment.newClosingDate)}</span>
                  </p>
                )}
              </div>

              {/* Document download (if linked to a versioned document) */}
              {amendment.documentName && (
                <div className="mt-4 bg-grey-1 border border-border rounded-md p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-secondary/10 flex items-center justify-center text-secondary">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{amendment.documentName}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Version {amendment.version ?? 1} · Updated Document
                      </p>
                    </div>
                  </div>
                  {amendment.downloadUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={amendment.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No file</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3 bg-warning/5 border border-warning/10">
          <AlertCircle className="text-warning shrink-0" size={20} />
          <p className="text-sm font-medium text-warning/90">
            <span className="font-semibold">Important:</span> All mandatory addenda must be acknowledged in your submitted bid documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}