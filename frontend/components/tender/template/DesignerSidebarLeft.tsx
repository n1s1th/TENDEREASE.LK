"use client";

import { useTemplateDesignerStore, FieldType } from "@/store/tender-template/template-designer.store";
import { 
  AlignLeft, AlignJustify, CheckSquare, ChevronDownSquare, 
  Calendar, Clock, UploadCloud, Hash, FileText, DollarSign, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "@hello-pangea/dnd";

const FIELD_GROUPS = [
  {
    title: "BASIC FIELDS",
    fields: [
      { type: "SHORT_ANSWER" as FieldType, label: "Short Answer", icon: AlignLeft },
      { type: "PARAGRAPH" as FieldType, label: "Paragraph", icon: AlignJustify },
      { type: "CHECKBOXES" as FieldType, label: "Checkboxes", icon: CheckSquare },
      { type: "DROPDOWN" as FieldType, label: "Dropdown", icon: ChevronDownSquare },
    ]
  },
  {
    title: "ADVANCED FIELDS",
    fields: [
      { type: "DATE" as FieldType, label: "Date", icon: Calendar },
      { type: "TIME" as FieldType, label: "Time", icon: Clock },
      { type: "FILE_UPLOAD" as FieldType, label: "File Upload", icon: UploadCloud },
      { type: "NUMBER" as FieldType, label: "Number", icon: Hash },
    ]
  },
  {
    title: "TENDER SPECIFIC",
    fields: [
      { type: "DOCUMENT_UPLOAD" as FieldType, label: "Document Upload", icon: FileText },
      { type: "CURRENCY" as FieldType, label: "Currency", icon: DollarSign },
    ]
  }
];

export function DesignerSidebarLeft() {
  const { addField, sections, selectedSectionId } = useTemplateDesignerStore();

  const handleAddField = (type: FieldType) => {
    // Add to selected section, or last section if none selected
    let targetSectionId = selectedSectionId;
    if (!targetSectionId) {
      if (sections.length > 0) {
        targetSectionId = sections[sections.length - 1].id;
      } else {
        return; // No sections exist
      }
    }
    addField(targetSectionId, type);
  };

  return (
    <aside className="w-64 bg-white border-r border-grey-2 shadow-sm flex flex-col h-full shrink-0 overflow-y-auto no-scrollbar">
      <div className="p-5 space-y-8">
        {FIELD_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="text-[10px] font-bold text-grey-4 uppercase tracking-[0.15em] mb-3">
              {group.title}
            </h3>
            <Droppable 
              droppableId={`palette-${group.title}`} 
              type="FIELD" 
              isDropDisabled={true}
              renderClone={(provided, snapshot, rubric) => {
                const field = group.fields[rubric.source.index];
                const Icon = field.icon;
                return (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors cursor-grabbing text-primary border-primary/50 shadow-lg bg-white ring-2 ring-primary/20 select-none"
                  >
                    <Icon className="w-4 h-4 mr-3 shrink-0" />
                    {field.label}
                  </div>
                );
              }}
            >
              {(provided, snapshot) => (
                <div 
                  className="space-y-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {group.fields.map((field, index) => {
                    const Icon = field.icon;
                    return (
                      <Draggable key={field.type} draggableId={`palette-${field.type}`} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => handleAddField(field.type)}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors cursor-grab active:cursor-grabbing select-none ${
                              dragSnapshot.isDragging 
                                ? "text-primary border-primary/50 shadow-md bg-white ring-2 ring-primary/20" 
                                : "text-grey-5 border-grey-2 hover:border-primary/30 hover:bg-primary/5 hover:text-primary bg-white"
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-3 shrink-0" />
                            {field.label}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </aside>
  );
}
