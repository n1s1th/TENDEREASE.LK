import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedTender {
  id: string;
  tenderNumber: string;
  title: string;
  departmentName: string;
  closingDate: string;
  status: string;
  estimatedBudget?: number;
}

interface SavedTendersState {
  savedTenders: SavedTender[];
  saveTender: (tender: SavedTender) => void;
  removeTender: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedTendersStore = create<SavedTendersState>()(
  persist(
    (set, get) => ({
      savedTenders: [],
      saveTender: (tender) =>
        set((state) => {
          if (state.savedTenders.find((t) => t.id === tender.id)) return state;
          return { savedTenders: [...state.savedTenders, tender] };
        }),
      removeTender: (id) =>
        set((state) => ({
          savedTenders: state.savedTenders.filter((t) => t.id !== id),
        })),
      isSaved: (id) => get().savedTenders.some((t) => t.id === id),
    }),
    {
      name: "tenderease-saved-tenders",
    }
  )
);
