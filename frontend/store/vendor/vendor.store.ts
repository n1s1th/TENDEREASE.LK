// ─── Vendor Store ───────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { VendorState, Vendor, KycStatus } from "@/lib/types/vendor.types";
import { apiFetchVendors, apiUpdateKycStatus } from "@/lib/api/vendor.api";

export const useVendorStore = create<VendorState>()(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────
      vendors: [],
      selectedVendor: null,
      kycStatus: null,
      isLoading: false,

      // ── Actions ────────────────────────────────
      fetchVendors: async () => {
        set({ isLoading: true }, false, "vendor/fetchVendors/pending");
        try {
          const vendors = await apiFetchVendors();
          set({ vendors, isLoading: false }, false, "vendor/fetchVendors/fulfilled");
        } catch {
          set({ isLoading: false }, false, "vendor/fetchVendors/rejected");
        }
      },

      addVendor: (vendor: Vendor) =>
        set(
          (state) => ({ vendors: [...state.vendors, vendor] }),
          false,
          "vendor/addVendor"
        ),

      setSelectedVendor: (vendor) =>
        set({ selectedVendor: vendor }, false, "vendor/setSelectedVendor"),

      updateKycStatus: async (vendorId: string, status: KycStatus) => {
        await apiUpdateKycStatus(vendorId, status);
        set(
          (state) => ({
            vendors: state.vendors.map((v) =>
              v.id === vendorId ? { ...v, kycStatus: status } : v
            ),
            kycStatus:
              state.selectedVendor?.id === vendorId ? status : state.kycStatus,
          }),
          false,
          "vendor/updateKycStatus"
        );
      },
    }),
    { name: "VendorStore" }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const selectVendors = (s: VendorState) => s.vendors;
export const selectSelectedVendor = (s: VendorState) => s.selectedVendor;
export const selectVendorLoading = (s: VendorState) => s.isLoading;
export const selectKycStatus = (s: VendorState) => s.kycStatus;
