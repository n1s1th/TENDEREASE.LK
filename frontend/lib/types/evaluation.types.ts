// ─── Evaluation Types ───────────────────────────────────────
export interface EvaluationCriteria {
  id: string;
  label: string;
  weight: number; // 0–100
}

export interface EvaluationScore {
  vendorId: string;
  tenderId: string;
  committeeId: string;
  scores: Record<string, number>; // criteriaId → score
  totalScore?: number;
  submittedAt?: string;
}

export interface EvaluationState {
  scores: EvaluationScore[];
  criteria: EvaluationCriteria[];
  committeeInputs: EvaluationScore | null;
  isLoading: boolean;

  // Actions
  fetchScores: (tenderId: string) => Promise<void>;
  fetchCriteria: (tenderId: string) => Promise<void>;
  submitScore: (score: EvaluationScore) => Promise<void>;
  setCommitteeInputs: (input: Partial<EvaluationScore>) => void;
  resetScores: () => void;
}
