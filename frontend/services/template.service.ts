import { useAuthStore } from "@/store";

const API_URL = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || 'http://localhost:8082';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const { token } = useAuthStore.getState();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || res.statusText;
    } catch (e) {
      errorMessage = res.statusText;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const templateService = {
  async createTemplate(data: any) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTemplate(id: string, data: any) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async publishTemplate(id: string) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates/${id}/publish`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAllTemplates() {
    const res = await fetch(`${API_URL}/api/v1/tender-templates/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  }
};
