"use client";

import { useState } from "react";
import { useTemplateDesignerStore, TemplateField } from "@/store/tender-template/template-designer.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TemplatePreview() {
  const { sections, name } = useTemplateDesignerStore();
  const [activeStep, setActiveStep] = useState(0);

  if (!sections || sections.length === 0) {
    return <div className="p-10 text-center text-grey-5">No sections defined yet.</div>;
  }

  const activeSection = sections[activeStep];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-bold text-foreground">{name}</h2>
        <p className="text-grey-5 text-sm">Template Preview Mode</p>
      </div>

      {/* Stepper Header */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-[2px] bg-grey-2/50 -z-10" />
        <div className="flex justify-between relative z-0">
          {sections.map((section, idx) => {
            const isActive = idx === activeStep;
            const isPast = idx < activeStep;
            
            return (
              <div 
                key={section.id} 
                className={cn(
                  "flex flex-col items-center gap-3 cursor-pointer group w-32",
                  isActive ? "opacity-100" : isPast ? "opacity-80 hover:opacity-100" : "opacity-50 hover:opacity-100"
                )}
                onClick={() => setActiveStep(idx)}
              >
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white transition-all",
                    isActive 
                      ? "border-primary text-primary font-bold shadow-sm" 
                      : isPast
                        ? "border-primary/50 text-primary bg-primary/5"
                        : "border-grey-3 text-grey-4 group-hover:border-grey-4"
                  )}
                >
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : (idx + 1)}
                </div>
                <span className={cn(
                  "text-xs font-semibold text-center leading-tight transition-colors",
                  isActive ? "text-primary" : "text-grey-5"
                )}>
                  {section.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Section Card */}
      <Card className="border border-grey-2 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-grey-2 bg-grey-1/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{activeSection.title}</CardTitle>
              {activeSection.description && (
                <p className="text-sm text-grey-5 mt-1">{activeSection.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {activeSection.fields.map((field) => (
              <PreviewFieldRenderer key={field.id} field={field} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setActiveStep(s => Math.max(0, s - 1))}
          disabled={activeStep === 0}
          className="px-6 py-2.5 text-sm font-semibold text-grey-6 border border-grey-3 rounded-lg hover:bg-grey-1 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setActiveStep(s => Math.min(sections.length - 1, s + 1))}
          disabled={activeStep === sections.length - 1}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 shadow-sm transition-colors"
        >
          Next
        </button>
      </div>

    </div>
  );
}

function PreviewFieldRenderer({ field }: { field: TemplateField }) {
  // Determine if field should span full width
  const isFullWidth = ['PARAGRAPH', 'FILE_UPLOAD', 'DOCUMENT_UPLOAD', 'CHECKBOXES'].includes(field.type);
  
  return (
    <div className={cn("space-y-2", isFullWidth && "md:col-span-2")}>
      <Label className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {field.title}
        {field.required && <span className="text-error">*</span>}
      </Label>
      
      {renderInputControl(field)}
      
      {field.helperText && (
        <p className="text-xs text-grey-5 mt-1">{field.helperText}</p>
      )}
    </div>
  );
}

function renderInputControl(field: TemplateField) {
  switch (field.type) {
    case 'SHORT_ANSWER':
      return <Input placeholder="Enter value" className="bg-white border-grey-3 focus-visible:ring-primary/20" />;
      
    case 'PARAGRAPH':
      return <Textarea placeholder="Enter detailed description" className="min-h-[100px] bg-white border-grey-3 focus-visible:ring-primary/20" />;
      
    case 'DROPDOWN':
      return (
        <Select>
          <SelectTrigger className="w-full bg-white border-grey-3">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map(opt => (
              <SelectItem key={opt.id} value={opt.value || opt.label}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'DATE':
      return <Input type="date" className="bg-white border-grey-3" />;
      
    case 'TIME':
      return <Input type="time" className="bg-white border-grey-3" />;
      
    case 'NUMBER':
      return <Input type="number" placeholder="0" className="bg-white border-grey-3" />;
      
    case 'CURRENCY':
      return <Input type="text" placeholder="LKR 0.00" className="bg-white border-grey-3" />;
      
    case 'CHECKBOXES':
      return (
        <div className="space-y-3 mt-3 p-4 rounded-md border border-grey-2 bg-grey-1/30">
          {(field.options || []).map(opt => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-grey-3 text-primary focus:ring-primary" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      );
      
    case 'FILE_UPLOAD':
    case 'DOCUMENT_UPLOAD':
      return (
        <div className="border-2 border-dashed border-grey-3 rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-colors bg-white mt-2">
          <Upload className="mx-auto h-8 w-8 text-grey-4 mb-3" />
          <p className="text-sm font-medium text-foreground">
            Drag & drop files here or <span className="text-primary font-semibold">click to browse</span>
          </p>
        </div>
      );
      
    default:
      return <Input disabled placeholder="Unsupported field type" />;
  }
}
