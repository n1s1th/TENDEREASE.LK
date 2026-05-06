// ─── Tender Creation Types ──────────────────────────────────
// Types specific to the multi-step tender creation wizard.

export interface ReferenceDataItem {
  id: string | number;
  name: string;
  code?: string;
}

export interface TenderCreationFormData {
  // Step 0 — Tender Details
  title: string;
  referenceNumber: string;
  procurementType: string;
  biddingMethod: string;
  ministryId: string;
  departmentAgencyId: string;
  description: string;

  // Step 1 — Financial Information
  estimatedBudget: string;
  fundingSource: string;
  tenderType: string;

  // Step 2 — Bidding Documents
  sbdTemplate: string;
  templateVersion: string;
  // files held locally until tender is created
  pendingFiles: File[];

  // Step 3 — Notice & Compliance
  complianceChecklist: {
    procurementPlanApproved: boolean;
    budgetAvailabilityConfirmed: boolean;
    sbdComplyWithGuidelines: boolean;
    evaluationCriteriaDefined: boolean;
  };

  // Step 4 — Schedule
  advertisementStartDate: string;
  bidSubmissionDeadline: string;
  preBidMeetingEnabled: boolean;
  preBidMeetingDate: string;
}

export interface TenderCreationReferenceData {
  tenderTypes: ReferenceDataItem[];
  sbdTemplates: ReferenceDataItem[];
  procurementTypes: ReferenceDataItem[];
  ministries: ReferenceDataItem[];
  departments: ReferenceDataItem[];
  fundingSources: ReferenceDataItem[];
  biddingMethods: ReferenceDataItem[];
}

export const STEP_LABELS = [
  "Tender Details",
  "Financial Information",
  "Bidding Documents",
  "Tender Notice & Compliance",
  "Schedule",
] as const;

export type StepIndex = 0 | 1 | 2 | 3 | 4;

export interface TenderCreationState {
  currentStep: StepIndex;
  showPreview: boolean;
  formData: TenderCreationFormData;
  referenceData: TenderCreationReferenceData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  noticePreview: string | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: StepIndex) => void;
  updateFormData: (partial: Partial<TenderCreationFormData>) => void;
  updateComplianceItem: (key: keyof TenderCreationFormData["complianceChecklist"], value: boolean) => void;
  addPendingFile: (file: File) => void;
  removePendingFile: (index: number) => void;
  fetchReferenceData: () => Promise<void>;
  fetchDepartments: (ministryId: string) => Promise<void>;
  setShowPreview: (show: boolean) => void;
  submitTender: () => Promise<string | null>;
  reset: () => void;
}
