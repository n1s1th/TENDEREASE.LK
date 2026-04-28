// ─── CAO Dashboard API Layer ─────────────────────────────
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
} from '@/lib/types/cao-dashboard.types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Tenders ──────────────────────────────────────────────────
export async function fetchDashboardTenders(
  tab: TenderTab,
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: DashboardTender[]; pagination: PaginationState }> {
  let status = tab.toUpperCase();
  if (tab === 'pending') status = 'PENDING_APPROVAL';
  if (tab === 'approved') status = 'PUBLISHED';
  
  const res = await api.get('/cao/tenders', {
    params: { status, page, size: pageSize },
  });
  
  // Map backend PageResponse fields to frontend expectations
  return {
    data: res.data.content || [],
    pagination: {
      currentPage: (res.data.pageNumber || 0) + 1,
      totalPages: res.data.totalPages || 1,
      pageSize: res.data.pageSize || 10,
      totalItems: res.data.totalElements || 0,
    }
  };
}

export async function fetchTenderDetails(id: string): Promise<DashboardTender> {
  const res = await api.get(`/cao/tenders/${id}`);
  return res.data;
}

export async function approveTender(id: string): Promise<void> {
  await api.post(`/cao/tenders/${id}/approve`);
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await api.post(`/cao/tenders/${id}/reject`, { reason });
}

// ── Officers ─────────────────────────────────────────────────
export async function fetchOfficers(
  department?: string,
  search?: string,
): Promise<Officer[]> {
  const res = await api.get('/cao/officers', {
    params: { department, search },
  });
  return res.data;
}

export async function assignOfficers(
  tenderId: string,
  assignments: { officerId: string; role: string }[],
): Promise<void> {
  await api.post(`/cao/tenders/${tenderId}/assign`, { assignments });
}

// ── Audit Logs ───────────────────────────────────────────────
export async function fetchAuditLogs(
  tenderId?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: AuditLogEntry[]; pagination: PaginationState }> {
  const res = await api.get('/cao/audit-logs', {
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
  const res = await api.get('/cao/awards', {
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
  const res = await api.get('/cao/notifications', {
    params: { search, type, status },
  });
  return res.data;
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const res = await api.get('/cao/notifications/summary');
  return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/cao/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/cao/notifications/read-all');
}

export async function resendFailedNotification(id: string): Promise<void> {
  await api.post(`/cao/notifications/${id}/resend`);
}

// ── KPIs ─────────────────────────────────────────────────────
export async function fetchKpiSummary(): Promise<KpiSummary> {
  const res = await api.get('/cao/kpi/summary');
  return res.data;
}

export async function fetchKpiReport(params: {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}): Promise<KpiReportData> {
  const res = await api.get('/cao/kpi/report', { params });
  return res.data;
}

// ── Registration ─────────────────────────────────────────────
export async function fetchRegistrations(
  department?: string,
  search?: string,
): Promise<RegistrationRequest[]> {
  const res = await api.get('/cao/registrations', {
    params: { department, search },
  });
  return res.data;
}

export async function acceptRegistration(id: string): Promise<void> {
  await api.post(`/cao/registrations/${id}/accept`);
}

export async function deleteRegistration(id: string): Promise<void> {
  await api.delete(`/cao/registrations/${id}`);
}
