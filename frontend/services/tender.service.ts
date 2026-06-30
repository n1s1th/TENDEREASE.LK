import { useAuthStore } from "@/store";

const BASE_URL = "http://localhost:8082/api/tenders";

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

//  Common fetch wrapper with timeout
async function apiFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      signal: controller.signal,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    return handleResponse(res);
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after 5 seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
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

// 🔥 GET ALL TENDERS
export async function getTenders(page = 0, size = 10, filters: any = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.status && filters.status !== "All Statuses")
      params.append("status", filters.status);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);

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
  return apiFetch(`${BASE_URL}/${tenderId}/clarifications/${clarificationId}/response`, {
    method: "POST",
    body: JSON.stringify({ response, respondedBy }),
  });
}

// 🔥 TIMELINE
export async function getTimeline(id: string) {
  return apiFetch(`${BASE_URL}/${id}/timeline`);
}

// 🔥 CONTACT
export async function getContact(id: string) {
  return apiFetch(`${BASE_URL}/${id}/contact`);
}
