// types/evaluation.types.ts

export interface Tender {
  id: string;
  title: string;
  category: string;
  department: string;
  division: string;
}

export interface Bidder {
  id: string;
  name: string;
  bidReference: string;
  status: 'submitted' | 'in_progress' | 'not_started';
  submissionTime: string;
}

export interface BidDocument {
  name: string;
  type: 'pdf' | 'doc' | 'xlsx';
  url: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore?: number;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  comment: string;
  weightedScore: number;
}

export interface TechnicalEvaluation {
  criteria: EvaluationCriterion[];
  scores: CriterionScore[];
  totalScore: number;
  maxScore: number;
  threshold: number;
  passed: boolean;
}

export interface FinancialCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore?: number;
}

export interface FinancialEvaluation {
  criteria: FinancialCriterion[];
  scores: CriterionScore[];
  totalScore: number;
  maxScore: number;
}

export interface EvaluationSummary {
  technicalScore: number;
  financialScore: number;
  technicalWeight: number;
  financialWeight: number;
  weightedTechnicalScore: number;
  weightedFinancialScore: number;
  finalCompositeScore: number;
}

export interface Evaluator {
  id: string;
  name: string;
  role: 'chair' | 'member' | 'secretariat' | 'observer';
  designation: string;
}

export interface EvaluationInfo {
  evaluator: Evaluator;
  bidder: Bidder;
  status: 'draft' | 'in_progress' | 'submitted';
  lastSaved: string;
}

export interface EvaluationData {
  tender: Tender;
  bidder: Bidder;
  documents: BidDocument[];
  technical: TechnicalEvaluation;
  financial: FinancialEvaluation;
  summary: EvaluationSummary;
  info: EvaluationInfo;
}