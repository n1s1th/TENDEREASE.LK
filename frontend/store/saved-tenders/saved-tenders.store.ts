import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getSavedTenders,
  getSavedTenderIds,
  saveTender as saveTenderApi,
  unsaveTender as unsaveTenderApi,
} from "@/services/tender.service";

export interface SavedTendersState {
  /** Full tender summaries, loaded on demand by the Saved Tenders view. */
  savedTenders: any[];
  /** Ids of every saved tender — drives the bookmark icon everywhere. */
  savedIds: string[];
  loading: boolean;
  hydrated: boolean;
  error: string | null;

  fetchTenders: () => Promise<void>;
  fetchSavedIds: () => Promise<void>;
  saveTender: (id: string) => Promise<void>;
  unsaveTender: (id: string) => Promise<void>;
  toggleTender: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  reset: () => void;
}

const EMPTY = {
  savedTenders: [] as any[],
  savedIds: [] as string[],
  loading: false,
  hydrated: false,
  error: null as string | null,
};

export const useSavedTendersStore = create<SavedTendersState>()(
  devtools(
    (set, get) => ({
      ...EMPTY,

      /** Loads the full saved list (used by the Saved Tenders page). */
      fetchTenders: async () => {
        set({ loading: true, error: null }, false, "savedTenders/fetch");
        try {
          const data = await getSavedTenders(0, 50);
          const content = Array.isArray(data) ? data : data?.content ?? [];

          set(
            {
              savedTenders: content,
              savedIds: content.map((t: any) => String(t.id)),
              loading: false,
              hydrated: true,
            },
            false,
            "savedTenders/fetch/success"
          );
        } catch (error: any) {
          // A signed-out user simply has no bookmarks; don't surface that as an error.
          set(
            { ...EMPTY, hydrated: true, error: error?.message ?? "Failed to load saved tenders" },
            false,
            "savedTenders/fetch/error"
          );
        }
      },

      /**
       * Loads just the ids. Cheaper than the full list, so this is what runs on
       * login/session-restore to make bookmark state survive a reload.
       */
      fetchSavedIds: async () => {
        try {
          const ids = await getSavedTenderIds();
          set(
            { savedIds: (ids ?? []).map(String), hydrated: true },
            false,
            "savedTenders/fetchIds/success"
          );
        } catch {
          set({ ...EMPTY, hydrated: true }, false, "savedTenders/fetchIds/error");
        }
      },

      saveTender: async (id: string) => {
        const key = String(id);
        if (get().savedIds.includes(key)) return;

        // Optimistic: flip the icon immediately, roll back if the call fails.
        set({ savedIds: [...get().savedIds, key] }, false, "savedTenders/save");
        try {
          await saveTenderApi(key);
        } catch (error: any) {
          set(
            {
              savedIds: get().savedIds.filter((x) => x !== key),
              error: error?.message ?? "Could not save tender",
            },
            false,
            "savedTenders/save/rollback"
          );
          throw error;
        }
      },

      unsaveTender: async (id: string) => {
        const key = String(id);
        const previousIds = get().savedIds;
        const previousTenders = get().savedTenders;
        if (!previousIds.includes(key)) return;

        set(
          {
            savedIds: previousIds.filter((x) => x !== key),
            savedTenders: previousTenders.filter((t: any) => String(t.id) !== key),
          },
          false,
          "savedTenders/unsave"
        );
        try {
          await unsaveTenderApi(key);
        } catch (error: any) {
          set(
            {
              savedIds: previousIds,
              savedTenders: previousTenders,
              error: error?.message ?? "Could not remove saved tender",
            },
            false,
            "savedTenders/unsave/rollback"
          );
          throw error;
        }
      },

      toggleTender: async (id: string) => {
        const { isSaved, saveTender, unsaveTender } = get();
        return isSaved(id) ? unsaveTender(id) : saveTender(id);
      },

      isSaved: (id: string) => get().savedIds.includes(String(id)),

      /** Called on sign-out so one user's bookmarks never leak into the next session. */
      reset: () => set({ ...EMPTY }, false, "savedTenders/reset"),
    }),
    { name: "SavedTendersStore" }
  )
);

// ── Selectors ──
export const selectSavedTenders = (s: SavedTendersState) => s.savedTenders;
export const selectSavedIds = (s: SavedTendersState) => s.savedIds;
export const selectSavedLoading = (s: SavedTendersState) => s.loading;
