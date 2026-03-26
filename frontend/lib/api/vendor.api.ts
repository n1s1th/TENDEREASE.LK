// ─── Vendor API Layer ───────────────────────────────────────
// Raw API calls only — no Zustand, no UI.
import type { Vendor, KycStatus } from "@/lib/types/vendor.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetchVendors(token?: string): Promise<Vendor[]> {
  const res = await fetch(`${BASE}/vendors`, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to fetch vendors");
  return res.json();
}

export async function apiGetVendor(id: string, token?: string): Promise<Vendor> {
  const res = await fetch(`${BASE}/vendors/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch vendor");
  return res.json();
}

export async function apiCreateVendor(
  vendor: Omit<Vendor, "id" | "createdAt">,
  token?: string
): Promise<Vendor> {
  const res = await fetch(`${BASE}/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(vendor),
  });
  if (!res.ok) throw new Error("Failed to create vendor");
  return res.json();
}

export async function apiUpdateKycStatus(
  vendorId: string,
  status: KycStatus,
  token?: string
): Promise<void> {
  const res = await fetch(`${BASE}/vendors/${vendorId}/kyc`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update KYC status");
}
