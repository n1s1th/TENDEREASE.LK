"use client";

import { useDynamicTenderCreationStore } from "@/store/tender-creation/dynamic-creation.store";
import { TemplateSection, TemplateField } from "@/store/tender-template/template-designer.store";
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
import { FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicSectionStepProps {
  section: TemplateSection;
}

export function DynamicSectionStep({ section }: DynamicSectionStepProps) {
  const { dynamicData, updateDynamicData } = useDynamicTenderCreationStore();

  return (
    <Card>
      <CardHeader className="border-b border-border bg-grey-1/30">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>{section.title}</CardTitle>
            {section.description && (
              <p className="text-sm text-grey-5 mt-1">{section.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {section.fields.map((field) => (
            <FieldRenderer 
              key={field.id} 
              field={field} 
              value={dynamicData[field.id]}
              onChange={(val) => updateDynamicData(field.id, val)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldRenderer({ field, value, onChange }: { field: TemplateField, value: any, onChange: (val: any) => void }) {
  const isFullWidth = ['PARAGRAPH', 'FILE_UPLOAD', 'DOCUMENT_UPLOAD', 'CHECKBOXES'].includes(field.type);
  
  return (
    <div className={cn("space-y-2", isFullWidth && "md:col-span-2")}>
      <Label className="flex items-center gap-1 font-semibold">
        {field.title}
        {field.required && <span className="text-error">*</span>}
      </Label>
      
      {renderInputControl(field, value, onChange)}
      
      {field.helperText && (
        <p className="text-xs text-grey-5 mt-1">{field.helperText}</p>
      )}
    </div>
  );
}

function renderInputControl(field: TemplateField, value: any, onChange: (val: any) => void) {
  switch (field.type) {
    case 'SHORT_ANSWER':
      return <Input placeholder="Enter value" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'PARAGRAPH':
      return <Textarea placeholder="Enter detailed description" className="min-h-[100px]" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'DROPDOWN':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="w-full">
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
      return <Input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'TIME':
      return <Input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'NUMBER':
      return <Input type="number" placeholder="0" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'CURRENCY':
      return <Input type="number" placeholder="0.00" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      
    case 'CHECKBOXES':
      const currentValues = Array.isArray(value) ? value : [];
      const handleToggle = (optValue: string) => {
        if (currentValues.includes(optValue)) {
          onChange(currentValues.filter(v => v !== optValue));
        } else {
          onChange([...currentValues, optValue]);
        }
      };

      return (
        <div className="space-y-3 mt-3 p-4 rounded-md border border-border bg-grey-1/30">
          {(field.options || []).map(opt => {
            const optVal = opt.value || opt.label;
            return (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-grey-3 text-primary focus:ring-primary" 
                  checked={currentValues.includes(optVal)}
                  onChange={() => handleToggle(optVal)}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
      
    case 'FILE_UPLOAD':
    case 'DOCUMENT_UPLOAD':
      return (
        <div className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors bg-white mt-2">
          <Upload className="mx-auto h-8 w-8 text-grey-4 mb-3" />
          <p className="text-sm font-medium">
            Drag & drop files here or <span className="text-primary font-semibold">click to browse</span>
          </p>
          <p className="text-xs text-grey-5 mt-2">(File upload mock logic for dynamic fields)</p>
        </div>
      );
      
    default:
      return <Input disabled placeholder="Unsupported field type" />;
  }
}
