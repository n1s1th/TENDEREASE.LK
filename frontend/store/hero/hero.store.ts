// ─── Hero Store ──────────────────────────────────────────────
// Manages carousel slides, search query, and category selection.
// Slides and categories seeded from HeroSection.tsx constants.
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { HeroState, HeroSlide } from "@/lib/types/hero.types";

// ── Seed data (moved from HeroSection.tsx) ───────────────────
const INITIAL_SLIDES: HeroSlide[] = [
  {
    badge: "TENDEREASE",
    heading: "Access Government Tenders Across All Sectors in One Place",
    subtext:
      "Stay updated with the latest government tenders and contracts tailored to your business needs.",
    image: "https://wallpaperaccess.com/full/1717434.jpg",
  },
  {
    badge: "TENDEREASE",
    heading: "Find and Win More Government Contracts Faster",
    subtext:
      "Discover thousands of active tenders, filter by category and location, and never miss an opportunity.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    badge: "TENDEREASE",
    heading: "Streamline Your Tender Bidding Process Today",
    subtext:
      "From discovery to submission — TenderEase helps you manage the entire tendering lifecycle.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
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
