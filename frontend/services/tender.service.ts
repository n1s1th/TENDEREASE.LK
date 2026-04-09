const BASE_URL = "http://localhost:8082/api/tenders";

// 🔐 Get Authorization headers
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ No token found in localStorage");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// 🔥 Helper function to handle responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `API error: ${response.status} ${response.statusText} ${text}`
    );
  }

  // Handle empty successful responses (e.g. 200 OK with no body or 204 No Content)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {};
  }

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : {};
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Failed to parse JSON response");
  }
}

// 🔥 Common fetch wrapper (avoids repetition)
async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return handleResponse(res);
}

// 🔥 GET SINGLE TENDER
export async function getTenderById(id: string) {
  try {
    const res = await apiFetch(`${BASE_URL}/${id}`);

    console.log("RAW RESPONSE:", res);

    // ✅ FIX HERE
    return res.data ? res.data : res;

  } catch (error) {
    console.error("❌ Error fetching tender:", error);
    throw error;
  }
}

// 🔥 GET ALL TENDERS (MAIN LIST)
export async function getTenders(page = 0, size = 10, filters: any = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.status && filters.status !== "All Statuses") params.append("status", filters.status);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);

    return await apiFetch(`${BASE_URL}?${params.toString()}`);
  } catch (error) {
    console.error("❌ Error fetching tenders:", error);
    throw error;
  }
}

// 🔥 DOCUMENTS
export async function getDocuments(id: string) {
  try {
    return await apiFetch(`${BASE_URL}/${id}/documents`);
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    throw error;
  }
}

// 🔥 ADDENDA
export async function getAddenda(id: string) {
  try {
    return await apiFetch(`${BASE_URL}/${id}/addenda`);
  } catch (error) {
    console.error("❌ Error fetching addenda:", error);
    throw error;
  }
}

// 🔥 CLARIFICATIONS
export async function getClarifications(id: string) {
  try {
    return await apiFetch(`${BASE_URL}/${id}/clarifications`);
  } catch (error) {
    console.error("❌ Error fetching clarifications:", error);
    throw error;
  }
}

export async function submitClarification(tenderId: string, question: string) {
  try {
    return await apiFetch(`${BASE_URL}/${tenderId}/clarifications`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  } catch (error) {
    console.error("❌ Error submitting clarification:", error);
    throw error;
  }
}

// 🔥 TIMELINE
export async function getTimeline(id: string) {
  try {
    return await apiFetch(`${BASE_URL}/${id}/timeline`);
  } catch (error) {
    console.error("❌ Error fetching timeline:", error);
    throw error;
  }
}

// 🔥 CONTACT
export async function getContact(id: string) {
  try {
    return await apiFetch(`${BASE_URL}/${id}/contact`);
  } catch (error) {
    console.error("❌ Error fetching contact:", error);
    throw error;
  }
}