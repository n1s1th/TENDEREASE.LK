// ─── Tender Store ───────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TenderState, Tender, TenderFilter } from "@/lib/types/tender.types";
import { apiFetchTenders } from "@/lib/api/tender.api";

const DEFAULT_FILTERS: TenderFilter = {};

// ── Seed data (moved from LatestTenders.tsx) ─────────────────
const INITIAL_TENDERS: Tender[] = [
  {
    id: "1",
    title: "Primary School Renovation — 12 Sites",
    category: "Construction",
    issuer: "Education Ministry",
    estimatedValue: 5200000,
    deadline: "Apr 20, 2026",
    status: "open",
    publishedAt: "2026-03-01",
  },
  {
    id: "2",
    title: "National Data Centre Build-Out",
    category: "IT & Infrastructure",
    issuer: "ICT Authority",
    estimatedValue: 22800000,
    deadline: "May 5, 2026",
    status: "open",
    publishedAt: "2026-03-05",
  },
  {
    id: "3",
    title: "Medical Equipment Supply — 40 Hospitals",
    category: "Healthcare",
    issuer: "Health Department",
    estimatedValue: 11400000,
    deadline: "Apr 28, 2026",
    status: "pending",
    publishedAt: "2026-02-20",
  },
  {
    id: "4",
    title: "Urban Street Lighting Upgrade",
    category: "Electrical",
    issuer: "City Council",
    estimatedValue: 3600000,
    deadline: "Mar 30, 2026",
    status: "closed",
    publishedAt: "2026-02-10",
  },
  {
    id: "5",
    title: "Port Logistics System Modernization",
    category: "Logistics",
    issuer: "Port Authority",
    estimatedValue: 44000000,
    deadline: "May 14, 2026",
    status: "open",
    publishedAt: "2026-03-10",
  },
];

export const useTenderStore = create<TenderState>()(
  devtools(
    (set, get) => ({
      // ── Initial State ───────────────────────────
      tenders: INITIAL_TENDERS,
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
