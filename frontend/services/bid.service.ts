import { useAuthStore } from "@/store";

const rawBidUrl = process.env.NEXT_PUBLIC_BID_SERVICE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/bids` : "http://localhost:8083/api/bids");
const BASE_URL = rawBidUrl.endsWith("/api/bids") ? rawBidUrl : `${rawBidUrl.replace(/\/+$/, "")}/api/bids`;

// Get Authorization headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {};

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

// Helper to handle responses
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

  if (response.status === 204) {
    return {};
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : {};
  }

  return response.json();
}

// Submit a bid
export async function submitBid(bidData: any) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bidData),
  });
  return handleResponse(res);
}

// Upload a document
export async function uploadBidDocument(file: File) {
  const headers = getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: formData,
  });
  return handleResponse(res);
}

// Get bids by tender
export async function getBidsByTender(tenderId: string) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE_URL}/tender/${tenderId}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
  const json = await handleResponse(res);
  return json.data || json;
}

// Check if user has bid on a tender
export async function checkUserHasBid(tenderId: string) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE_URL}/tender/${tenderId}/has-bid`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
  const json = await handleResponse(res);
  return json.data === true;
}

// Get all bids
export async function getAllBids() {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
  const json = await handleResponse(res);
  return json.data || json;
}

// Evaluate bid
export async function evaluateBid(bidId: string, evaluationData: any) {
  const headers = getAuthHeaders();
  const res = await fetch(`${BASE_URL}/${bidId}/evaluation`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(evaluationData),
  });
  return handleResponse(res);
}
