import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type FieldType = 'SHORT_ANSWER' | 'PARAGRAPH' | 'CHECKBOXES' | 'DROPDOWN' | 'DATE' | 'TIME' | 'FILE_UPLOAD' | 'NUMBER' | 'DOCUMENT_UPLOAD' | 'CURRENCY';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface TemplateField {
  id: string;
  type: FieldType;
  title: string;
  helperText?: string;
  required: boolean;
  showInNotice: boolean;
  options?: FieldOption[];
  validation?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
}

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TemplateDesignerState {
  id: string | null;
  templateCode: string | null;
  name: string;
  description: string;
  version: number;
  status: TemplateStatus;
  sections: TemplateSection[];
  selectedFieldId: string | null;
  selectedSectionId: string | null;

  // Actions
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  
  addSection: () => void;
  updateSection: (id: string, updates: Partial<TemplateSection>) => void;
  removeSection: (id: string) => void;
  
  addField: (sectionId: string, type: FieldType, index?: number) => void;
  updateField: (id: string, updates: Partial<TemplateField>) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  
  setSelectedField: (fieldId: string | null, sectionId: string | null) => void;
  moveField: (sourceSectionId: string, destinationSectionId: string, sourceIndex: number, destinationIndex: number) => void;
  
  addOptionToField: (fieldId: string) => void;
  updateFieldOption: (fieldId: string, optionId: string, value: string) => void;
  removeFieldOption: (fieldId: string, optionId: string) => void;
}

const getDefaultFieldProps = (type: FieldType): Partial<TemplateField> => {
  const base = {
    title: 'New Field',
    helperText: '',
    required: false,
    showInNotice: false,
  };
  
  if (type === 'DROPDOWN' || type === 'CHECKBOXES') {
    return { ...base, options: [{ id: uuidv4(), label: 'Option 1', value: 'Option 1' }] };
  }
  
  return base;
};

export const getDefaultSections = (): TemplateSection[] => [
  {
    id: uuidv4(),
    title: 'Tender Details',
    description: 'Basic identifying information about the procurement.',
    fields: [
      { id: uuidv4(), type: 'SHORT_ANSWER', title: 'Tender Title', helperText: 'Enter the official name of the tender', required: true, showInNotice: true },
      { id: uuidv4(), type: 'SHORT_ANSWER', title: 'Reference Number', helperText: 'Internal reference code', required: true, showInNotice: true },
      { id: uuidv4(), type: 'DROPDOWN', title: 'Procurement Type', required: true, showInNotice: true, options: [
        { id: uuidv4(), label: 'Goods', value: 'GOODS' },
        { id: uuidv4(), label: 'Works', value: 'WORKS' },
        { id: uuidv4(), label: 'Services', value: 'SERVICES' },
        { id: uuidv4(), label: 'Consulting', value: 'CONSULTING' }
      ]},
      { id: uuidv4(), type: 'PARAGRAPH', title: 'Tender Description', helperText: 'Detailed scope of work', required: true, showInNotice: false }
    ]
  },
  {
    id: uuidv4(),
    title: 'Financial Information',
    description: 'Budget allocations and funding details.',
    fields: [
      { id: uuidv4(), type: 'CURRENCY', title: 'Estimated Budget', required: true, showInNotice: false },
      { id: uuidv4(), type: 'SHORT_ANSWER', title: 'Funding Source', required: false, showInNotice: false }
    ]
  },
  {
    id: uuidv4(),
    title: 'Bidding Documents',
    description: 'SBD template selection and supporting file uploads.',
    fields: [
      { id: uuidv4(), type: 'DROPDOWN', title: 'Standard Bidding Document (SBD)', required: true, showInNotice: false, options: [
        { id: uuidv4(), label: 'Standard Template V1', value: 'SBD-V1' },
        { id: uuidv4(), label: 'Standard Template V2', value: 'SBD-V2' }
      ]},
      { id: uuidv4(), type: 'DOCUMENT_UPLOAD', title: 'Upload Supporting Documents', helperText: 'Accepted: PDF, DOC, DOCX, XLS, XLSX (Max 10MB per file)', required: true, showInNotice: false }
    ]
  },
  {
    id: uuidv4(),
    title: 'Notice & Compliance',
    description: 'Statutory compliance checklists and notice approvals.',
    fields: [
      { id: uuidv4(), type: 'CHECKBOXES', title: 'Compliance Checklist', required: true, showInNotice: false, options: [
        { id: uuidv4(), label: 'Procurement plan approved', value: 'procurementPlanApproved' },
        { id: uuidv4(), label: 'Budget availability confirmed', value: 'budgetAvailabilityConfirmed' },
        { id: uuidv4(), label: 'SBDs comply with guidelines', value: 'sbdComplyWithGuidelines' },
        { id: uuidv4(), label: 'Evaluation criteria defined', value: 'evaluationCriteriaDefined' }
      ]}
    ]
  },
  {
    id: uuidv4(),
    title: 'Schedule & Deadlines',
    description: 'Critical dates for this tender lifecycle.',
    fields: [
      { id: uuidv4(), type: 'DATE', title: 'Advertisement Start Date', required: true, showInNotice: true },
      { id: uuidv4(), type: 'DATE', title: 'Bid Submission Deadline', required: true, showInNotice: true },
      { id: uuidv4(), type: 'DATE', title: 'Pre-bid Meeting Date', required: false, showInNotice: true }
    ]
  }
];

