// lib/store.ts
import { create } from 'zustand';

interface VendorState {
  formData: any;
  setFormData: (data: any) => void;
}

export const useVendorStore = create<VendorState>((set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data }),
}));