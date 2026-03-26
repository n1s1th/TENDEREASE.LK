// ─── Tender API Layer ───────────────────────────────────────
// Raw API calls only — no Zustand, no UI.
import type { Tender, TenderFilter } from "@/lib/types/tender.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(filters: TenderFilter): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.minValue !== undefined) params.set("minValue", String(filters.minValue));
  if (filters.maxValue !== undefined) params.set("maxValue", String(filters.maxValue));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetchTenders(
  filters: TenderFilter = {},
  token?: string
): Promise<Tender[]> {
  const res = await fetch(`${BASE}/tenders${buildQuery(filters)}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to fetch tenders");
  return res.json();
}

export async function apiGetTender(id: string, token?: string): Promise<Tender> {
  const res = await fetch(`${BASE}/tenders/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch tender");
  return res.json();
}

export async function apiCreateTender(
  tender: Omit<Tender, "id" | "publishedAt">,
  token?: string
): Promise<Tender> {
  const res = await fetch(`${BASE}/tenders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(tender),
  });
  if (!res.ok) throw new Error("Failed to create tender");
  return res.json();
}
