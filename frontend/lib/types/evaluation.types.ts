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

// Backend Entity mapped types
export interface EvaluationResponse {
  id: string;
  tenderId: string;
  bidId: string;
  evaluatorId: string;
  status: string;
  isFlagged: boolean;
  complianceStatus: string;
  totalScore: number;
  remarks: string;
  evaluatedAt: string;
}

export interface EvaluationResultResponse {
  id: string;
  tenderId: string;
  winningBidId: string;
  finalScore: number;
  approvedAt: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AssignedTender {
  id: string;
  reference: string;
  title: string;
  status: "Open" | "Awarded" | "PENDING_OPENING" | string;
  openingDate: string;
  method: string;
  role: string;
  bidsCount: number;
}

export interface EvaluationState {
  scores: EvaluationScore[];
  criteria: EvaluationCriteria[];
  committeeInputs: EvaluationScore | null;
  isLoading: boolean;
  
  // Dashboard state
  assignedTenders: AssignedTender[];
  assignedTendersTotalPages: number;
  assignedTendersTotalElements: number;
  activeTendersCount: number;
  totalBidsCount: number;
  underEvaluationCount: number;
  awardedProposalsCount: number;
  noBidTendersCount: number;

  // Actions
  fetchScores: (tenderId: string) => Promise<void>;
  fetchCriteria: (tenderId: string) => Promise<void>;
  submitScore: (score: EvaluationScore) => Promise<void>;
  setCommitteeInputs: (input: Partial<EvaluationScore>) => void;
  resetScores: () => void;
  
  fetchAssignedTenders: (keyword?: string, status?: string, page?: number, size?: number) => Promise<void>;
  fetchDashboardMetrics: () => Promise<void>;
  
  // Vetting actions
  fetchEvaluationsByTender: (tenderId: string) => Promise<EvaluationResponse[]>;
  toggleFlag: (evaluationId: string) => Promise<void>;
  updateComplianceStatus: (evaluationId: string, status: string) => Promise<void>;
}
