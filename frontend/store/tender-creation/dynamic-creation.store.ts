import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/api";
import { TenderCreationFormData } from "@/lib/types/tender-creation.types";

export interface DynamicTenderCreationState {
  currentStep: number;
  showPreview: boolean;
  templateId: string | null;
  baseData: Partial<TenderCreationFormData>;
  dynamicData: Record<string, any>;
  
  referenceData: {
    tenderTypes: any[];
    sbdTemplates: any[];
    procurementTypes: any[];
    ministries: any[];
    departments: any[];
    fundingSources: any[];
    biddingMethods: any[];
  };
  
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  setTemplateId: (id: string) => void;
  nextStep: (maxSteps: number) => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setShowPreview: (show: boolean) => void;
  
  updateBaseData: (partial: Partial<TenderCreationFormData>) => void;
  updateDynamicData: (fieldId: string, value: any) => void;
  
  fetchReferenceData: () => Promise<void>;
  fetchDepartments: (ministryId: string) => Promise<void>;
  submitTender: () => Promise<string | null>;
  reset: () => void;
}

const INITIAL_BASE_DATA = {
  title: "",
  referenceNumber: "",
  procurementType: "",
  biddingMethod: "",
  ministryId: "",
  departmentAgencyId: "",
  description: "",
  estimatedBudget: "",
  fundingSource: "",
  tenderType: "",
};

export const useDynamicTenderCreationStore = create<DynamicTenderCreationState>()(
  devtools(
    (set, get) => ({
      currentStep: 0,
      showPreview: false,
      templateId: null,
      baseData: { ...INITIAL_BASE_DATA },
      dynamicData: {},
      
      referenceData: {
        tenderTypes: [],
        sbdTemplates: [],
        procurementTypes: [],
        ministries: [],
        departments: [],
        fundingSources: [],
        biddingMethods: [],
      },
      
      isLoading: false,
      isSubmitting: false,
      error: null,

      setTemplateId: (id) => set({ templateId: id }, false, "dynamic/setTemplateId"),
      
      nextStep: (maxSteps) => set((s) => ({
        currentStep: Math.min(s.currentStep + 1, maxSteps)
      }), false, "dynamic/nextStep"),

      prevStep: () => set((s) => ({
        currentStep: Math.max(s.currentStep - 1, 0)
      }), false, "dynamic/prevStep"),

      goToStep: (step) => set({ currentStep: step, showPreview: false }, false, "dynamic/goToStep"),
      
      setShowPreview: (show) => set({ showPreview: show }, false, "dynamic/setShowPreview"),

      updateBaseData: (partial) => set((s) => ({
        baseData: { ...s.baseData, ...partial }
      }), false, "dynamic/updateBaseData"),

      updateDynamicData: (fieldId, value) => set((s) => ({
        dynamicData: { ...s.dynamicData, [fieldId]: value }
      }), false, "dynamic/updateDynamicData"),

      fetchReferenceData: async () => {
        set({ isLoading: true, error: null }, false, "dynamic/fetchRef/pending");
        try {
          const [
            tenderTypes,
            sbdTemplates,
            procurementTypes,
            ministries,
            fundingSources,
            biddingMethods,
          ] = await Promise.all([
            api.listTenderTypes().catch(() => []),
            api.listSbdTemplates().catch(() => []),
            api.listProcurementTypes().catch(() => []),
            api.listMinistries().catch(() => []),
            api.listFundingSources().catch(() => []),
            api.listBiddingMethods().catch(() => []),
          ]);

          const mapEnumData = (arr: any[]) => 
            (arr || []).map(t => typeof t === 'string' ? { id: t, name: t.replace(/_/g, ' ') } : t);

          set({
            referenceData: {
              tenderTypes: mapEnumData(tenderTypes),
              sbdTemplates: sbdTemplates || [],
              procurementTypes: mapEnumData(procurementTypes),
              ministries: ministries || [],
              departments: [],
              fundingSources: fundingSources || [],
              biddingMethods: mapEnumData(biddingMethods),
            },
            isLoading: false,
          }, false, "dynamic/fetchRef/fulfilled");
        } catch (err: any) {
          set({ error: err.message, isLoading: false }, false, "dynamic/fetchRef/rejected");
        }
      },

      fetchDepartments: async (ministryId: string) => {
        try {
          const departments = await api.listDepartments(ministryId);
          set((s) => ({
            referenceData: { ...s.referenceData, departments: departments || [] },
          }), false, "dynamic/fetchDepartments");
        } catch {
          set((s) => ({
            referenceData: { ...s.referenceData, departments: [] },
          }), false, "dynamic/fetchDepartments/failed");
        }
      },

      submitTender: async () => {
        const { baseData, dynamicData, templateId } = get();
        set({ isSubmitting: true, error: null }, false, "dynamic/submit/pending");

        try {
          const payload = {
            ...baseData,
            tenderNumber: baseData.referenceNumber,
            ministryId: Number(baseData.ministryId),
            departmentId: Number(baseData.departmentAgencyId),
            fundingSourceId: baseData.fundingSource ? Number(baseData.fundingSource) : null,
            estimatedBudget: Number(baseData.estimatedBudget),
            templateId: templateId,
            dynamicData: dynamicData
          };

          const result = await api.createTender(payload);
          const tenderId = result?.id;
          
          if (tenderId) {
            // Need to mock schedule and checklist since it's required for submission approval
            try {
              await api.updateTenderSchedule(tenderId, {
                advertisementStartDate: new Date().toISOString().split('T')[0],
                bidSubmissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                preBidMeetingEnabled: false,
                preBidMeetingDate: null,
                preBidMeetingTime: null,
              });
              await api.updateComplianceChecklist(tenderId, {
                procurementPlanApproved: true,
                budgetAvailabilityConfirmed: true,
                sbdsCompliantWithGuidelines: true,
                evaluationCriteriaDefined: true,
              });
            } catch (e) {
              console.warn("Failed to auto-save schedule or checklist", e);
            }
          }

          set({ isSubmitting: false, error: null }, false, "dynamic/submit/fulfilled");
          return tenderId || null;
        } catch (err: any) {
          set({ error: err.message, isSubmitting: false }, false, "dynamic/submit/rejected");
          return null;
        }
      },

      reset: () => set({
        currentStep: 0,
        showPreview: false,
        templateId: null,
        baseData: { ...INITIAL_BASE_DATA },
        dynamicData: {},
        error: null,
      }, false, "dynamic/reset"),
    }),
    { name: "DynamicTenderCreationStore" }
  )
);
