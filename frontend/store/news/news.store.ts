// ─── News Store ─────────────────────────────────────────────
// Dummy data lives here as initial state.
// When backend is ready, replace with apiFetchNews() call.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NewsState, NewsItem, NewsTab } from "@/lib/types/news.types";

// ── Seed data (moved from NewsSection.tsx) ──────────────────
const INITIAL_ITEMS: NewsItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop",
    date: "March 5, 2025",
    category: "NEWS",
    title: "Government Launches New Digital Tendering Framework for 2025",
    tab: "News",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&auto=format&fit=crop",
    date: "March 5, 2025",
    category: "NEWS",
    title: "Registered Vendors on the Rise: Crosses Five Thousand Accounts",
    tab: "News",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop",
    date: "February 24, 2025",
    category: "NEWS",
    title: "TenderHub Partners with Procurement Authority to Improve Transparency",
    tab: "News",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop",
    date: "April 10, 2025",
    category: "EVENT",
    title: "National Procurement Summit 2025 – Registration Now Open",
    tab: "Events",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop",
    date: "April 18, 2025",
    category: "EVENT",
    title: "Vendor Onboarding Workshop: How to Bid & Win on TenderHub",
    tab: "Events",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop",
    date: "May 2, 2025",
    category: "EVENT",
    title: "Webinar: Navigating Government Contracts for Small Businesses",
    tab: "Events",
  },
];

export const useNewsStore = create<NewsState>()(
  devtools(
    (set) => ({
      // ── Initial State (seeded with dummy data) ───────────
      items: INITIAL_ITEMS,
      activeTab: "News" as NewsTab,
      isLoading: false,

      // ── Actions ──────────────────────────────────────────
      setActiveTab: (tab) =>
        set({ activeTab: tab }, false, "news/setActiveTab"),

      fetchNews: async () => {
        set({ isLoading: true }, false, "news/fetch/pending");
        try {
          // TODO: replace with real API call
          // const data = await apiFetchNews();
          // set({ items: data, isLoading: false }, false, "news/fetch/fulfilled");
          set({ isLoading: false }, false, "news/fetch/fulfilled");
        } catch {
          set({ isLoading: false }, false, "news/fetch/rejected");
        }
      },
    }),
    { name: "NewsStore" }
  )
);

// ── Selectors ───────────────────────────────────────────────
export const selectAllNewsItems = (s: NewsState) => s.items;
export const selectActiveTab = (s: NewsState) => s.activeTab;
export const selectFilteredNews = (s: NewsState) =>
  s.items.filter((item) => item.tab === s.activeTab);
export const selectNewsLoading = (s: NewsState) => s.isLoading;
