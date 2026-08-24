// ─── Officer Dashboard API Layer ─────────────────────────────
import axios from 'axios';
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
  ClarificationItem,
} from '@/lib/types/officer-dashboard.types';

import { useAuthStore } from '@/store/auth/auth.store';

const withAuth = (config: any) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Main API -> matches tender-service / evaluation-service / etc under /api/v1
const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082') + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
api.interceptors.request.use(withAuth);

// User API -> matches user-service under /api
const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
userApi.interceptors.request.use(withAuth);

// Officer Dashboard API -> matches OfficerDashboardController under /api/officer/dashboard
const officerDashApi = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_USER_API_URL ? process.env.NEXT_PUBLIC_USER_API_URL.replace('/api', '') : 'http://localhost:8082') + '/api/officer/dashboard',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
officerDashApi.interceptors.request.use(withAuth);

// Evaluation API -> matches recommendation/evaluations under /api/v1
const evalApi = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://localhost:8084') + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
evalApi.interceptors.request.use(withAuth);

// Workflow API (Audit logs) -> matches workflow-service
const workflowApi = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086') + '/api/cao',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
workflowApi.interceptors.request.use(withAuth);


// ── Tenders ──────────────────────────────────────────────────
export async function fetchDashboardTenders(
  tab: TenderTab,
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: DashboardTender[]; pagination: PaginationState }> {
  const res = await officerDashApi.get('/tenders', {
    params: { keyword: department, status: tab === 'all' ? '' : tab.toUpperCase(), page: page - 1, size: pageSize },
  });
  return {
    data: res.data?.data?.content || [],
    pagination: {
      currentPage: (res.data?.data?.number || 0) + 1,
      totalPages: res.data?.data?.totalPages || 1,
      totalItems: res.data?.data?.totalElements || 0,
      pageSize,
    }
  };
}

export async function fetchTenderDetails(id: string): Promise<DashboardTender> {
  const res = await api.get(`/tenders/${id}`);
  return res.data;
}

export async function approveTender(id: string): Promise<void> {
  await officerDashApi.post(`/tenders/${id}/approve`);
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await officerDashApi.post(`/tenders/${id}/reject`, { reason });
}

// ── Officers ─────────────────────────────────────────────────
export async function fetchOfficers(
  department?: string,
  search?: string,
): Promise<Officer[]> {
  const res = await userApi.get('/officers', {
    params: { department, search },
  });
  return res.data?.data?.content || res.data?.content || res.data || [];
}

export async function assignOfficers(
  tenderId: string,
  assignments: { officerId: string; role: string }[],
): Promise<void> {
  await officerDashApi.post(`/tenders/${tenderId}/assign`, { assignments });
}

// ── Audit Logs ───────────────────────────────────────────────
export async function fetchAuditLogs(
  tenderId?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: AuditLogEntry[]; pagination: PaginationState }> {
  const res = await workflowApi.get('/audit-logs', {
    params: { tenderId, page: page - 1, size: pageSize },
  });
  return {
    data: res.data?.content || [],
    pagination: {
      currentPage: (res.data?.number || 0) + 1,
      totalPages: res.data?.totalPages || 1,
      totalItems: res.data?.totalElements || 0,
      pageSize,
    }
  };
}

// ── Recent Awards ────────────────────────────────────────────
export async function fetchRecentAwards(
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: Award[]; pagination: PaginationState }> {
  const res = await evalApi.get('/recommendations/recent-awards', {
    params: { department, page: page - 1, size: pageSize },
  });
  return {
    data: res.data?.content || [],
    pagination: {
      currentPage: (res.data?.number || 0) + 1,
      totalPages: res.data?.totalPages || 1,
      totalItems: res.data?.totalElements || 0,
      pageSize,
    }
  };
}

// ── KPIs ─────────────────────────────────────────────────────
export async function fetchKpiSummary(): Promise<KpiSummary> {
  const res = await officerDashApi.get('/metrics');
  return res.data?.data || res.data;
}

export async function fetchKpiReport(params: {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}): Promise<KpiReportData> {
  const res = await workflowApi.get('/kpi/report', { params });
  return res.data;
}

// ── Registration ─────────────────────────────────────────────
export async function fetchRegistrations(
  department?: string,
  search?: string,
): Promise<RegistrationRequest[]> {
  const res = await userApi.get('/v1/vendors', {
    params: { department, search },
  });
  return res.data?.content || res.data || [];
}

export async function acceptRegistration(id: string): Promise<void> {
  await userApi.post(`/v1/vendors/${id}/approve`);
}

export async function deleteRegistration(id: string): Promise<void> {
  await userApi.post(`/v1/vendors/${id}/reject`);
}

// ── Clarifications ───────────────────────────────────────────
export async function fetchAllClarifications(): Promise<ClarificationItem[]> {
  const res = await officerDashApi.get('/clarifications');
  return res.data;
}

export async function fetchClarifications(tenderId: string): Promise<ClarificationItem[]> {
  const res = await officerDashApi.get(`/clarifications/${tenderId}`);
  return res.data;
}

export async function answerClarification(
  tenderId: string,
  clarificationId: number,
  answer: string,
): Promise<ClarificationItem> {
  const res = await officerDashApi.post(`/clarifications/${tenderId}/${clarificationId}/answer`, { answer });
  return res.data;
}

// ── Notifications ────────────────────────────────────────────
export async function fetchDashboardNotifications(
  search?: string,
  type?: string,
  status?: string,
): Promise<DashboardNotification[]> {
  const readNotifications = getReadNotifications();
  const clarifications = await fetchAllClarifications();
  const notifications = (clarifications || [])
    .filter((c) => !c.answer)
    .map((c) => ({
      id: `clarification-${c.tenderId}-${c.id}`,
      tenderId: c.tenderId,
      title: 'Clarification Request',
      message: `New question for ${c.tenderTitle || c.tenderNumber || 'a tender'}.`,
      type: 'clarification_received' as const,
      status: 'pending' as const,
      recipients: c.bidderEmail,
      time: c.askedAt,
      performedBy: c.bidderEmail || 'Vendor',
      isRead: readNotifications.has(`clarification-${c.tenderId}-${c.id}`),
      actionUrl: `/officer-dashboard/clarifications/${c.tenderId}/${c.id}`,
    }))
    .filter((n) => {
      if (type && type !== 'all' && n.type !== type) return false;
      if (status && status !== 'all' && n.status !== status) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    });

  return notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const notifications = await fetchDashboardNotifications();
  return {
    unread: notifications.filter((n) => !n.isRead).length,
    failedDeliveries: 0,
    awardLettersGenerated: 0,
    date: new Date().toLocaleDateString(),
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  const readNotifications = getReadNotifications();
  readNotifications.add(id);
  saveReadNotifications(readNotifications);
}

export async function markAllNotificationsRead(): Promise<void> {
  const notifications = await fetchDashboardNotifications();
  const readNotifications = getReadNotifications();
  notifications.forEach((n) => readNotifications.add(n.id));
  saveReadNotifications(readNotifications);
}

export async function resendFailedNotification(id: string): Promise<void> {
}

function getReadNotifications(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem('officerReadNotifications');
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadNotifications(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('officerReadNotifications', JSON.stringify(Array.from(ids)));
}
