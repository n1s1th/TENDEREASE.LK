import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth/auth.store";

interface SavedTender {
  id: string;
  tenderNumber: string;
  title: string;
  departmentName: string;
  closingDate: string;
  status: string;
  estimatedBudget?: number;
  userId?: string;
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
          const userId = useAuthStore.getState().user?.id;
          if (!userId) return state; // Only save if user is logged in
          if (state.savedTenders.find((t) => t.id === tender.id && t.userId === userId)) return state;
          return { savedTenders: [{ ...tender, userId }, ...state.savedTenders] };
        }),
      removeTender: (id) =>
        set((state) => {
          const userId = useAuthStore.getState().user?.id;
          return {
            savedTenders: state.savedTenders.filter((t) => !(t.id === id && t.userId === userId)),
          }
        }),
      isSaved: (id) => {
        const userId = useAuthStore.getState().user?.id;
        return get().savedTenders.some((t) => t.id === id && t.userId === userId);
      },
    }),
    {
      name: "tenderease-saved-tenders",
    }
  )
);
