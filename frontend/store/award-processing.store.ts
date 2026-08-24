import { create } from 'zustand';

export interface AwardTender {
  id: string;
  tenderNo: string;
  title: string;
  department: string;
  status: 'PENDING_CAO' | 'APPROVED' | 'REJECTED' | 'AWARDED' | string;
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
      const { bidders } = get();
      const targetBidders = bidders.filter(b => b.status === type);
      
      const NOTIFICATION_API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.tenderease.me') + '/api/v1/notifications/email';
      
      const promises = targetBidders.map(bidder => {
        if (!bidder.bidderEmail) return Promise.resolve();
        
        let subject = '';
        let body = '';
        
        if (type === 'WINNER') {
          subject = `Tender Award Notification - ${tenderId}`;
          body = `Dear ${bidder.bidderName},\n\nWe are pleased to inform you that your bid for tender ${tenderId} has been successful.\nOur team will contact you shortly to finalize the contract details.\n\nCongratulations,\nProcurement Team`;
        } else {
          subject = `Tender Evaluation Outcome - ${tenderId}`;
          body = `Dear ${bidder.bidderName},\n\nThank you for participating in tender ${tenderId}.\nAfter careful evaluation, we regret to inform you that your bid was not successful on this occasion.\nWe appreciate your effort and encourage you to participate in future opportunities.\n\nSincerely,\nProcurement Team`;
        }
        
        return fetch(NOTIFICATION_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: bidder.bidderEmail,
            subject: subject,
            body: body,
            isHtml: false
          })
        });
      });
      
      await Promise.all(promises);
      
      // Also hit the mock endpoint just to update any mock state if needed, but errors don't matter
      fetch(`${BASE_URL}/awards/tenders/${tenderId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      }).catch(console.error);

    } finally {
      set({ generatingEmails: false });
    }
  }
}));
