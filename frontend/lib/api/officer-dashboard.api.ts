// ─── Officer Dashboard API Layer (Using Fetch) ─────────────────────────────
import type {
  DashboardTender,
  AuditLogEntry,
  Award,
  DashboardNotification,
  NotificationSummary,
  KpiSummary,
  KpiReportData,
  RegistrationRequest,
  Officer,
  TenderTab,
  PaginationState,
} from '@/lib/types/officer-dashboard.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const NOTIFICATION_BASE_URL = process.env.NEXT_PUBLIC_OFFICER_DASHBOARD_API_URL || 'http://localhost:8193/api';
const TENDER_SERVICE_URL = 'http://localhost:8182/api/tenders';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || localStorage.getItem('sub');
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...(userEmail ? { 'X-User-Email': userEmail } : {}),
  };
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// ── Tenders ──────────────────────────────────────────────────
export async function fetchDashboardTenders(
  tab: TenderTab,
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: DashboardTender[]; pagination: PaginationState }> {
  const params = new URLSearchParams({
    tab,
    page: String(page),
    pageSize: String(pageSize),
  });
  if (department) params.append('department', department);

  return request(`${BASE_URL}/officer/tenders?${params.toString()}`);
}

export async function fetchTenderDetails(id: string): Promise<DashboardTender> {
  return request(`${BASE_URL}/officer/tenders/${id}`);
}

export async function approveTender(id: string): Promise<void> {
  await fetch(`${BASE_URL}/officer/tenders/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await fetch(`${BASE_URL}/officer/tenders/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
}

// ── Officers ─────────────────────────────────────────────────
export async function fetchOfficers(
  department?: string,
  search?: string,
): Promise<Officer[]> {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (search) params.append('search', search);

  return request(`${BASE_URL}/officer/officers?${params.toString()}`);
}

export async function assignOfficers(
  tenderId: string,
  assignments: { officerId: string; role: string }[],
): Promise<void> {
  await fetch(`${BASE_URL}/officer/tenders/${tenderId}/assign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ assignments }),
  });
}

// ── Audit Logs ───────────────────────────────────────────────
export async function fetchAuditLogs(
  tenderId?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: AuditLogEntry[]; pagination: PaginationState }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (tenderId) params.append('tenderId', tenderId);

  return request(`${BASE_URL}/officer/audit-logs?${params.toString()}`);
}

// ── Recent Awards ────────────────────────────────────────────
export async function fetchRecentAwards(
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: Award[]; pagination: PaginationState }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (department) params.append('department', department);

  return request(`${BASE_URL}/officer/awards?${params.toString()}`);
}

// ── Notifications ────────────────────────────────────────────
export async function fetchDashboardNotifications(
  search?: string,
  type?: string,
  status?: string,
): Promise<DashboardNotification[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);

  const res = await request<any>(`${NOTIFICATION_BASE_URL}/officer/notifications?${params.toString()}`);
  // Backend returns { value: [...] } wrapper
  const items: any[] = Array.isArray(res) ? res : (res?.value ?? []);
  return items.map((item) => ({
    ...item,
    isRead: item.isRead ?? item.read ?? false,
  }));
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  return request(`${NOTIFICATION_BASE_URL}/officer/notifications/summary`);
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${NOTIFICATION_BASE_URL}/officer/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${NOTIFICATION_BASE_URL}/officer/notifications/read-all`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function resendFailedNotification(id: string): Promise<void> {
  await fetch(`${BASE_URL}/officer/notifications/${id}/resend`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

// ── KPIs ─────────────────────────────────────────────────────
export async function fetchKpiSummary(): Promise<KpiSummary> {
  return request(`${BASE_URL}/officer/kpi/summary`);
}

export async function fetchKpiReport(params: {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}): Promise<KpiReportData> {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.department) queryParams.append('department', params.department);
  if (params.category) queryParams.append('category', params.category);

  return request(`${BASE_URL}/officer/kpi/report?${queryParams.toString()}`);
}

// ── Registration ─────────────────────────────────────────────
export async function fetchRegistrations(
  department?: string,
  search?: string,
): Promise<RegistrationRequest[]> {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (search) params.append('search', search);

  return request(`${BASE_URL}/officer/registrations?${params.toString()}`);
}

export async function acceptRegistration(id: string): Promise<void> {
  await fetch(`${BASE_URL}/officer/registrations/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function deleteRegistration(id: string): Promise<void> {
  await fetch(`${BASE_URL}/officer/registrations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Clarifications ───────────────────────────────────────────
import type { ClarificationItem } from '@/lib/types/officer-dashboard.types';

export async function fetchClarifications(
  tenderId: string,
): Promise<ClarificationItem[]> {
  const res = await request<any>(`${TENDER_SERVICE_URL}/${tenderId}/clarifications`);
  // Backend returns { value: [...] } wrapper
  return Array.isArray(res) ? res : (res?.value ?? []);
}

export async function fetchAllClarifications(): Promise<ClarificationItem[]> {
  const res = await request<any>(`${TENDER_SERVICE_URL}/officer/clarifications`);
  return Array.isArray(res) ? res : (res?.value ?? []);
}

export async function answerClarification(
  tenderId: string,
  clarificationId: number,
  response: string,
): Promise<ClarificationItem> {
  return request(`${TENDER_SERVICE_URL}/${tenderId}/clarifications/${clarificationId}/response`, {
    method: 'POST',
    body: JSON.stringify({ response }),
  });
}
