import { useAuthStore } from "@/store";

function resolveTenderBaseUrl(): string {
  const tenderUrl = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL;
  if (tenderUrl) {
    const clean = tenderUrl.replace(/\/+$/, "");
    if (clean.endsWith("/api/tenders") || clean.endsWith("/tenders")) {
      return clean;
    }
    return `${clean}/api/tenders`;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.tenderease.me";
  const cleanApi = apiUrl.replace(/\/+$/, "");
  if (cleanApi.endsWith("/api")) {
    return `${cleanApi}/tenders`;
  }
  return `${cleanApi}/api/tenders`;
}

const BASE_URL = resolveTenderBaseUrl();
const PUBLIC_BASE_URL = BASE_URL.replace("/v1/tenders", "/tenders");

// Get Authorization headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const { token, user } = useAuthStore.getState();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (user?.email) {
      headers["X-User-Email"] = user.email;
    }
  }

  return headers;
}

// 🔥 Auth-only headers for multipart/form-data uploads.
// Do NOT include Content-Type — the browser must set it automatically
// so it can append the correct multipart boundary string.
function getMultipartHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const { token, user } = useAuthStore.getState();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (user?.email) headers["X-User-Email"] = user.email;
  }
  return headers;
}

// 🔥 Helper function to handle responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().clearAuth();
    }
    const text = await response.text().catch(() => "");
    throw new Error(
      `API error: ${response.status} ${response.statusText} ${text}`
    );
  }

  // Handle empty responses
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return {};
  }

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : {};
  }

  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Failed to parse JSON response");
  }
}

//  Common fetch wrapper
async function apiFetch(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    return handleResponse(res);
  } catch (error: any) {
    throw error;
  }
}

// 🔥 GET SINGLE TENDER
export async function getTenderById(id: string) {
  try {
    const res = await apiFetch(`${BASE_URL}/${id}`);
    return res.data ? res.data : res;
  } catch (error) {
    console.error("❌ Error fetching tender:", error);
    throw error;
  }
}

// Map UI categories to backend ProcurementType enums
function mapCategoryToProcurementType(category: string): string | undefined {
  if (!category || category === "All Categories") return undefined;
  const cat = category.toLowerCase().trim();
  if (cat.includes("construction") || cat.includes("works")) return "WORKS";
  if (cat.includes("consulting") || cat.includes("consultancy")) return "CONSULTANCY";
  if (cat.includes("it & technology") || cat.includes("it") || cat.includes("technology") || cat.includes("services")) return "SERVICES";
  if (cat.includes("healthcare") || cat.includes("medical") || cat.includes("goods") || cat.includes("defense")) return "GOODS";
  
  const upper = category.toUpperCase().replace(/\s+/g, "_");
  const validTypes = ["GOODS", "WORKS", "SERVICES", "CONSULTANCY", "CONSULTING_SERVICES", "NON_CONSULTING_SERVICES"];
  if (validTypes.includes(upper)) {
    return upper;
  }
  return undefined;
}

// 🔥 GET ALL TENDERS
export async function getTenders(page = 0, size = 10, filters: any = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.tab) params.append("tab", filters.tab);
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.status && filters.status !== "All Statuses")
      params.append("status", filters.status);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    
    if (filters.procurementType) {
      params.append("procurementType", filters.procurementType);
    } else if (filters.category) {
      const type = mapCategoryToProcurementType(filters.category);
      if (type) params.append("procurementType", type);
    }

    return await apiFetch(`${BASE_URL}?${params.toString()}`);
  } catch (error) {
    console.error("Error fetching tenders:", error);
    throw error;
  }
}

// 🔥 DOCUMENTS
export async function getDocuments(id: string) {
  return apiFetch(`${BASE_URL}/${id}/documents`);
}

// 🔥 ADDENDA
export async function getAddenda(id: string) {
  return apiFetch(`${BASE_URL}/${id}/addenda`);
}

// 🔥 CLARIFICATIONS
export async function getClarifications(id: string) {
  return apiFetch(`${BASE_URL}/${id}/clarifications`);
}

// 🔥 SUBMIT CLARIFICATION (FINAL FIXED)
export async function submitClarification(
  tenderId: string,
  question: string
) {
  try {
    return await apiFetch(`${BASE_URL}/${tenderId}/clarifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ explicitly ensure
      },
      body: JSON.stringify({ question }),
    });
  } catch (error) {
    console.error("❌ Error submitting clarification:", error);
    throw error;
  }
}

export async function answerClarification(
  tenderId: string,
  clarificationId: number,
  response: string,
  respondedBy = 1
) {
  return apiFetch(`${PUBLIC_BASE_URL}/${tenderId}/clarifications/${clarificationId}/response`, {
    method: "POST",
    body: JSON.stringify({ response, respondedBy }),
  });
}

// 🔥 TIMELINE
export async function getTimeline(id: string) {
  return apiFetch(`${PUBLIC_BASE_URL}/${id}/timeline`);
}

export async function addTimelineEvent(
  id: string,
  eventType: string,
  description: string,
  createdBy?: string,
  creatorRole?: string
) {
  return apiFetch(`${PUBLIC_BASE_URL}/${id}/timeline`, {
    method: "POST",
    body: JSON.stringify({ eventType, description, createdBy, creatorRole }),
  });
}

// 🔥 CONTACT
export async function getContact(id: string) {
  return apiFetch(`${BASE_URL}/${id}/contact`);
}

// 🔥 UPDATE TENDER STATUS
export async function updateTenderStatus(id: string, status: string) {
  return apiFetch(`${BASE_URL}/${id}/status?status=${status}`, {
    method: "PUT",
  });
}

// 🚀 ADDENDA & VERSIONS
// Use direct fetch (not apiFetch) so Content-Type is never set —
// the browser must inject the multipart/form-data boundary automatically.
export async function createAddendum(id: string, formData: FormData) {
  const res = await fetch(`${BASE_URL}/${id}/addenda`, {
    method: "POST",
    cache: "no-store",
    headers: getMultipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function uploadAddendumVersion(id: string, addendumId: number, formData: FormData) {
  const res = await fetch(`${BASE_URL}/${id}/addenda/${addendumId}/versions`, {
    method: "POST",
    cache: "no-store",
    headers: getMultipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function getAddendumVersions(id: string, addendumId: number) {
  return apiFetch(`${BASE_URL}/${id}/addenda/${addendumId}/versions`);
}


// ─── SAVED TENDERS (BOOKMARKS) ───────────────────────────────
// These all require a signed-in user; apiFetch attaches the auth headers.

export async function getSavedTenders(page = 0, size = 50) {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  return apiFetch(`${BASE_URL}/saved?${params.toString()}`);
}

export async function getSavedTenderIds(): Promise<string[]> {
  return apiFetch(`${BASE_URL}/saved/ids`);
}

export async function saveTender(id: string) {
  return apiFetch(`${BASE_URL}/${id}/save`, { method: "POST" });
}

export async function unsaveTender(id: string) {
  return apiFetch(`${BASE_URL}/${id}/save`, { method: "DELETE" });
}