export const useTemplateDesignerStore = create<TemplateDesignerState>()(
  persist(
    (set, get) => ({
  id: null,
  templateCode: null,
  name: 'Standard Procurement Template',
  description: 'Default template containing details, financials, and schedules.',
  version: 1,
  status: 'DRAFT',
  sections: getDefaultSections(),
  selectedFieldId: null,
  selectedSectionId: null,

  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),

  addSection: () => set((state) => ({
    sections: [
      ...state.sections,
      { id: uuidv4(), title: 'New Section', description: '', fields: [] }
    ]
  })),

  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter(s => s.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
    selectedFieldId: state.selectedSectionId === id ? null : state.selectedFieldId
  })),

  addField: (sectionId, type, index) => set((state) => {
    const newField: TemplateField = {
      id: uuidv4(),
      type,
      ...getDefaultFieldProps(type)
    } as TemplateField;

    return {
      sections: state.sections.map(s => {
        if (s.id !== sectionId) return s;
        const newFields = [...s.fields];
        if (index !== undefined) {
          newFields.splice(index, 0, newField);
        } else {
          newFields.push(newField);
        }
        return { ...s, fields: newFields };
      }),
      selectedFieldId: newField.id,
      selectedSectionId: sectionId
    };
  }),

  updateField: (id, updates) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      fields: s.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  })),

  removeField: (id) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      fields: s.fields.filter(f => f.id !== id)
    })),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId
  })),

  duplicateField: (id) => set((state) => {
    let newFieldId = null;
    let newSectionId = null;
    const newSections = state.sections.map(s => {
      const fieldIndex = s.fields.findIndex(f => f.id === id);
      if (fieldIndex === -1) return s;
      
      const fieldToClone = s.fields[fieldIndex];
      const clonedField = { ...fieldToClone, id: uuidv4(), title: fieldToClone.title + ' (Copy)' };
      newFieldId = clonedField.id;
      newSectionId = s.id;
      
      const newFields = [...s.fields];
      newFields.splice(fieldIndex + 1, 0, clonedField);
      return { ...s, fields: newFields };
    });
    
    return { 
      sections: newSections,
      selectedFieldId: newFieldId || state.selectedFieldId,
      selectedSectionId: newSectionId || state.selectedSectionId
    };
  }),

  setSelectedField: (fieldId, sectionId) => set({ 
    selectedFieldId: fieldId, 
    selectedSectionId: sectionId 
  }),

  moveField: (sourceSectionId, destSectionId, sourceIndex, destIndex) => set((state) => {
    // Deep clone the sections and their fields to maintain immutability
    const newSections = state.sections.map(s => ({
      ...s,
      fields: [...s.fields]
    }));
    
    const sourceSection = newSections.find(s => s.id === sourceSectionId);
    const destSection = newSections.find(s => s.id === destSectionId);
    
    if (!sourceSection || !destSection) return state;
    
    const [movedField] = sourceSection.fields.splice(sourceIndex, 1);
    destSection.fields.splice(destIndex, 0, movedField);
    
    return { sections: newSections };
  }),

  addOptionToField: (fieldId) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      fields: s.fields.map(f => {
        if (f.id !== fieldId) return f;
        const options = f.options || [];
        const newOpt = { id: uuidv4(), label: `Option ${options.length + 1}`, value: `Option ${options.length + 1}` };
        return { ...f, options: [...options, newOpt] };
      })
    }))
  })),

  updateFieldOption: (fieldId, optionId, value) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      fields: s.fields.map(f => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          options: (f.options || []).map(o => o.id === optionId ? { ...o, label: value, value } : o)
        };
      })
    }))
  })),

  removeFieldOption: (fieldId, optionId) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      fields: s.fields.map(f => {
        if (f.id !== fieldId) return f;
        return { ...f, options: (f.options || []).filter(o => o.id !== optionId) };
      })
    }))
  })),
    }),
    {
      name: 'template-designer',
      // Only persist data fields — skip UI selection state
      partialize: (state) => ({
        id: state.id,
        templateCode: state.templateCode,
        name: state.name,
        description: state.description,
        version: state.version,
        status: state.status,
        sections: state.sections,
      }),
    }
  )
);

