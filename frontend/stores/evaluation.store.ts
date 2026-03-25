// stores/evaluation.store.ts
import { create } from 'zustand';
import { EvaluationData } from '@/types/evaluation.types';

interface EvaluationState {
  // Data
  evaluationData: EvaluationData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEvaluationData: (data: EvaluationData) => void;
  updateTechnicalScore: (criterionId: string, score: number, comment: string) => void;
  updateFinancialScore: (criterionId: string, score: number, comment: string) => void;
  calculateSummary: () => void;
  saveDraft: () => Promise<void>;
  submitEvaluation: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  evaluationData: null,
  isLoading: false,
  error: null,

  setEvaluationData: (data) => set({ evaluationData: data }),

  updateTechnicalScore: (criterionId, score, comment) => {
    const { evaluationData } = get();
    if (!evaluationData) return;

    const updatedScores = evaluationData.technical.scores.map((s) =>
      s.criterionId === criterionId ? { ...s, score, comment } : s
    );

    // Recalculate weighted scores
    const criteriaMap = new Map(
      evaluationData.technical.criteria.map((c) => [c.id, c.weight])
    );

    const updatedWithWeighted = updatedScores.map((s) => ({
      ...s,
      weightedScore: (s.score * (criteriaMap.get(s.criterionId) || 0)) / 100,
    }));

    const totalScore = updatedWithWeighted.reduce(
      (sum, s) => sum + s.weightedScore,
      0
    );

    set({
      evaluationData: {
        ...evaluationData,
        technical: {
          ...evaluationData.technical,
          scores: updatedWithWeighted,
          totalScore,
          passed: totalScore >= evaluationData.technical.threshold,
        },
      },
    });
  },

  updateFinancialScore: (criterionId, score, comment) => {
    const { evaluationData } = get();
    if (!evaluationData) return;

    const updatedScores = evaluationData.financial.scores.map((s) =>
      s.criterionId === criterionId ? { ...s, score, comment } : s
    );

    const criteriaMap = new Map(
      evaluationData.financial.criteria.map((c) => [c.id, c.weight])
    );

    const updatedWithWeighted = updatedScores.map((s) => ({
      ...s,
      weightedScore: (s.score * (criteriaMap.get(s.criterionId) || 0)) / 100,
    }));

    const totalScore = updatedWithWeighted.reduce(
      (sum, s) => sum + s.weightedScore,
      0
    );

    set({
      evaluationData: {
        ...evaluationData,
        financial: {
          ...evaluationData.financial,
          scores: updatedWithWeighted,
          totalScore,
        },
      },
    });
  },

  calculateSummary: () => {
    const { evaluationData } = get();
    if (!evaluationData) return;

    const { technicalWeight, financialWeight } = evaluationData.summary;
    const technicalScore = evaluationData.technical.totalScore;
    const financialScore = evaluationData.financial.totalScore;

    const weightedTechnicalScore = technicalScore * technicalWeight;
    const weightedFinancialScore = financialScore * financialWeight;
    const finalCompositeScore = weightedTechnicalScore + weightedFinancialScore;

    set({
      evaluationData: {
        ...evaluationData,
        summary: {
          technicalScore,
          financialScore,
          technicalWeight,
          financialWeight,
          weightedTechnicalScore,
          weightedFinancialScore,
          finalCompositeScore,
        },
      },
    });
  },

  saveDraft: async () => {
    console.log('Saving draft...');
    // TODO: Implement API call later
  },

  submitEvaluation: async () => {
    console.log('Submitting evaluation...');
    // TODO: Implement API call later
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));