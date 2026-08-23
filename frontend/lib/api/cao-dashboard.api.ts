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

// Main API — NEXT_PUBLIC_API_URL = https://api.tenderease.me (root gateway)
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// User/Officer API — NEXT_PUBLIC_USER_API_URL = https://api.tenderease.me/api
const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Reporting/KPI API — NEXT_PUBLIC_REPORT_API_URL = https://api.tenderease.me/api/cao/kpi
const reportApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REPORT_API_URL || 'http://localhost:8092/api/cao/kpi',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Evaluation API — NEXT_PUBLIC_EVALUATION_API_URL = https://api.tenderease.me
const evaluationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://localhost:8084',
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
  if (tab === 'recent-awards') status = 'AWARDED';
  
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
  
  const fullUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082') + '/api/v1/cao/tenders/documents/' + docId + '/base64?t=' + Date.now();
  
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
  let activeCount = 0;
  let awardedCount = 0;
  let cycleTimeDays = 0;
  let smePercent = 0;
  let totalCycleDays = 0;
  
  try {
    const [tendersRes, vendorsRes] = await Promise.all([
      api.get('/cao/tenders', { params: { size: 1000 } }),
      userApi.get('/v1/vendors', { params: { size: 1000 } }).catch(() => null)
    ]);

    const tenders = tendersRes.data?.content || [];
    
    activeCount = tenders.filter((t: any) => 
      ['PUBLISHED', 'APPROVED', 'EVALUATION', 'PENDING_OPENING', 'OPEN'].includes(t.status)
    ).length;
    
    tenders.forEach((t: any) => {
      // Exclusively use the real backend status
      if (t.status === 'AWARDED') {
        awardedCount++;
        // Use published/opening dates if available, otherwise fallback
        const start = new Date(t.publishedAt || t.openingDate || t.createdAt || Date.now());
        const end = new Date(t.awardedAt || t.updatedAt || t.closingDate || Date.now());
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        totalCycleDays += diffDays;
      }
    });

    if (awardedCount > 0) {
      cycleTimeDays = Math.round(totalCycleDays / awardedCount);
    }

    // Real SME calculation from Vendors
    if (vendorsRes?.data?.content) {
      const vendors = vendorsRes.data.content;
      const smeCount = vendors.filter((v: any) => v.organizationType === 'SOLE_PROPRIETORSHIP' || v.organizationType === 'PARTNERSHIP').length;
      if (vendors.length > 0) {
        smePercent = Math.round((smeCount / vendors.length) * 100);
      }
    }
  } catch (e) {
    console.warn("Could not fetch real KPI summary from tenders");
  }

  return {
    activeTenders: activeCount,
    activeTendersChange: 0,
    awardedTenders: awardedCount,
    awardedTendersChange: 0,
    avgCycleTime: cycleTimeDays,       
    avgCycleTimeChange: 0,
    smeParticipation: smePercent,   
    smeParticipationChange: 0,
  };
}

