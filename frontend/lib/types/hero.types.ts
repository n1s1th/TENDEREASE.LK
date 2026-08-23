// ─── Hero Section Types ─────────────────────────────────────
export interface HeroSlide {
  badge: string;
  heading: string;
  subtext: string;
  image: string;
}

export interface HeroState {
  slides: HeroSlide[];
  categories: string[];
  currentSlide: number;
  searchQuery: string;
  selectedCategory: string;

  // Actions
  nextSlide: () => void;
  prevSlide: () => void;
  setSlide: (index: number) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
}
