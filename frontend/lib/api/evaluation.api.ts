// ─── Evaluation API Layer ───────────────────────────────────
// Raw API calls only — no Zustand, no UI.
import type {
  EvaluationScore,
  EvaluationCriteria,
} from "@/lib/types/evaluation.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetchScores(
  tenderId: string,
  token?: string
): Promise<EvaluationScore[]> {
  const res = await fetch(`${BASE}/tenders/${tenderId}/scores`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}

export async function apiFetchCriteria(
  tenderId: string,
  token?: string
): Promise<EvaluationCriteria[]> {
  const res = await fetch(`${BASE}/tenders/${tenderId}/criteria`, {
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
    `${BASE}/tenders/${score.tenderId}/scores`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(score),
    }
  );
  if (!res.ok) throw new Error("Failed to submit score");
  return res.json();
}
