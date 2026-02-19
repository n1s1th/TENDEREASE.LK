// services/evaluation.service.ts
import { api } from './api';
import { EvaluationData, CriterionScore } from '@/types/evaluation.types';

export const evaluationService = {
  // Fetch evaluation data for a specific tender and bidder
  getEvaluationData: async (tenderId: string, bidderId: string) => {
    const response = await api.get(`/evaluations/${tenderId}/bidders/${bidderId}`);
    return response.data as EvaluationData;
  },

  // Save evaluation draft
  saveDraft: async (
    tenderId: string,
    bidderId: string,
    scores: CriterionScore[]
  ) => {
    const response = await api.post(
      `/evaluations/${tenderId}/bidders/${bidderId}/draft`,
      { scores }
    );
    return response.data;
  },

  // Submit final evaluation
  submitEvaluation: async (
    tenderId: string,
    bidderId: string,
    scores: CriterionScore[]
  ) => {
    const response = await api.post(
      `/evaluations/${tenderId}/bidders/${bidderId}/submit`,
      { scores }
    );
    return response.data;
  },

  // Get all bidders for a tender
  getTenderBidders: async (tenderId: string) => {
    const response = await api.get(`/tenders/${tenderId}/bidders`);
    return response.data;
  },

  // Download score sheet (PDF or Excel)
  downloadScoreSheet: async (
    tenderId: string,
    bidderId: string,
    format: 'pdf' | 'excel'
  ) => {
    const response = await api.get(
      `/evaluations/${tenderId}/bidders/${bidderId}/download?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};