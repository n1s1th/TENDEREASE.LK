// ─── Tender Creation Store ──────────────────────────────────
// Zustand store for the multi-step tender creation wizard.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  TenderCreationState,
  TenderCreationFormData,
  StepIndex,
} from "@/lib/types/tender-creation.types";
import { api } from "@/lib/api";

const INITIAL_FORM_DATA: TenderCreationFormData = {
  // Step 0
  title: "",
  referenceNumber: "",
  procurementType: "",
  biddingMethod: "",
  ministryId: "",
  departmentAgencyId: "",
  description: "",
  // Step 1
  estimatedBudget: "",
  fundingSource: "",
  tenderType: "",
  // Step 2
  sbdTemplate: "",
  templateVersion: "",
  pendingFiles: [],
  // Step 3
  complianceChecklist: {
    procurementPlanApproved: false,
    budgetAvailabilityConfirmed: false,
    sbdComplyWithGuidelines: false,
    evaluationCriteriaDefined: false,
  },
  // Step 4
  advertisementStartDate: "",
  bidSubmissionDeadline: "",
  preBidMeetingEnabled: false,
  preBidMeetingDate: "",
};

export const useTenderCreationStore = create<TenderCreationState>()(
  devtools(
    (set, get) => ({
      // ── Initial State ─────────────────────────────
      currentStep: 0 as StepIndex,
      showPreview: false,
      formData: { ...INITIAL_FORM_DATA },
      formErrors: {},
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
      noticePreview: null,

      // ── Step Navigation ───────────────────────────
      nextStep: () =>
        set(
          (s) => ({
            currentStep: Math.min(s.currentStep + 1, 4) as StepIndex,
          }),
          false,
          "creation/nextStep"
        ),

      prevStep: () =>
        set(
          (s) => ({
            currentStep: Math.max(s.currentStep - 1, 0) as StepIndex,
            formErrors: {},
          }),
          false,
          "creation/prevStep"
        ),

      setFormErrors: (errors) =>
        set({ formErrors: errors }, false, "creation/setFormErrors"),

      goToStep: (step: StepIndex) =>
        set({ currentStep: step, showPreview: false }, false, "creation/goToStep"),

      // ── Form Data ─────────────────────────────────
      updateFormData: (partial) =>
        set(
          (s) => ({ formData: { ...s.formData, ...partial } }),
          false,
          "creation/updateFormData"
        ),

      updateComplianceItem: (key, value) =>
        set(
          (s) => ({
            formData: {
              ...s.formData,
              complianceChecklist: {
                ...s.formData.complianceChecklist,
                [key]: value,
              },
            },
          }),
          false,
          "creation/updateComplianceItem"
        ),

      addPendingFile: (file: File) =>
        set(
          (s) => ({
            formData: {
              ...s.formData,
              pendingFiles: [...s.formData.pendingFiles, file],
            },
          }),
          false,
          "creation/addPendingFile"
        ),

      removePendingFile: (index: number) =>
        set(
          (s) => ({
            formData: {
              ...s.formData,
              pendingFiles: s.formData.pendingFiles.filter((_, i) => i !== index),
            },
          }),
          false,
          "creation/removePendingFile"
        ),

      // ── Reference Data ────────────────────────────
      fetchReferenceData: async () => {
        set({ isLoading: true, error: null }, false, "creation/fetchRef/pending");
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
          // Helper to map string enums to objects
          const mapEnumData = (arr: any[]) => 
            (arr || []).map(t => typeof t === 'string' ? { id: t, name: t.replace(/_/g, ' ') } : t);

          set(
            {
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
            },
            false,
            "creation/fetchRef/fulfilled"
          );
        } catch (err: any) {
          set(
            { error: err.message, isLoading: false },
            false,
            "creation/fetchRef/rejected"
          );
        }
      },

      fetchDepartments: async (ministryId: string) => {
        try {
          const departments = await api.listDepartments(ministryId);
          set(
            (s) => ({
              referenceData: {
                ...s.referenceData,
                departments: departments || [],
              },
            }),
            false,
            "creation/fetchDepartments"
          );
        } catch {
          set(
            (s) => ({
              referenceData: { ...s.referenceData, departments: [] },
            }),
            false,
            "creation/fetchDepartments/failed"
          );
        }
      },

      // ── Submit ────────────────────────────────────
      submitTender: async () => {
        const { formData } = get();
        set({ isSubmitting: true, error: null }, false, "creation/submit/pending");

        try {
          // Build the payload (exclude pendingFiles — they are uploaded separately)
          const { pendingFiles, ...rawPayload } = formData;
          
          // Map frontend field names to backend CreateTenderRequest names
          const payload = {
            ...rawPayload,
            tenderNumber: rawPayload.referenceNumber,
            ministryId: Number(rawPayload.ministryId),
            departmentId: Number(rawPayload.departmentAgencyId),
            fundingSourceId: rawPayload.fundingSource ? Number(rawPayload.fundingSource) : null,
            estimatedBudget: Number(rawPayload.estimatedBudget)
          };

          const result = await api.createTender(payload);
          const tenderId = result?.id;

          // Upload pending files if we got a tender ID back
          if (tenderId && pendingFiles.length > 0) {
            for (const file of pendingFiles) {
              try {
                await api.uploadDocument(tenderId, file);
              } catch {
                // Continue uploading remaining files even if one fails
              }
            }
          }

          if (tenderId) {
            // Save Schedule
            try {
              await api.updateTenderSchedule(tenderId, {
                advertisementStartDate: formData.advertisementStartDate,
                bidSubmissionDeadline: formData.bidSubmissionDeadline,
                preBidMeetingEnabled: formData.preBidMeetingEnabled,
                preBidMeetingDate: formData.preBidMeetingDate || null,
                preBidMeetingTime: null,
              });
            } catch (err) {
               console.error("Failed to save schedule:", err);
            }

            // Save Compliance Checklist
            try {
              await api.updateComplianceChecklist(tenderId, {
                procurementPlanApproved: formData.complianceChecklist.procurementPlanApproved,
                budgetAvailabilityConfirmed: formData.complianceChecklist.budgetAvailabilityConfirmed,
                sbdsCompliantWithGuidelines: formData.complianceChecklist.sbdComplyWithGuidelines,
                evaluationCriteriaDefined: formData.complianceChecklist.evaluationCriteriaDefined,
              });
            } catch (err) {
               console.error("Failed to save compliance checklist:", err);
            }
          }

          set({ isSubmitting: false, error: null }, false, "creation/submit/fulfilled");
          return tenderId || null;
        } catch (err: any) {
          set(
            { error: err.message, isSubmitting: false },
            false,
            "creation/submit/rejected"
          );
          return null;
        }
      },

      // ── Preview ───────────────────────────────────
      setShowPreview: (show: boolean) =>
        set({ showPreview: show }, false, "creation/setShowPreview"),

      // ── Reset ─────────────────────────────────────
      reset: () =>
        set(
          {
            currentStep: 0 as StepIndex,
            showPreview: false,
            formData: { ...INITIAL_FORM_DATA, pendingFiles: [] },
            formErrors: {},
            error: null,
            noticePreview: null,
          },
          false,
          "creation/reset"
        ),
    }),
    { name: "TenderCreationStore" }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const selectCurrentStep = (s: TenderCreationState) => s.currentStep;
export const selectFormData = (s: TenderCreationState) => s.formData;
export const selectCreationRefData = (s: TenderCreationState) => s.referenceData;
export const selectCreationLoading = (s: TenderCreationState) => s.isLoading;
export const selectCreationSubmitting = (s: TenderCreationState) => s.isSubmitting;
export const selectCreationError = (s: TenderCreationState) => s.error;
