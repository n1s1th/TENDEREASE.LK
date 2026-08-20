import { useAuthStore } from "@/store";

const BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL 
  ? `${process.env.NEXT_PUBLIC_USER_API_URL}/v1/vendors` 
  : "http://localhost:8081/api/v1/vendors";

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

// Helper function to handle API responses
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

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {};
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : {};
  }

  return response.json();
}

// 🔥 GET ALL VENDORS (Paginated & Filtered)
export async function getVendors(page = 0, size = 10, status?: string) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (status && status !== "ALL") {
      params.append("status", status);
    }

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
}

// 🔥 GET VENDOR BY ID
export async function getVendorById(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`Error fetching vendor with ID ${id}:`, error);
    throw error;
  }
}
