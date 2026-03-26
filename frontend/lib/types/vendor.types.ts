// ─── Vendor Types ───────────────────────────────────────────
export type KycStatus = "pending" | "approved" | "rejected" | "not_started";

export interface Vendor {
  id: string;
  companyName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  category: string;
  kycStatus: KycStatus;
  createdAt: string;
}

export interface VendorState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  kycStatus: KycStatus | null;
  isLoading: boolean;

  // Actions
  fetchVendors: () => Promise<void>;
  addVendor: (vendor: Vendor) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  updateKycStatus: (vendorId: string, status: KycStatus) => void;
}
