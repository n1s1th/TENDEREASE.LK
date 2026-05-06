import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OfficerRegistrationResult {
  success: boolean;
  referenceId?: string;
  errors?: string[];
  supportId?: string;
}

/** Form data saved to sessionStorage so it survives page refreshes. */
export interface OfficerFormDraft {
  procuringEntityType: string;
  procuringEntityLevel: string;
  provincialCouncil: string;
  headDesignation: string;
  organizationName: string;
  country: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  personalLandPhone: string;
  officialEmail: string;
  businessRegistrationNumber: string;
  vatRegistrationNumber: string;
  liaisonTitle: string;
  liaisonName: string;
  liaisonDesignation: string;
  liaisonNic: string;
  liaisonMobile: string;
  liaisonEmail: string;
  termsAccepted: boolean;
}

export const EMPTY_DRAFT: OfficerFormDraft = {
  procuringEntityType: '',
  procuringEntityLevel: '',
  provincialCouncil: '',
  headDesignation: '',
  organizationName: '',
  country: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  province: '',
  postalCode: '',
  personalLandPhone: '',
  officialEmail: '',
  businessRegistrationNumber: '',
  vatRegistrationNumber: '',
  liaisonTitle: '',
  liaisonName: '',
  liaisonDesignation: '',
  liaisonNic: '',
  liaisonMobile: '',
  liaisonEmail: '',
  termsAccepted: false,
};

interface OfficerRegistrationState {
  /** Result of officer registration attempt */
  result: OfficerRegistrationResult | null;

  /** Loading state during submission */
  submitting: boolean;

  /** Draft form data persisted in sessionStorage */
  formDraft: OfficerFormDraft;

  setResult: (result: OfficerRegistrationResult) => void;
  setSubmitting: (submitting: boolean) => void;
  setFormDraft: (draft: OfficerFormDraft) => void;
  clearDraft: () => void;
  reset: () => void;
}

export const useOfficerStore = create<OfficerRegistrationState>()(
  persist(
    (set) => ({
      result: null,
      submitting: false,
      formDraft: EMPTY_DRAFT,

      setResult: (result) => set({ result }),
      setSubmitting: (submitting) => set({ submitting }),
      setFormDraft: (formDraft) => set({ formDraft }),
      clearDraft: () => set({ formDraft: EMPTY_DRAFT }),
      reset: () => set({ result: null, submitting: false, formDraft: EMPTY_DRAFT }),
    }),
    {
      name: 'officer-registration-store',
      // Only persist these fields — never persist loading state
      partialize: (state) => ({
        result: state.result,
        formDraft: state.formDraft,
      }),
    }
  )
);
