// ─── CAO Dashboard API Layer ─────────────────────────────
import axios from 'axios';
import type {
  DashboardTender,
  DashboardNotification,
  NotificationSummary,
  KpiSummary,
  KpiReportData,
  KpiReportParams,
  RegistrationRequest,
  RegistrationStatus,
  TenderTab,
  PaginationState,
  Recommendation,
  RecommendationStatus,
} from '@/lib/types/cao-dashboard.types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5s timeout
});

// Separate axios instance for user-service (port 8081)
const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Separate axios instance for reporting-service (port 8092)
const reportApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REPORT_API_URL || 'http://localhost:8092/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s for reports
});

// Separate axios instance for evaluation-service (port 8084)
const evaluationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://localhost:8084/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
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
    params: { status, page, size: pageSize, _t: Date.now() },
  });
  
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

export async function viewTenderDocument(docId: string): Promise<string> {
  // Returns a URL to the document that can be opened in a new tab
  return `${api.defaults.baseURL}/cao/tenders/documents/${docId}/view`;
}

export async function downloadTenderDocument(docId: string): Promise<Blob> {
  if (!docId) throw new Error("Document ID is required");
  
  const fullUrl = 'http://localhost:8082/api/v1/cao/tenders/documents/' + docId + '/base64?t=' + Date.now();
  
  const res = await axios.get(fullUrl, {
    withCredentials: false
  });
  
  if (!res.data || !res.data.content) {
    throw new Error("Server returned empty document data");
  }
  
  const base64Data = res.data.content;
  const mimeType = res.data.mimeType || 'application/pdf';
  
  try {
    // Decode Base64
    const byteCharacters = atob(base64Data.replace(/\s/g, ''));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (e) {
    console.error("Base64 decoding failed", e);
    throw new Error("Failed to decode document content. The file might be corrupted.");
  }
}

export async function approveTender(id: string): Promise<void> {
  await api.post(`/cao/tenders/${id}/approve`);
}

export async function rejectTender(id: string, reason: string): Promise<void> {
  await api.post(`/cao/tenders/${id}/reject`, null, { params: { reason } });
}

// ── Registration ─────────────────────────────────────────────
export async function fetchRegistrations(
  status?: RegistrationStatus,
  page = 1,
  pageSize = 20,
): Promise<{ data: RegistrationRequest[]; pagination: PaginationState }> {
  const res = await userApi.get('/cao/registrations', {
    params: { status: status || 'PENDING', page: page - 1, size: pageSize, _t: Date.now() },
  });
  return {
    data: res.data.content || [],
    pagination: {
      currentPage: (res.data.pageNumber || 0) + 1,
      totalPages: res.data.totalPages || 1,
      pageSize: res.data.pageSize || 20,
      totalItems: res.data.totalElements || 0,
    }
  };
}

export async function acceptRegistration(id: string): Promise<void> {
  await userApi.post(`/cao/registrations/${id}/accept`);
}

export async function rejectRegistration(id: string, reason: string): Promise<void> {
  await userApi.post(`/cao/registrations/${id}/reject`, null, { params: { reason } });
}

// ── Recommendations ──────────────────────────────────────────
export async function fetchRecommendations(status?: RecommendationStatus): Promise<Recommendation[]> {
  const res = await evaluationApi.get('/recommendations', {
    params: { status, _t: Date.now() }
  });
  return res.data || [];
}

export async function updateRecommendationStatus(id: number, status: RecommendationStatus, reason?: string): Promise<void> {
  await evaluationApi.patch(`/recommendations/${id}/status`, {}, {
    params: { status, ...(reason ? { reason } : {}) }
  });
}

// ── KPIs ─────────────────────────────────────────────────────
export async function fetchKpiSummary(): Promise<KpiSummary> {
  const res = await api.get('/cao/tenders/kpi'); // goes to tender-service port 8082
  const data = res.data || {};
  return {
    activeTenders: data.activeTenders || 0,
    activeTendersChange: 0,
    awardedTenders: data.awardedTenders || 0,
    awardedTendersChange: 0,
    avgCycleTime: 0,       // Will be calculated once tender lifecycle tracking is complete
    avgCycleTimeChange: 0,
    smeParticipation: 0,   // Will be calculated once bidding module is developed
    smeParticipationChange: 0,
  };
}

export async function fetchKpiReport(params: KpiReportParams): Promise<KpiReportData> {
  const res = await reportApi.get('/cao/kpi/report', { params });
  return res.data;
}

// ── Notifications (Dynamic) ────────────────────────
// Notifications are dynamically generated from pending tenders and registrations.

function getReadNotifications(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem('readNotifications');
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadNotifications(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('readNotifications', JSON.stringify(Array.from(ids)));
}

export async function fetchDashboardNotifications(): Promise<DashboardNotification[]> {
  const readNotifs = getReadNotifications();
  const notifications: DashboardNotification[] = [];
  
  try {
    // Fetch in parallel to avoid sequential blocking
    const [tendersResult, regResult, recResult] = await Promise.allSettled([
      fetchDashboardTenders('pending', undefined, 1, 100),
      fetchRegistrations('PENDING', 1, 100),
      fetchRecommendations('PENDING')
    ]);

    // Handle Tenders
    if (tendersResult.status === 'fulfilled') {
      tendersResult.value.data.forEach((t) => {
        notifications.push({
          id: `tender-${t.id}`,
          title: "Pending Tender",
          message: `Tender ${t.tenderNumber || t.referenceNumber || t.id} is pending approval.`,
          type: "tender_submitted",
          status: "info",
          time: (t as any).createdAt || (t as any).createdDate || t.closingDate || new Date().toISOString(),
          isRead: readNotifs.has(`tender-${t.id}`),
          targetId: t.tenderNumber || t.referenceNumber || t.id
        });
      });
    }

    // Handle Registrations
    if (regResult.status === 'fulfilled') {
      regResult.value.data.forEach((r: any) => {
        notifications.push({
          id: `reg-${r.officerId}`,
          title: "Registration Received",
          message: `Registration request from ${r.procuringEntityType || "Institution"} is pending.`,
          type: "officer_registered",
          status: "pending",
          time: r.createdAt || new Date().toISOString(),
          isRead: readNotifs.has(`reg-${r.officerId}`),
          targetId: r.officerId
        });
      });
    }

    // Handle Recommendations
    if (recResult.status === 'fulfilled') {
      recResult.value.forEach((r) => {
        notifications.push({
          id: `rec-${r.id}`,
          title: "New Recommendation",
          message: `Recommendation for ${r.tenderName} is awaiting approval.`,
          type: "recommendation_received",
          status: "pending",
          time: r.createdAt,
          isRead: readNotifs.has(`rec-${r.id}`),
          targetId: r.tenderId
        });
      });
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
  } catch (e) {
    console.error("Failed to generate notifications", e);
  }

  return notifications;
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const notifs = await fetchDashboardNotifications();
  const unread = notifs.filter(n => !n.isRead).length;
  const today = new Date().toISOString().split('T')[0];
  const totalToday = notifs.filter(n => n.time.startsWith(today)).length;
  const pendingActions = notifs.filter(n => n.type === 'tender_submitted' || n.type === 'officer_registered' || n.type === 'recommendation_received').length;
  return { unread, totalToday, pendingActions };
}

export function addNotification(notification: Omit<DashboardNotification, 'id' | 'time' | 'isRead'>) {
  // Optional: Not really needed if dynamically fetched, kept for backwards compatibility
}

export async function markNotificationRead(id: string): Promise<void> {
  const readNotifs = getReadNotifications();
  readNotifs.add(id);
  saveReadNotifications(readNotifs);
}

export async function markAllNotificationsRead(): Promise<void> {
  const notifs = await fetchDashboardNotifications();
  const readNotifs = getReadNotifications();
  notifs.forEach(n => readNotifs.add(n.id));
  saveReadNotifications(readNotifs);
}
