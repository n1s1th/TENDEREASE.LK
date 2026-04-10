import { create } from 'zustand';

export interface OfficerRegistrationResult {
  success: boolean;
  referenceId?: string;
  errors?: string[];
  supportId?: string;
}

interface OfficerRegistrationState {
  /** Result of officer registration attempt */
  result: OfficerRegistrationResult | null;

  /** Loading state during submission */
  submitting: boolean;

  setResult: (result: OfficerRegistrationResult) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export const useOfficerStore = create<OfficerRegistrationState>((set) => ({
  result: null,
  submitting: false,

  setResult: (result) => set({ result }),
  setSubmitting: (submitting) => set({ submitting }),
  reset: () => set({ result: null, submitting: false }),
}));