export async function fetchKpiReport(params: KpiReportParams): Promise<KpiReportData> {
  let activeCount = 0;
  let awardedCount = 0;
  let cycleTimeDays = 0;
  let smePercent = 0;
  let totalAwardValue = 0;
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cycleTimeMap = new Map<number, {total: number, count: number}>();
  const activeMap = new Map<number, number>();
  const awardValueMap = new Map<number, number>();

  for(let i = 0; i < 12; i++) {
    cycleTimeMap.set(i, {total: 0, count: 0});
    activeMap.set(i, 0);
    awardValueMap.set(i, 0);
  }

  try {
    const [tendersRes, vendorsRes] = await Promise.all([
      api.get('/cao/tenders', { params: { size: 1000 } }),
      userApi.get('/v1/vendors', { params: { size: 1000 } }).catch(() => null)
    ]);

    let tenders = tendersRes.data?.content || [];
    
    // Apply exact filters
    if (params.department) {
      tenders = tenders.filter((t: any) => t.department === params.department || t.departmentName === params.department || t.ministryName === params.department);
    }
    if (params.category) {
      tenders = tenders.filter((t: any) => 
        (t.category && t.category.toLowerCase() === params.category.toLowerCase()) || 
        (t.procurementType && t.procurementType.toLowerCase() === params.category.toLowerCase())
      );
    }
    if (params.period && params.period !== 'all_time') {
      const now = new Date();
      tenders = tenders.filter((t: any) => {
        const tDate = new Date(t.publishedAt || t.createdAt || t.closingDate || Date.now());
        if (params.period === 'today') return tDate.toDateString() === now.toDateString();
        if (params.period === 'this_week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return tDate >= startOfWeek;
        }
        if (params.period === 'this_month') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        }
        if (params.period === 'this_year') {
          return tDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    if (vendorsRes?.data?.content && params.period && params.period !== 'all_time') {
      const now = new Date();
      vendorsRes.data.content = vendorsRes.data.content.filter((v: any) => {
        const vDate = new Date(v.createdAt || Date.now());
        if (params.period === 'today') return vDate.toDateString() === now.toDateString();
        if (params.period === 'this_week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return vDate >= startOfWeek;
        }
        if (params.period === 'this_month') {
          return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
        }
        if (params.period === 'this_year') {
          return vDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    let totalCycleDays = 0;
    
    tenders.forEach((t: any) => {
      const tDate = new Date(t.publishedAt || t.createdAt || t.closingDate || Date.now());
      const monthIndex = tDate.getMonth(); // 0 to 11

      // Active
      if (['PUBLISHED', 'APPROVED', 'EVALUATION', 'PENDING_OPENING', 'OPEN'].includes(t.status)) {
        activeCount++;
        activeMap.set(monthIndex, (activeMap.get(monthIndex) || 0) + 1);
      }

      // Awarded & Cycle Time (exclusively rely on DB status)
      if (t.status === 'AWARDED') {
        awardedCount++;
        const start = new Date(t.publishedAt || t.openingDate || t.createdAt || Date.now());
        const end = new Date(t.awardedAt || t.updatedAt || t.closingDate || Date.now());
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        
        totalCycleDays += diffDays;
        const currCycle = cycleTimeMap.get(monthIndex)!;
        currCycle.total += diffDays;
        currCycle.count += 1;

        // Sum Award Value (using estimated budget)
        const budget = t.estimatedBudget || 0;
        totalAwardValue += budget;
        awardValueMap.set(monthIndex, (awardValueMap.get(monthIndex) || 0) + budget);
      }
    });

    if (awardedCount > 0) {
      cycleTimeDays = Math.round(totalCycleDays / awardedCount);
    }

    if (vendorsRes?.data?.content) {
      const vendors = vendorsRes.data.content;
      const smeCount = vendors.filter((v: any) => v.organizationType === 'SOLE_PROPRIETORSHIP' || v.organizationType === 'PARTNERSHIP').length;
      if (vendors.length > 0) {
        smePercent = Math.round((smeCount / vendors.length) * 100);
      }
    }
  } catch (e) {
    console.error("Could not fetch real KPI report data", e);
  }

  // Generate trend arrays strictly from the real maps, up to the current month to avoid future dummy data
  const currentMonthIndex = new Date().getMonth();
  const trendLimit = Math.min(11, currentMonthIndex);
  
  const cycleTimeTrend = [];
  const activeTendersTrend = [];
  const awardValueTrend = [];

  for(let i = 0; i <= trendLimit; i++) {
    const monthLabel = months[i];
    
    const cycle = cycleTimeMap.get(i)!;
    const avgC = cycle.count > 0 ? Math.round(cycle.total / cycle.count) : 0;
    cycleTimeTrend.push({ label: monthLabel, value: avgC });

    activeTendersTrend.push({ label: monthLabel, value: activeMap.get(i) || 0 });

    const valMn = (awardValueMap.get(i) || 0) / 1000000;
    awardValueTrend.push({ label: monthLabel, value: parseFloat(valMn.toFixed(2)) });
  }
  
  return {
    cycleTimeTrend,
    smeParticipationPercent: smePercent,
    awardValueTrend,
    activeTendersTrend,
    summary: {
      avgCycleTime: `${cycleTimeDays} days`,
      smeParticipation: `${smePercent}%`,
      totalAwardValue: `Rs. ${(totalAwardValue / 1000000).toFixed(2)} Mn`,
      totalAwards: awardedCount,
      activeTenders: activeCount
    }
  };
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
