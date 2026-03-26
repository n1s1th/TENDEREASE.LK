// ─── News & Events Types ────────────────────────────────────
export type NewsTab = "News" | "Events";

export interface NewsItem {
  id: number;
  image: string;
  date: string;
  category: string;
  title: string;
  tab: NewsTab;
}

export interface NewsState {
  items: NewsItem[];
  activeTab: NewsTab;
  isLoading: boolean;

  // Actions
  setActiveTab: (tab: NewsTab) => void;
  fetchNews: () => Promise<void>;
}
