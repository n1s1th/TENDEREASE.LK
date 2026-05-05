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
} from '@/lib/types/officer-dashboard.types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Tenders ──────────────────────────────────────────────────
export async function fetchDashboardTenders(
  tab: TenderTab,
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: DashboardTender[]; pagination: PaginationState }> {
  const res = await api.get('/officer/tenders', {
    params: { tab, department, page, pageSize },
  });
  return res.data;
}

export async function fetchTenderDetails(id: string): Promise<DashboardTender> {
  const res = await api.get(`/officer/tenders/${id}`);
  return res.data;
}

export async function approveTender(id: string): Promise<void> {
  await api.post(`/officer/tenders/${id}/approve`);
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await api.post(`/officer/tenders/${id}/reject`, { reason });
}

// ── Officers ─────────────────────────────────────────────────
export async function fetchOfficers(
  department?: string,
  search?: string,
): Promise<Officer[]> {
  const res = await api.get('/officer/officers', {
    params: { department, search },
  });
  return res.data;
}

export async function assignOfficers(
  tenderId: string,
  assignments: { officerId: string; role: string }[],
): Promise<void> {
  await api.post(`/officer/tenders/${tenderId}/assign`, { assignments });
}

// ── Audit Logs ───────────────────────────────────────────────
export async function fetchAuditLogs(
  tenderId?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: AuditLogEntry[]; pagination: PaginationState }> {
  const res = await api.get('/officer/audit-logs', {
    params: { tenderId, page, pageSize },
  });
  return res.data;
}

// ── Recent Awards ────────────────────────────────────────────
export async function fetchRecentAwards(
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: Award[]; pagination: PaginationState }> {
  const res = await api.get('/officer/awards', {
    params: { department, page, pageSize },
  });
  return res.data;
}

// ── Notifications ────────────────────────────────────────────
export async function fetchDashboardNotifications(
  search?: string,
  type?: string,
  status?: string,
): Promise<DashboardNotification[]> {
  const res = await api.get('/officer/notifications', {
    params: { search, type, status },
  });
  return res.data;
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const res = await api.get('/officer/notifications/summary');
  return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/officer/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/officer/notifications/read-all');
}

export async function resendFailedNotification(id: string): Promise<void> {
  await api.post(`/officer/notifications/${id}/resend`);
}

// ── KPIs ─────────────────────────────────────────────────────
export async function fetchKpiSummary(): Promise<KpiSummary> {
  const res = await api.get('/officer/kpi/summary');
  return res.data;
}

export async function fetchKpiReport(params: {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}): Promise<KpiReportData> {
  const res = await api.get('/officer/kpi/report', { params });
  return res.data;
}

// ── Registration ─────────────────────────────────────────────
export async function fetchRegistrations(
  department?: string,
  search?: string,
): Promise<RegistrationRequest[]> {
  const res = await api.get('/officer/registrations', {
    params: { department, search },
  });
  return res.data;
}

export async function acceptRegistration(id: string): Promise<void> {
  await api.post(`/officer/registrations/${id}/accept`);
}

export async function deleteRegistration(id: string): Promise<void> {
  await api.delete(`/officer/registrations/${id}`);
}
