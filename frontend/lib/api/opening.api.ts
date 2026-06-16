import { OpeningSession, OpeningAttendance, OpeningAttendanceRequest, ApiResponse } from "@/lib/types/opening.types";

const BASE = "http://localhost:8095";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchOpeningSession(tenderId: string, token?: string): Promise<ApiResponse<OpeningSession>> {
  const res = await fetch(`${BASE}/api/v1/opening/tender/${tenderId}`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch opening session");
  return res.json();
}

export async function fetchAttendance(sessionId: string, token?: string): Promise<ApiResponse<OpeningAttendance[]>> {
  const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/attendance`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

export async function markAttendance(sessionId: string, request: OpeningAttendanceRequest, token?: string): Promise<ApiResponse<OpeningAttendance>> {
  const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error("Failed to mark attendance");
  return res.json();
}

export async function startOpeningSession(sessionId: string, token?: string): Promise<ApiResponse<OpeningSession>> {
  const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/open`, {
    method: "POST",
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to start opening session");
  return res.json();
}
