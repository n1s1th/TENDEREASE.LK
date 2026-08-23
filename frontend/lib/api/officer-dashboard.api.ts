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
import { getOfficerQuestions } from '@/services/qa.service';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

const tenderApi = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || 'http://localhost:8082') + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Tenders ──────────────────────────────────────────────────
export async function fetchDashboardTenders(
  tab: TenderTab,
  department?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: DashboardTender[]; pagination: PaginationState }> {
  // Map tab to status if needed, but the backend accepts keyword, status, page, size
  const res = await tenderApi.get('/officer/dashboard/tenders', {
    params: { status: tab === 'all' ? '' : tab, department, page: page - 1, size: pageSize },
  });
  // Note: Backend might return page 0-indexed, so we subtract 1 from page
  return res.data;
}

export async function fetchTenderDetails(id: string): Promise<DashboardTender> {
  const res = await tenderApi.get(`/v1/tenders/${id}`);
  return res.data;
}

export async function approveTender(id: string): Promise<void> {
  await tenderApi.post(`/v1/tenders/${id}/approve`);
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await tenderApi.post(`/v1/tenders/${id}/reject`, { reason });
}

// ── Officers ─────────────────────────────────────────────────
export async function fetchOfficers(
  department?: string,
  search?: string,
): Promise<Officer[]> {
  const res = await api.get('/officers', {
    params: { department, search },
  });
  return res.data;
}

export async function assignOfficers(
  tenderId: string,
  assignments: { officerId: string; role: string }[],
): Promise<void> {
  await tenderApi.post(`/v1/tenders/${tenderId}/assign`, { assignments });
}

// ── Audit Logs ───────────────────────────────────────────────
export async function fetchAuditLogs(
  tenderId?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: AuditLogEntry[]; pagination: PaginationState }> {
  const res = await api.get('/audit-logs', {
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
  const res = await api.get('/awards', {
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
    }));

  let globalNotifications: DashboardNotification[] = [];
  try {
    const globalQaRes = await getOfficerQuestions({ status: "PENDING", size: 50 });
    globalNotifications = globalQaRes.content.map((q: any) => ({
      id: `global-qa-${q.id}`,
      tenderId: 'global',
      title: 'Global Q&A Request',
      message: `New platform question: ${q.questionText.substring(0, 50)}...`,
      type: 'clarification_received' as const,
      status: 'pending' as const,
      recipients: q.askedBy || 'Anonymous',
      time: q.createdAt,
      performedBy: q.askedBy || 'User',
      isRead: readNotifications.has(`global-qa-${q.id}`),
      actionUrl: `/officer-dashboard/qa`,
    }));
  } catch (err) {
    console.error("Failed to fetch global QA for notifications:", err);
  }

  const allNotifications = [...notifications, ...globalNotifications]
    .filter((n) => {
      if (type && type !== 'all' && n.type !== type) return false;
      if (status && status !== 'all' && n.status !== status) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    });

  return allNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
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
export async function fetchAllClarifications(officerEmail?: string): Promise<ClarificationItem[]> {
  try {
    const params = officerEmail ? { officerEmail } : {};
    const res = await tenderApi.get('/officer/dashboard/clarifications', { params });
    const tenderClarifications: ClarificationItem[] = res.data;
    return tenderClarifications.sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime());
  } catch (error) {
    console.error("Failed to fetch tender clarifications", error);
    return [];
  }
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
