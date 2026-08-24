import { create } from 'zustand';

export interface AwardTender {
  id: string;
  tenderNo: string;
  title: string;
  department: string;
  status: 'PENDING_CAO' | 'APPROVED' | 'REJECTED';
}

export interface AwardBidder {
  bidderId: string;
  bidderName: string;
  bidderEmail?: string;
  score: number;
  bidAmount: number;
  status: 'WINNER' | 'LOST' | 'PENDING';
}

interface AwardProcessingState {
  tenders: AwardTender[];
  loadingTenders: boolean;
  bidders: AwardBidder[];
  loadingBidders: boolean;
  generatingEmails: boolean;
  
  fetchTenders: () => Promise<void>;
  fetchBidders: (tenderId: string) => Promise<void>;
  generateEmails: (tenderId: string, type: 'WINNER' | 'LOST') => Promise<void>;
}

const BASE_URL = (process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://localhost:8084') + '/api/evaluations/mock';

export const useAwardProcessingStore = create<AwardProcessingState>((set, get) => ({
  tenders: [],
  loadingTenders: false,
  bidders: [],
  loadingBidders: false,
  generatingEmails: false,

  fetchTenders: async () => {
    set({ loadingTenders: true });
    try {
      // Fetch from BidEvaluationMockController
      const res = await fetch(`${BASE_URL}/awards/tenders`);
      if (res.ok) {
        const data = await res.json();
        set({ tenders: data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ loadingTenders: false });
    }
  },

  fetchBidders: async (tenderId: string) => {
    set({ loadingBidders: true, bidders: [] });
    try {
      const res = await fetch(`${BASE_URL}/awards/tenders/${tenderId}/bidders`);
      if (res.ok) {
        const data = await res.json();
        set({ bidders: data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ loadingBidders: false });
    }
  },

  generateEmails: async (tenderId: string, type: 'WINNER' | 'LOST') => {
    set({ generatingEmails: true });
    try {
      const res = await fetch(`${BASE_URL}/awards/tenders/${tenderId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!res.ok) {
        throw new Error("Failed to generate emails");
      }
    } finally {
      set({ generatingEmails: false });
    }
  }
}));
