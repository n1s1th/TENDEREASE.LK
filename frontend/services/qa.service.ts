import { useAuthStore } from "@/store";

// Use environment variable if available, otherwise assume gateway or direct service
const QA_API_BASE = process.env.NEXT_PUBLIC_QA_SERVICE_URL || "http://localhost:8000/api/qa";

export type QaCategory =
  | "REGISTRATION"
  | "TENDERS"
  | "SUBMISSION"
  | "PAYMENTS"
  | "DEADLINES"
  | "OTHER";

export type QaStatus = "PENDING" | "ANSWERED";

export interface QaAnswer {
  id: number;
  answeredBy: string;
  answerText: string;
  createdAt: string;
}

export interface QaQuestion {
  id: number;
  userId: string;
  questionText: string;
  category: QaCategory;
  status: QaStatus;
  createdAt: string;
  answer: QaAnswer | null;
}

export interface QaPage {
  content: QaQuestion[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

interface GetQuestionsOptions {
  page?: number;
  size?: number;
  category?: QaCategory | "ALL";
  sort?: string;
}

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

async function handleQaResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: any = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text || "Invalid response from Q&A service" };
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Q&A request failed with ${response.status}`);
  }

  return payload as T;
}

export async function getQaQuestions({
  page = 0,
  size = 5,
  category = "ALL",
  sort = "createdAt,desc",
}: GetQuestionsOptions = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  if (category !== "ALL") {
    params.set("category", category);
  }

  const response = await fetch(`${QA_API_BASE}/questions?${params.toString()}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  return handleQaResponse<QaPage>(response);
}

export async function createQaQuestion(questionText: string, category: QaCategory) {
  const response = await fetch(`${QA_API_BASE}/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ questionText, category }),
  });

  return handleQaResponse<QaQuestion>(response);
}
