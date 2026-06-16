// ─── Evaluation Store ───────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  EvaluationState,
  EvaluationScore,
  AssignedTender
} from "@/lib/types/evaluation.types";
import {
  apiFetchScores,
  apiFetchCriteria,
  apiSubmitScore,
} from "@/lib/api/evaluation.api";
import {
  getDashboardMetrics,
  getAssignedTenders,
} from "@/lib/api/officer.api";



export const useEvaluationStore = create<EvaluationState>()(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────
      scores: [],
      criteria: [],
      committeeInputs: null,
      isLoading: false,
      
      assignedTenders: [],
      assignedTendersTotalPages: 0,
      assignedTendersTotalElements: 0,
      activeTendersCount: 0,
      totalBidsCount: 0,
      underEvaluationCount: 0,
      awardedProposalsCount: 0,
      noBidTendersCount: 0,

      // ── Actions ────────────────────────────────
      fetchScores: async (tenderId: string) => {
        set({ isLoading: true }, false, "evaluation/fetchScores/pending");
        try {
          const scores = await apiFetchScores(tenderId);
          set({ scores, isLoading: false }, false, "evaluation/fetchScores/fulfilled");
        } catch {
          set({ isLoading: false }, false, "evaluation/fetchScores/rejected");
        }
      },

      fetchCriteria: async (tenderId: string) => {
        set({ isLoading: true }, false, "evaluation/fetchCriteria/pending");
        try {
          const criteria = await apiFetchCriteria(tenderId);
          set({ criteria, isLoading: false }, false, "evaluation/fetchCriteria/fulfilled");
        } catch {
          set({ isLoading: false }, false, "evaluation/fetchCriteria/rejected");
        }
      },

      submitScore: async (score: EvaluationScore) => {
        set({ isLoading: true }, false, "evaluation/submitScore/pending");
        try {
          const saved = await apiSubmitScore(score);
          set(
            (state) => ({
              scores: [...state.scores.filter((s) => s.vendorId !== score.vendorId), saved],
              committeeInputs: null,
              isLoading: false,
            }),
            false,
            "evaluation/submitScore/fulfilled"
          );
        } catch {
          set({ isLoading: false }, false, "evaluation/submitScore/rejected");
        }
      },

      setCommitteeInputs: (partial) =>
        set(
          (state) => ({
            committeeInputs: { ...(state.committeeInputs ?? {} as EvaluationScore), ...partial },
          }),
          false,
          "evaluation/setCommitteeInputs"
        ),

      resetScores: () =>
        set(
          { scores: [], committeeInputs: null },
          false,
          "evaluation/resetScores"
        ),

      fetchAssignedTenders: async (keyword: string = "", status: string = "ALL", page: number = 0, size: number = 8) => {
        set({ isLoading: true });
        try {
          const res = await getAssignedTenders(keyword, status, page, size);
          set({ 
            assignedTenders: res.data.content as unknown as AssignedTender[], 
            assignedTendersTotalPages: res.data.totalPages,
            assignedTendersTotalElements: res.data.totalElements,
            isLoading: false 
          });
        } catch (err: any) {
          console.error("Failed to fetch assigned tenders", err);
          set({ 
            isLoading: false, 
            assignedTenders: [],
            assignedTendersTotalPages: 0,
            assignedTendersTotalElements: 0
          });
        }
      },

      fetchDashboardMetrics: async () => {
        try {
          const metrics = await getDashboardMetrics();
          set({
            activeTendersCount: metrics.active,
            totalBidsCount: metrics.bids,
            underEvaluationCount: metrics.evaluating,
            awardedProposalsCount: metrics.awarded,
            noBidTendersCount: metrics.noBids
          });
        } catch (err) {
          console.error("Failed to fetch dashboard metrics", err);
          set({
            activeTendersCount: 0,
            totalBidsCount: 0,
            underEvaluationCount: 0,
            awardedProposalsCount: 0,
            noBidTendersCount: 0
          });
        }
      }
    }),
    { name: "EvaluationStore" }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const selectScores = (s: EvaluationState) => s.scores;
export const selectCriteria = (s: EvaluationState) => s.criteria;
export const selectCommitteeInputs = (s: EvaluationState) => s.committeeInputs;
export const selectEvaluationLoading = (s: EvaluationState) => s.isLoading;
export const selectAssignedTenders = (s: EvaluationState) => s.assignedTenders;
export const selectMetrics = (s: EvaluationState) => ({
  active: s.activeTendersCount,
  bids: s.totalBidsCount,
  evaluating: s.underEvaluationCount,
  awarded: s.awardedProposalsCount,
  noBids: s.noBidTendersCount
});
