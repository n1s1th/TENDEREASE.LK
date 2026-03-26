// ─── Tender Types ───────────────────────────────────────────
export type TenderStatus = "open" | "closed" | "pending" | "awarded";

export interface Tender {
  id: string;
  title: string;
  category: string;
  issuer: string;
  estimatedValue: number;
  deadline: string;
  status: TenderStatus;
  description?: string;
  publishedAt: string;
}

export interface TenderFilter {
  category?: string;
  status?: TenderStatus;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TenderState {
  tenders: Tender[];
  selectedTender: Tender | null;
  filters: TenderFilter;
  isLoading: boolean;

  // Actions
  fetchTenders: () => Promise<void>;
  setSelectedTender: (tender: Tender | null) => void;
  setFilters: (filters: Partial<TenderFilter>) => void;
  resetFilters: () => void;
}
