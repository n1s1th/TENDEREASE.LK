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
  fetchTenderEvaluations,
  toggleFlag as toggleFlagApi,
  updateComplianceStatus as updateComplianceStatusApi
} from "@/lib/api/evaluation.api";
import {
  getDashboardMetrics,
  getAssignedTenders
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

      fetchAssignedTenders: async () => {
        set({ isLoading: true });
        try {
          const res = await getAssignedTenders();
          set({ assignedTenders: res.data.content as any[], isLoading: false });
        } catch (err: any) {
          set({ 
            isLoading: false, 
            assignedTenders: [] 
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
      },

      fetchEvaluationsByTender: async (tenderId: string) => {
        set({ isLoading: true }, false, "evaluation/fetchEvaluationsByTender/pending");
        try {
          const res = await fetchTenderEvaluations(tenderId);
          set({ isLoading: false }, false, "evaluation/fetchEvaluationsByTender/fulfilled");
          return res.data;
        } catch (err) {
          set({ isLoading: false }, false, "evaluation/fetchEvaluationsByTender/rejected");
          throw err;
        }
      },

      toggleFlag: async (evaluationId: string) => {
        set({ isLoading: true }, false, "evaluation/toggleFlag/pending");
        try {
          await toggleFlagApi(evaluationId);
          set({ isLoading: false }, false, "evaluation/toggleFlag/fulfilled");
        } catch (err) {
          set({ isLoading: false }, false, "evaluation/toggleFlag/rejected");
          throw err;
        }
      },

      updateComplianceStatus: async (evaluationId: string, status: string) => {
        set({ isLoading: true }, false, "evaluation/updateComplianceStatus/pending");
        try {
          await updateComplianceStatusApi(evaluationId, status);
          set({ isLoading: false }, false, "evaluation/updateComplianceStatus/fulfilled");
        } catch (err) {
          set({ isLoading: false }, false, "evaluation/updateComplianceStatus/rejected");
          throw err;
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

