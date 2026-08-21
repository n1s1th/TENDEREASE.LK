// ─── Video Store ─────────────────────────────────────────────
// Dummy data lives here as initial state.
// When backend is ready, replace with apiFetchVideos() call.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { VideoState, VideoGuide } from "@/lib/types/video.types";

// ── Seed data (moved from GuideVideos.tsx) ───────────────────
const INITIAL_VIDEOS: VideoGuide[] = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&auto=format&fit=crop",
    title: "How to register as a vendor on TenderHub",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "3:24",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop",
    title: "How to find and filter government tenders",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "4:51",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop",
    title: "How to submit a bid and track your application",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "5:12",
  },
];

export const useVideoStore = create<VideoState>()(
  devtools(
    (set) => ({
      // ── Initial State (seeded with dummy data) ────────────
      videos: INITIAL_VIDEOS,
      isLoading: false,

      // ── Actions ───────────────────────────────────────────
      fetchVideos: async () => {
        set({ isLoading: true }, false, "video/fetch/pending");
        try {
          // TODO: replace with real API call
          // const data = await apiFetchVideos();
          // set({ videos: data, isLoading: false }, false, "video/fetch/fulfilled");
          set({ isLoading: false }, false, "video/fetch/fulfilled");
        } catch {
          set({ isLoading: false }, false, "video/fetch/rejected");
        }
      },
    }),
    { name: "VideoStore" }
  )
);

// ── Selectors ────────────────────────────────────────────────
export const selectVideos = (s: VideoState) => s.videos;
export const selectVideoLoading = (s: VideoState) => s.isLoading;
