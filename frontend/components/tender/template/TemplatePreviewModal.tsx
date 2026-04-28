"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TemplatePreview } from "./TemplatePreview";
import { useTemplateDesignerStore } from "@/store/tender-template/template-designer.store";

interface TemplatePreviewModalProps {
  template: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  useEffect(() => {
    if (isOpen && template) {
      // Load the selected template's schema into the global store for preview rendering
      useTemplateDesignerStore.setState({
        id: template.id,
        templateCode: template.templateCode,
        name: template.name,
        description: template.description || '',
        version: template.version,
        status: template.status,
        sections: template.schema?.sections || [],
        selectedFieldId: null,
        selectedSectionId: null
      });
    }
  }, [isOpen, template]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-grey-1">
        <DialogHeader className="px-6 py-4 border-b border-grey-2 bg-white shrink-0">
          <DialogTitle>Template Preview</DialogTitle>
          <DialogDescription>
            This is how the tender creation form will appear to procurement officers using this template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <TemplatePreview />
        </div>
      </DialogContent>
    </Dialog>
  );
}
