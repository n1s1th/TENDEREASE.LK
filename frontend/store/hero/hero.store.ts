// ─── Hero Store ──────────────────────────────────────────────
// Manages carousel slides, search query, and category selection.
// Slides and categories seeded from HeroSection.tsx constants.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { HeroState, HeroSlide } from "@/lib/types/hero.types";

// ── Seed data (moved from HeroSection.tsx) ───────────────────
const INITIAL_SLIDES: HeroSlide[] = [
  {
    badge: "TENDERHUB",
    heading: "Access Government Tenders Across All Sectors in One Place",
    subtext:
      "Stay updated with the latest government tenders and contracts tailored to your business needs.",
  },
  {
    badge: "TENDERHUB",
    heading: "Find and Win More Government Contracts Faster",
    subtext:
      "Discover thousands of active tenders, filter by category and location, and never miss an opportunity.",
  },
  {
    badge: "TENDERHUB",
    heading: "Streamline Your Tender Bidding Process Today",
    subtext:
      "From discovery to submission — TenderHub helps you manage the entire tendering lifecycle.",
  },
];

const INITIAL_CATEGORIES: string[] = [
  "All Categories",
  "Construction",
  "IT & Technology",
  "Healthcare",
  "Transportation",
  "Education",
  "Energy",
  "Defense",
  "Agriculture",
  "Consulting",
];

export const useHeroStore = create<HeroState>()(
  devtools(
    (set, get) => ({
      // ── Initial State (seeded with dummy data) ─────────────
      slides: INITIAL_SLIDES,
      categories: INITIAL_CATEGORIES,
      currentSlide: 0,
      searchQuery: "",
      selectedCategory: "All Categories",

      // ── Actions ────────────────────────────────────────────
      nextSlide: () =>
        set(
          (state) => ({
            currentSlide: (state.currentSlide + 1) % state.slides.length,
          }),
          false,
          "hero/nextSlide"
        ),

      prevSlide: () =>
        set(
          (state) => ({
            currentSlide:
              (state.currentSlide - 1 + state.slides.length) %
              state.slides.length,
          }),
          false,
          "hero/prevSlide"
        ),

      setSlide: (index) =>
        set({ currentSlide: index }, false, "hero/setSlide"),

      setSearchQuery: (q) =>
        set({ searchQuery: q }, false, "hero/setSearchQuery"),

      setSelectedCategory: (cat) =>
        set({ selectedCategory: cat }, false, "hero/setSelectedCategory"),
    }),
    { name: "HeroStore" }
  )
);

// ── Selectors ─────────────────────────────────────────────────
export const selectSlides = (s: HeroState) => s.slides;
export const selectCategories = (s: HeroState) => s.categories;
export const selectCurrentSlide = (s: HeroState) =>
  s.slides[s.currentSlide];
export const selectCurrentSlideIndex = (s: HeroState) => s.currentSlide;
export const selectSearchQuery = (s: HeroState) => s.searchQuery;
export const selectSelectedCategory = (s: HeroState) => s.selectedCategory;
