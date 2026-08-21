"use client";

import { FileText, Download, ShieldCheck, Clock, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DocumentsTab({ documents }: any) {
  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-grey-1 flex items-center justify-center mb-4 text-muted-foreground">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No Documents Available</h3>
          <p className="text-sm text-muted-foreground max-w-sm">There are no downloadable documents associated with this tender.</p>
        </CardContent>
      </Card>
    );
  }

  const documentsData = documents;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Tender Documents</CardTitle>
            </div>
          </div>
          <Button
            onClick={() => {
              window.open(
                `http://localhost:8082/api/tenders/${documents[0]?.tenderId}/documents/download-all`,
                "_blank"
              );
            }}
            variant="default"
            size="sm"
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {documentsData.map((d: any) => (
            <div
              key={d.id}
              className="flex items-center justify-between bg-white p-4 rounded-md border border-border hover:border-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-secondary/10 flex items-center justify-center text-secondary">
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {d.documentName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>{d.documentType || "PDF"}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>
                      {d.fileSizeBytes
                        ? d.fileSizeBytes >= 1024 * 1024
                          ? `${(d.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(d.fileSizeBytes / 1024)} KB`
                        : "—"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "TBA"}</span>
                    </div>
                    {d.version && d.version > 1 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="flex items-center gap-0.5 text-info">
                          <Tag size={10} /> v{d.version}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" size="sm">
                <a
                  href={d.downloadUrl || d.fileUrl || "#"}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Info Box */}
      <Card>
        <CardContent className="p-4 flex items-start gap-3 bg-info/5 border border-info/10">
          <ShieldCheck className="text-info shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-bold text-info uppercase tracking-wider mb-1">Submission Integrity</h4>
            <p className="text-sm font-medium text-info/80">
              All documents are cryptographically signed. Any modification to the downloaded files will invalidate your submission. Ensure you have the latest versions before final upload.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}