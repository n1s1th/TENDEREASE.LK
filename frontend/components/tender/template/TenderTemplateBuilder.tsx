"use client";

import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTemplateDesignerStore, FieldType } from "@/store/tender-template/template-designer.store";
import { DesignerSidebarLeft } from "./DesignerSidebarLeft";
import { DesignerCanvas } from "./DesignerCanvas";
import { DesignerSidebarRight } from "./DesignerSidebarRight";
import { TemplatePreview } from "./TemplatePreview";
import { Button } from "@/components/ui/button";
import { Save, Send, Eye, Edit2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { templateService } from "@/services/template.service";
import { toast, Toaster } from "sonner";

const makeSnapshot = (name: string, description: string, sections: any) =>
  JSON.stringify({ name, description, sections });

export function TenderTemplateBuilder() {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const router = useRouter();

  const state = useTemplateDesignerStore();
  const { moveField, status, version, id, name, description, sections } = state;

  const showPreview = isPreviewMode;

  const currentSnapshot = makeSnapshot(name, description, sections);
  const hasChanges = savedSnapshot === null || currentSnapshot !== savedSnapshot;

  const handleSave = async () => {
    try {
      setIsSavingDraft(true);
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

      setSavedSnapshot(makeSnapshot(name, description, sections));
      toast.success("Template saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
      console.error(error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      toast.error("Please save the draft first before publishing.");
      return;
    }

    try {
      setIsPublishing(true);
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
      setIsPublishing(false);
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

    // Handle drag from Sidebar Palette to Canvas
    if (source.droppableId.startsWith("palette-") && destination.droppableId.startsWith("section-")) {
      const destSectionId = destination.droppableId.replace("section-", "");
      // draggableId is defined as `palette-${field.type}` in DesignerSidebarLeft
      const type = result.draggableId.replace("palette-", "") as FieldType;
      
      state.addField(destSectionId, type, destination.index);
      return;
    }

    // Handle dragging fields within sections or across sections
    if (source.droppableId.startsWith("section-") && destination.droppableId.startsWith("section-")) {
      const sourceSectionId = source.droppableId.replace("section-", "");
      const destSectionId = destination.droppableId.replace("section-", "");
      
      moveField(sourceSectionId, destSectionId, source.index, destination.index);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toaster position="top-right" richColors />
      {/* Top Header */}
      <div className="bg-white border-b border-grey-2 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/tender-templates")}
            className="flex items-center justify-center w-8 h-8 rounded-md text-grey-5 hover:text-foreground hover:bg-grey-1 transition-colors"
            title="Back to Templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tender Template Designer</h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${
              status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
              status === 'ARCHIVED'  ? 'bg-grey-2 text-grey-6 border-grey-3' :
              'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {status}
            </span>
            <span className="text-sm text-grey-5 font-medium">Version {version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {status !== 'PUBLISHED' && (
            <Button 
              variant="outline" 
              className="border-primary/20 text-primary hover:bg-primary/5 mr-2" 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Edit2 className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? "Back to Builder" : "Preview Template"}
            </Button>
          )}

          <Button
            variant="outline"
            className="border-grey-3 text-grey-5 hover:bg-grey-1"
            onClick={handleSave}
            disabled={isSavingDraft || isPublishing || status === 'PUBLISHED' || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" /> {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            className="bg-primary hover:bg-[#782500] text-white shadow-md disabled:opacity-50"
            onClick={handlePublish}
            disabled={isSavingDraft || isPublishing || status === 'PUBLISHED' || hasChanges}
          >
            <Send className="w-4 h-4 mr-2" /> {isPublishing ? "Publishing..." : "Publish Template"}
          </Button>
        </div>
      </div>

      {/* Builder Workspace */}
      <div className="flex-1 overflow-hidden flex bg-grey-1 relative">
        {showPreview ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <TemplatePreview />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <DesignerSidebarLeft />
            
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <div className="max-w-4xl mx-auto py-10 px-4 pb-32">
                <DesignerCanvas />
              </div>
            </div>
            
            <DesignerSidebarRight />
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
