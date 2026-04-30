const QA_API_BASE = "/api/qa";

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
  });

  return handleQaResponse<QaPage>(response);
}

export async function createQaQuestion(questionText: string, category: QaCategory) {
  const response = await fetch(`${QA_API_BASE}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": "vendor-123",
      "X-Roles": "ROLE_USER",
    },
    body: JSON.stringify({ questionText, category }),
  });

  return handleQaResponse<QaQuestion>(response);
}
