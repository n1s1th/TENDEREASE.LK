"use client";

import { useRef } from "react";
import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Upload, X, FileText, FolderOpen } from "lucide-react";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1">{message}</p>;
}

export function BiddingDocumentsStep() {
  const { formData, referenceData, formErrors, updateFormData, addPendingFile, removePendingFile } =
    useTenderCreationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => addPendingFile(file));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => addPendingFile(file));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>Bidding Documents</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* SBD Template + Version */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
          <div className="space-y-1.5">
            <Label>Standard Bidding Document (SBD) <span className="text-error">*</span></Label>
            <Select
              value={formData.sbdTemplate}
              onValueChange={(v) => updateFormData({ sbdTemplate: v })}
            >
              <SelectTrigger className={`w-full ${formErrors.sbdTemplate ? "border-error" : ""}`}>
                <SelectValue placeholder="Select SBD" />
              </SelectTrigger>
              <SelectContent>
                {referenceData.sbdTemplates.map((item) => (
                  <SelectItem key={item.id} value={String(item.code ?? item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={formErrors.sbdTemplate} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tc-template-ver">Template Version</Label>
            <Input
              id="tc-template-ver"
              placeholder="Auto-populated"
              value={formData.templateVersion}
              onChange={(e) => updateFormData({ templateVersion: e.target.value })}
              readOnly
              className="bg-grey-1"
            />
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-1.5">
          <Label>Upload Documents</Label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-grey-3 rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-grey-4 mb-3" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop files here or{" "}
              <span className="text-primary font-semibold">click to browse</span>
            </p>
            <p className="text-xs text-grey-5 mt-1.5">
              Accepted: PDF, DOC, DOCX, XLS, XLSX (Max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>
        </div>

        {/* Pending Files List */}
        {formData.pendingFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-grey-5 uppercase tracking-wider">
              Queued Files ({formData.pendingFiles.length})
            </Label>
            <ul className="space-y-1.5">
              {formData.pendingFiles.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 bg-grey-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-grey-4 shrink-0">
                      {formatSize(file.size)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removePendingFile(idx)}
                    className="text-grey-4 hover:text-error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
