// ─── Tender Store ───────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TenderState, Tender, TenderFilter } from "@/lib/types/tender.types";
import { apiFetchTenders } from "@/lib/api/tender.api";

const DEFAULT_FILTERS: TenderFilter = {};

export const useTenderStore = create<TenderState>()(
  devtools(
    (set, get) => ({
      // ── Initial State ───────────────────────────
      tenders: [],
      selectedTender: null,
      filters: DEFAULT_FILTERS,
      isLoading: false,


      // ── Actions ────────────────────────────────
      fetchTenders: async () => {
        set({ isLoading: true }, false, "tender/fetchTenders/pending");
        try {
          const filters = get().filters;
          const tenders = await apiFetchTenders(filters);
          set({ tenders, isLoading: false }, false, "tender/fetchTenders/fulfilled");
        } catch {
          set({ isLoading: false }, false, "tender/fetchTenders/rejected");
        }
      },

      setSelectedTender: (tender: Tender | null) =>
        set({ selectedTender: tender }, false, "tender/setSelectedTender"),

      setFilters: (partial: Partial<TenderFilter>) =>
        set(
          (state) => ({ filters: { ...state.filters, ...partial } }),
          false,
          "tender/setFilters"
        ),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, "tender/resetFilters"),
    }),
    { name: "TenderStore" }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const selectTenders = (s: TenderState) => s.tenders;
export const selectSelectedTender = (s: TenderState) => s.selectedTender;
export const selectTenderFilters = (s: TenderState) => s.filters;
export const selectTenderLoading = (s: TenderState) => s.isLoading;

// Derived selector — open tenders only
export const selectOpenTenders = (s: TenderState) =>
  s.tenders.filter((t) => t.status === "open");
