import { create } from "zustand";
import { useAuthStore } from "./auth/auth.store";
import { saveTender as apiSaveTender, unsaveTender as apiUnsaveTender, getSavedTenders } from "@/services/tender.service";

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
  fetchTenders: () => Promise<void>;
  saveTender: (tender: SavedTender) => Promise<void>;
  removeTender: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
}

export const useSavedTendersStore = create<SavedTendersState>((set, get) => ({
  savedTenders: [],
  
  fetchTenders: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ savedTenders: [] });
      return;
    }
    try {
      const res = await getSavedTenders();
      if (res && res.content) {
        set({ savedTenders: res.content.map((t: any) => ({ ...t, userId })) });
      }
    } catch (err) {
      console.error("Failed to fetch saved tenders", err);
    }
  },
  
  saveTender: async (tender) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return; // Only save if user is logged in
    
    // Optimistic UI update
    set((state) => {
      if (state.savedTenders.find((t) => t.id === tender.id)) return state;
      return { savedTenders: [{ ...tender, userId }, ...state.savedTenders] };
    });
    
    try {
      await apiSaveTender(tender.id);
    } catch (err) {
      console.error("Failed to save tender to backend", err);
      // Revert optimistic update
      set((state) => ({
        savedTenders: state.savedTenders.filter((t) => t.id !== tender.id),
      }));
    }
  },
  
  removeTender: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    // Backup for rollback
    const backup = get().savedTenders.find((t) => t.id === id);
    
    // Optimistic UI update
    set((state) => ({
      savedTenders: state.savedTenders.filter((t) => t.id !== id),
    }));
    
    try {
      await apiUnsaveTender(id);
    } catch (err) {
      console.error("Failed to unsave tender from backend", err);
      // Revert optimistic update
      if (backup) {
        set((state) => ({
          savedTenders: [{...backup}, ...state.savedTenders],
        }));
      }
    }
  },
  
  isSaved: (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return false;
    return get().savedTenders.some((t) => t.id === id);
  },
}));
