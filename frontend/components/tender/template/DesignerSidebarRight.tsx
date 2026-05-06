import { useTemplateDesignerStore } from "@/store/tender-template/template-designer.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export function DesignerSidebarRight() {
  const { 
    sections, 
    selectedFieldId, 
    updateField, 
    addOptionToField, 
    updateFieldOption, 
    removeFieldOption 
  } = useTemplateDesignerStore();

  if (!selectedFieldId) {
    return (
      <aside className="w-80 bg-white border-l border-grey-2 shadow-sm flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-grey-2">
          <h2 className="text-sm font-bold text-foreground">Field Properties</h2>
        </div>
        <div className="p-8 text-center text-grey-4 flex-1 flex flex-col items-center justify-center">
          <p className="text-sm">Select a field on the canvas to configure its properties here.</p>
        </div>
      </aside>
    );
  }

  // Find the selected field
  let activeField = null;
  for (const section of sections) {
    const field = section.fields.find(f => f.id === selectedFieldId);
    if (field) {
      activeField = field;
      break;
    }
  }

  if (!activeField) return null;

  const hasOptions = activeField.type === 'DROPDOWN' || activeField.type === 'CHECKBOXES';

  return (
    <aside className="w-80 bg-white border-l border-grey-2 shadow-sm flex flex-col h-full shrink-0 overflow-y-auto no-scrollbar">
      <div className="p-5 border-b border-grey-2 shrink-0">
        <h2 className="text-sm font-bold text-foreground">Field Properties</h2>
      </div>

      <div className="p-5 space-y-6">
        {/* Question Title */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-grey-4 uppercase tracking-wider">Question Title</Label>
          <Input 
            value={activeField.title} 
            onChange={(e) => updateField(activeField!.id, { title: e.target.value })}
            placeholder="e.g., Company Name"
            className="border-grey-2 focus-visible:ring-primary shadow-none"
          />
        </div>

        {/* Helper Text */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-grey-4 uppercase tracking-wider">Helper Text</Label>
          <Textarea 
            value={activeField.helperText || ''} 
            onChange={(e) => updateField(activeField!.id, { helperText: e.target.value })}
            placeholder="Provide hints..."
            className="border-grey-2 focus-visible:ring-primary shadow-none text-sm min-h-[80px]"
          />
        </div>

        {/* Field Type Display (Read Only) */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-grey-4 uppercase tracking-wider">Field Type</Label>
          <div className="w-full px-3 py-2 bg-grey-1 rounded-md text-sm text-grey-5 border border-grey-2 cursor-not-allowed">
            {activeField.type.replace('_', ' ')}
          </div>
        </div>

        <hr className="border-grey-2" />

        {/* Options Builder (Dropdowns / Checkboxes) */}
        {hasOptions && (
          <div className="space-y-3">
            <Label className="text-xs font-bold text-grey-4 uppercase tracking-wider">Options</Label>
            <div className="space-y-2">
              {(activeField.options || []).map((option, idx) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input 
                    value={option.label}
                    onChange={(e) => updateFieldOption(activeField!.id, option.id, e.target.value)}
                    className="h-8 border-grey-2 shadow-none focus-visible:ring-primary text-sm"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-grey-4 hover:text-error hover:bg-error/10 shrink-0"
                    onClick={() => removeFieldOption(activeField!.id, option.id)}
                    disabled={(activeField.options?.length || 0) <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-dashed border-grey-3 text-grey-5 hover:text-primary hover:border-primary/50"
              onClick={() => addOptionToField(activeField!.id)}
            >
              <Plus className="h-3 w-3 mr-2" /> Add Option
            </Button>
            <hr className="border-grey-2 my-6" />
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground cursor-pointer">Required field</Label>
            <Switch 
              checked={activeField.required} 
              onCheckedChange={(checked) => updateField(activeField!.id, { required: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground cursor-pointer">Show in tender notice</Label>
            <Switch 
              checked={activeField.showInNotice} 
              onCheckedChange={(checked) => updateField(activeField!.id, { showInNotice: checked })}
            />
          </div>
        </div>

        {/* Validation */}
        {!hasOptions && activeField.type !== 'FILE_UPLOAD' && activeField.type !== 'DOCUMENT_UPLOAD' && (
          <>
            <hr className="border-grey-2" />
            <div className="space-y-2">
              <Label className="text-xs font-bold text-grey-4 uppercase tracking-wider">Validation</Label>
              <div className="w-full px-3 py-2 bg-grey-1 rounded-md text-sm text-grey-4 border border-grey-2">
                No validation
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
