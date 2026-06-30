// ─── Evaluation API Layer ───────────────────────────────────
import type {
  EvaluationScore,
  EvaluationCriteria,
  ApiResponse,
  EvaluationResponse,
  EvaluationResultResponse
} from "@/lib/types/evaluation.types";

// Using the gateway if present, otherwise default to 8084 for local testing
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Legacy Methods ──
export async function apiFetchScores(
  tenderId: string,
  token?: string
): Promise<EvaluationScore[]> {
  const res = await fetch(`${BASE}/api/tenders/${tenderId}/scores`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}

export async function apiFetchCriteria(
  tenderId: string,
  token?: string
): Promise<EvaluationCriteria[]> {
  const res = await fetch(`${BASE}/api/tenders/${tenderId}/criteria`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch evaluation criteria");
  return res.json();
}

export async function apiSubmitScore(
  score: EvaluationScore,
  token?: string
): Promise<EvaluationScore> {
  const res = await fetch(
    `${BASE}/api/tenders/${score.tenderId}/scores`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(score),
    }
  );
  if (!res.ok) throw new Error("Failed to submit score");
  return res.json();
}

// ── New Backend Integration Methods ──
export async function fetchMyEvaluations(token?: string): Promise<ApiResponse<EvaluationResponse[]>> {
  const res = await fetch(`${BASE}/api/evaluations/my`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch my evaluations");
  return res.json();
}

export async function fetchTenderEvaluations(tenderId: string, token?: string): Promise<ApiResponse<EvaluationResponse[]>> {
  const res = await fetch(`${BASE}/api/evaluations/admin/tender/${tenderId}`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch tender evaluations");
  return res.json();
}

export async function fetchEvaluationResults(tenderId: string, token?: string): Promise<ApiResponse<EvaluationResultResponse>> {
  const res = await fetch(`${BASE}/api/evaluations/admin/results/${tenderId}`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch evaluation results");
  return res.json();
}
export async function getDashboardMetrics(token?: string): Promise<{ active: number; bids: number; evaluating: number; awarded: number; noBids: number }> {
  const res = await fetch(`${BASE}/api/evaluations/metrics`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  const json = await res.json();
  return json.data;
}

export async function toggleFlag(evaluationId: string, token?: string): Promise<any> {
  const res = await fetch(`${BASE}/api/evaluations/admin/${evaluationId}/flag`, {
    method: "POST",
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error("Failed to toggle flag");
  return res.json();
}

export async function updateComplianceStatus(evaluationId: string, status: string, token?: string): Promise<any> {
  const res = await fetch(`${BASE}/api/evaluations/admin/${evaluationId}/compliance?status=${status}`, {
    method: "PUT",
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error("Failed to update compliance status");
  return res.json();
}

export async function fetchDashboardMetrics(token?: string): Promise<ApiResponse<any>> {
  const res = await fetch(`${BASE}/api/evaluations/admin/metrics`, {
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  return res.json();
}

export interface EvaluationStatusCounts {
  technicalPassed: number;
  financialPassed: number;
  financialFailed: number;
  evaluationFailed: number;
  notReviewed: number;
}

export async function fetchEvaluationStatusCounts(token?: string): Promise<EvaluationStatusCounts> {
  const res = await fetch(`${BASE}/api/evaluations/mock/dashboard/status-counts`, {
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error("Failed to fetch evaluation status counts");
  const json = await res.json();
  return json.data;
}
