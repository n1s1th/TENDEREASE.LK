import { OpeningSession, OpeningAttendance, OpeningAttendanceRequest, ApiResponse } from "@/lib/types/opening.types";

const BASE = process.env.NEXT_PUBLIC_OPENING_SERVICE_URL || "http://localhost:8084";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchOpeningSession(tenderId: string, token?: string): Promise<ApiResponse<OpeningSession>> {
  try {
    const res = await fetch(`${BASE}/api/v1/opening/tender/${tenderId}`, {
      headers: { ...authHeaders(token) }
    });
    if (!res.ok) {
      return { success: false, message: "Failed to fetch opening session", data: null as any };
    }
    const json = await res.json();
    return { success: true, message: json.message || "Success", data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error", data: null as any };
  }
}

export async function fetchAttendance(sessionId: string, token?: string): Promise<ApiResponse<OpeningAttendance[]>> {
  try {
    const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/attendance`, {
      headers: { ...authHeaders(token) }
    });
    if (!res.ok) {
      return { success: false, message: "Failed to fetch attendance", data: [] };
    }
    const json = await res.json();
    return { success: true, message: json.message || "Success", data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error", data: [] };
  }
}

export async function markAttendance(sessionId: string, request: OpeningAttendanceRequest, token?: string): Promise<ApiResponse<OpeningAttendance>> {
  try {
    const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      return { success: false, message: "Failed to mark attendance", data: null as any };
    }
    const json = await res.json();
    return { success: true, message: json.message || "Success", data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error", data: null as any };
  }
}

export async function startOpeningSession(sessionId: string, officerName: string, token?: string): Promise<ApiResponse<OpeningSession>> {
  try {
    const res = await fetch(`${BASE}/api/v1/opening/session/${sessionId}/open?officerName=${encodeURIComponent(officerName)}`, {
      method: "POST",
      headers: { ...authHeaders(token) }
    });
    if (!res.ok) {
      return { success: false, message: "Failed to start opening session", data: null as any };
    }
    const json = await res.json();
    return { success: true, message: json.message || "Success", data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error", data: null as any };
  }
}

export async function deleteAttendanceRecord(attendanceId: string, token?: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${BASE}/api/v1/opening/attendance/${attendanceId}`, {
      method: "DELETE",
      headers: { ...authHeaders(token) }
    });
    if (!res.ok) {
      return { success: false, message: "Failed to delete attendance", data: undefined };
    }
    const json = await res.json();
    return { success: true, message: json.message || "Success", data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error", data: undefined };
  }
}
