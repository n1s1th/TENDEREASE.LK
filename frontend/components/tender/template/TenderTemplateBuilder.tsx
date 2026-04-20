"use client";

import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTemplateDesignerStore } from "@/store/tender-template/template-designer.store";
import { DesignerSidebarLeft } from "./DesignerSidebarLeft";
import { DesignerCanvas } from "./DesignerCanvas";
import { DesignerSidebarRight } from "./DesignerSidebarRight";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

import { templateService } from "@/services/template.service";
import { toast, Toaster } from "sonner";

export function TenderTemplateBuilder() {
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const state = useTemplateDesignerStore();
  const { moveField, status, version, id, name, description, sections } = state;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name,
        description,
        schema: { sections }
      };

      let result;
      if (id) {
        result = await templateService.updateTemplate(id, payload);
      } else {
        result = await templateService.createTemplate(payload);
        useTemplateDesignerStore.setState({ id: result.id, templateCode: result.templateCode });
      }
      
      useTemplateDesignerStore.setState({ 
        version: result.version, 
        status: result.status 
      });
      
      toast.success("Template saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      toast.error("Please save the draft first before publishing.");
      return;
    }
    
    try {
      setIsSaving(true);
      const result = await templateService.publishTemplate(id);
      useTemplateDesignerStore.setState({ 
        status: result.status,
        version: result.version
      });
      toast.success("Template published securely. This version is now immutable.");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish template");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Currently only supporting dragging fields within sections or across sections
    if (source.droppableId.startsWith("section-") && destination.droppableId.startsWith("section-")) {
      const sourceSectionId = source.droppableId.replace("section-", "");
      const destSectionId = destination.droppableId.replace("section-", "");
      
      moveField(sourceSectionId, destSectionId, source.index, destination.index);
    }
  };

  if (!isClient) return null; // Hydration fix for drag-and-drop

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toaster position="top-right" richColors />
      {/* Top Header */}
      <div className="bg-white border-b border-grey-2 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tender Template Designer</h1>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md border border-amber-200">
              {status}
            </span>
            <span className="text-sm text-grey-5 font-medium">Version {version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-grey-3 text-grey-5 hover:bg-grey-1" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary-hover text-white shadow-md disabled:opacity-50"
            onClick={handlePublish}
            disabled={isSaving || status === 'PUBLISHED'}
          >
            <Send className="w-4 h-4 mr-2" /> Publish Template
          </Button>
        </div>
      </div>

      {/* Builder Workspace */}
      <div className="flex-1 overflow-hidden flex bg-grey-1 relative">
        <DragDropContext onDragEnd={onDragEnd}>
          <DesignerSidebarLeft />
          
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="max-w-4xl mx-auto py-10 px-4 pb-32">
              <DesignerCanvas />
            </div>
          </div>
          
          <DesignerSidebarRight />
        </DragDropContext>
      </div>
    </div>
  );
}
