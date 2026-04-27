import { create } from 'zustand';

export interface OrgData {
  businessName: string;
  registrationAuthority: string;
  registrationNumber: string;
  organizationType: string;
  country: string;
  registrationAddress: string;
  city: string;
  province: string;
  website: string;
  officialEmail: string;
  officialTelephone: string;
}

export interface OfficerData {
  nicOrPassportNo: string;
  name: string;
  designation: string;
  mobilePhone: string;
  email: string;
  password?: string;
}

export interface DocInfo {
  docId: string;
  documentType: string;
  documentTitle?: string;
  originalFileName: string;
  fileSizeBytes: number;
}

interface VendorRegistrationState {
  currentStep: number;
  vendorId: string | null;
  isVerified: boolean;
  verifiedCompanyName: string | null;
  organizationData: OrgData | null;
  officerData: OfficerData | null;
  uploadedDocuments: DocInfo[];
  
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setVerified: (status: boolean, companyName?: string) => void;
  setOrganizationData: (data: OrgData) => void;
  setOfficerData: (data: OfficerData) => void;
  setVendorId: (id: string) => void;
  addDocument: (doc: DocInfo) => void;
  removeDocument: (docId: string) => void;
  resetDocStore: () => void;
}

export const useVendorStore = create<VendorRegistrationState>((set) => ({
  currentStep: 1,
  vendorId: null,
  isVerified: false,
  verifiedCompanyName: null,
  organizationData: null,
  officerData: null,
  uploadedDocuments: [],

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  setVerified: (status, companyName) => set({ isVerified: status, verifiedCompanyName: companyName || null }),
  
  setOrganizationData: (data) => set({ organizationData: data }),
  setOfficerData: (data) => set({ officerData: data }),
  setVendorId: (id) => set({ vendorId: id }),
  
  addDocument: (doc) => set((state) => ({ uploadedDocuments: [...state.uploadedDocuments, doc] })),
  removeDocument: (docId) => set((state) => ({
    uploadedDocuments: state.uploadedDocuments.filter((d) => d.docId !== docId)
  })),
  resetDocStore: () => set({ uploadedDocuments: [] })
}));
