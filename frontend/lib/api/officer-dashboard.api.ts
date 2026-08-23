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

// User/Officer API — NEXT_PUBLIC_USER_API_URL = https://api.tenderease.me/api
// Controller is mapped to /api/officer/dashboard
const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8081/api') + '/officer/dashboard',
  headers: { 'Content-Type': 'application/json' },
});

// Tender API — NEXT_PUBLIC_TENDER_SERVICE_URL = https://api.tenderease.me/api/tenders
const tenderApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || 'http://localhost:8082/api/tenders',
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
  const readNotifications = getReadNotifications();
  const clarifications = await fetchAllClarifications();
  const notifications = clarifications
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

// ── Clarifications ───────────────────────────────────────────
export async function fetchAllClarifications(): Promise<ClarificationItem[]> {
  const res = await tenderApi.get('/officer/dashboard/clarifications');
  return res.data;
}

export async function fetchClarifications(tenderId: string): Promise<ClarificationItem[]> {
  const res = await tenderApi.get(`/officer/dashboard/clarifications/${tenderId}`);
  return res.data;
}

export async function answerClarification(
  tenderId: string,
  clarificationId: number,
  answer: string,
): Promise<ClarificationItem> {
  const res = await tenderApi.post(`/officer/dashboard/clarifications/${tenderId}/${clarificationId}/answer`, { answer });
  return res.data;
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
