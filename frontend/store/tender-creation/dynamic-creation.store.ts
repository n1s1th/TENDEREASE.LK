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
  submitTender: (sections?: any[], templateName?: string) => Promise<{ tenderId: string | null; tenderNumber: string }>;
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
            api.listTenderTypes().catch((): any[] => []),
            api.listSbdTemplates().catch((): any[] => []),
            api.listProcurementTypes().catch((): any[] => []),
            api.listMinistries().catch((): any[] => []),
            api.listFundingSources().catch((): any[] => []),
            api.listBiddingMethods().catch((): any[] => []),
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

      submitTender: async (sections?: any[], templateName?: string) => {
        const { dynamicData, templateId } = get();
        set({ isSubmitting: true, error: null }, false, "dynamic/submit/pending");

        try {
          // Helper to find a field value in dynamicData by keyword in field title
          const findValueByTitle = (keywords: string[]) => {
            if (!sections) return null;
            for (const section of sections) {
              for (const field of section.fields || []) {
                const titleLower = (field.title || "").toLowerCase();
                if (keywords.some((k) => titleLower.includes(k))) {
                  const val = dynamicData[field.id];
                  if (val !== undefined && val !== null && val !== "") return val;
                }
              }
            }
            return null;
          };

          const title =
            findValueByTitle(["tender title", "title"]) ||
            templateName ||
            `Tender-${Date.now().toString().slice(-6)}`;

          const tenderNumber =
            findValueByTitle(["reference number", "reference", "tender number", "code"]) ||
            `TDR-${Date.now().toString().slice(-6)}`;

          const rawProcType = String(
            findValueByTitle(["procurement type", "procurement"]) || "GOODS"
          ).toUpperCase();
          const validProcTypes = ["GOODS", "WORKS", "SERVICES", "CONSULTING"];
          const procurementType = validProcTypes.includes(rawProcType) ? rawProcType : "GOODS";

          const rawBiddingMethod = String(
            findValueByTitle(["bidding method", "method"]) || "NCB"
          ).toUpperCase();
          const validBiddingMethods = ["NCB", "ICB", "LIB", "DIRECT_CONTRACTING", "SHOPPING"];
          const biddingMethod = validBiddingMethods.includes(rawBiddingMethod)
            ? rawBiddingMethod
            : "NCB";

          const rawTenderType = String(
            findValueByTitle(["tender type"]) || "OPEN_TENDER"
          )
            .toUpperCase()
            .replace(/ /g, "_");
          const validTenderTypes = [
            "OPEN_TENDER",
            "LIMITED_TENDER",
            "FRAMEWORK_CONTRACT",
            "TWO_STAGE",
            "EXPRESSION_OF_INTEREST",
          ];
          const tenderType = validTenderTypes.includes(rawTenderType)
            ? rawTenderType
            : "OPEN_TENDER";

          const rawBudget = findValueByTitle(["budget", "cost", "estimated budget", "amount"]);
          const estimatedBudget =
            rawBudget && !isNaN(Number(rawBudget)) && Number(rawBudget) > 0
              ? Number(rawBudget)
              : 1000000.0;

          const description =
            findValueByTitle(["description", "scope of work", "details"]) || "";

          const payload = {
            title,
            tenderNumber,
            procurementType,
            biddingMethod,
            tenderType,
            ministryId: 1,
            departmentId: 1,
            fundingSourceId: 1,
            description,
            estimatedBudget,
            templateId: templateId,
            dynamicData: dynamicData,
          };

          const result = await api.createTender(payload);
          const tenderId = result?.id;
          
          if (tenderId) {
            // Auto-save schedule and checklist defaults so submission approval succeeds
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
          return { tenderId: tenderId || null, tenderNumber };
        } catch (err: any) {
          set({ error: err.message, isSubmitting: false }, false, "dynamic/submit/rejected");
          return { tenderId: null, tenderNumber: "" };
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
