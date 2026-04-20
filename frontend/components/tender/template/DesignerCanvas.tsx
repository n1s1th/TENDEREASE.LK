import { useTemplateDesignerStore, FieldType, TemplateSection, TemplateField } from "@/store/tender-template/template-designer.store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Copy, Trash2, Edit2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function DesignerCanvas() {
  const { 
    name, description, sections, setName, setDescription, 
    addSection, updateSection, removeSection, 
    selectedFieldId, setSelectedField, removeField, duplicateField, addField 
  } = useTemplateDesignerStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Template Header block */}
      <div className="bg-white rounded-xl shadow-sm border-t-8 border-t-primary p-8">
        <Input 
          className="text-3xl font-bold border-transparent hover:border-grey-2 focus-visible:ring-0 focus-visible:border-primary px-0 h-12 shadow-none rounded-none"
          placeholder="Untitled Template"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          className="text-sm text-grey-5 border-transparent hover:border-grey-2 focus-visible:ring-0 focus-visible:border-primary px-0 mt-2 shadow-none rounded-none"
          placeholder="Template description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Sections Loop */}
      {sections.map((section, sectionIdx) => (
        <div key={section.id} className="bg-white rounded-xl shadow-sm border border-grey-2 overflow-hidden">
          
          {/* Section Header */}
          <div className="p-6 border-b border-grey-1 bg-grey-1/30 group relative">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <Input 
                  className="text-lg font-bold border-transparent hover:border-grey-2 focus-visible:ring-0 focus-visible:border-primary px-2 h-9 shadow-none bg-transparent"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                />
                <Input 
                  className="text-sm text-grey-5 border-transparent hover:border-grey-2 focus-visible:ring-0 focus-visible:border-primary px-2 h-8 shadow-none mt-1 bg-transparent"
                  placeholder="Section description (optional)"
                  value={section.description || ''}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-error hover:bg-error/10 h-8 w-8" onClick={() => removeSection(section.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Droppable Field List */}
          <Droppable droppableId={`section-${section.id}`} type="FIELD">
            {(provided, snapshot) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className={cn(
                  "p-6 space-y-4 min-h-[100px] transition-colors",
                  snapshot.isDraggingOver ? "bg-primary/5" : "bg-white"
                )}
              >
                {section.fields.map((field, index) => (
                  <FieldCard 
                    key={field.id} 
                    field={field} 
                    sectionId={section.id} 
                    index={index} 
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => setSelectedField(field.id, section.id)}
                    onDuplicate={() => duplicateField(field.id)}
                    onRemove={() => removeField(field.id)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Field to Section Footer */}
          <div className="p-4 border-t border-dashed border-grey-2 bg-white">
            <Button 
              variant="ghost" 
              className="w-full border border-dashed border-grey-3 text-grey-5 hover:text-primary hover:border-primary/50 hover:bg-primary/5"
              onClick={() => addField(section.id, 'SHORT_ANSWER')}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </div>
        </div>
      ))}

      {/* Add New Section */}
      <Button 
        variant="outline" 
        className="w-full bg-white h-12 border-dashed border-grey-3 text-grey-6 hover:text-foreground hover:border-grey-4"
        onClick={addSection}
      >
        <Plus className="h-4 w-4 mr-2" /> Add New Section
      </Button>

    </div>
  );
}

function FieldCard({ field, sectionId, index, isSelected, onSelect, onDuplicate, onRemove }: {
  field: TemplateField;
  sectionId: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onSelect}
          className={cn(
            "group relative rounded-lg border p-5 transition-all bg-white cursor-pointer",
            isSelected 
              ? "border-primary shadow-sm" 
              : "border-grey-2 hover:border-grey-3 hover:shadow-sm",
            snapshot.isDragging && "shadow-xl border-primary ring-1 ring-primary"
          )}
        >
          {/* Drag Handle */}
          <div 
            {...provided.dragHandleProps} 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-0.5 rounded-sm border border-grey-2 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-grey-4" />
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{field.title}</span>
                {field.required && <span className="text-error text-sm font-bold">*</span>}
              </div>
              {field.helperText && (
                <p className="text-xs text-grey-5 mt-1">{field.helperText}</p>
              )}
            </div>
            
            <div className="px-2.5 py-1 bg-grey-2/50 rounded text-[11px] font-semibold text-grey-5 uppercase tracking-wider shrink-0">
              {field.type.replace('_', ' ')}
            </div>
          </div>

          {/* Field Preview (Dummy) */}
          <div className="mb-4">
            <FieldPreview field={field} />
          </div>

          {/* Field Actions */}
          <div className={cn(
            "flex justify-end gap-1 pt-3 border-t border-grey-2 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-grey-5 hover:text-primary" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-grey-5 hover:text-primary" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-grey-5 hover:text-error" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function FieldPreview({ field }: { field: TemplateField }) {
  // Simple read-only static previews to show what it looks like
  switch (field.type) {
    case 'SHORT_ANSWER':
      return <Input disabled placeholder="Short answer text" className="border-grey-2 bg-grey-1 shadow-none" />;
    case 'PARAGRAPH':
      return <Textarea disabled placeholder="Long answer text" className="border-grey-2 bg-grey-1 shadow-none resize-none" />;
    case 'CHECKBOXES':
      return (
        <div className="space-y-2">
          {(field.options || [{id:'1', label:'Option 1'}]).map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-not-allowed opacity-70">
              <input type="checkbox" disabled className="rounded border-grey-3" />
              <span className="text-sm text-grey-6">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case 'DROPDOWN':
      return (
        <div className="h-10 w-full rounded-md border border-grey-2 bg-grey-1 flex items-center px-3 opacity-70 cursor-not-allowed">
          <span className="text-sm text-grey-5">Select an option</span>
        </div>
      );
    case 'FILE_UPLOAD':
    case 'DOCUMENT_UPLOAD':
      return (
        <div className="border border-dashed border-grey-3 rounded-lg p-4 text-center bg-grey-1/50 opacity-70 cursor-not-allowed">
          <span className="text-sm text-grey-5">Click to upload or drag and drop</span>
        </div>
      );
    case 'CURRENCY':
      return <Input disabled placeholder="LKR 0.00" className="border-grey-2 bg-grey-1 shadow-none" />;
    default:
      return <Input disabled placeholder="..." className="border-grey-2 bg-grey-1 shadow-none" />;
  }
}
