// ─── CAO Dashboard Store ─────────────────────────────────
import { create } from 'zustand';
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
  ToastMessage,
  ToastType,
  PaginationState,
  Recommendation,
  RecommendationStatus,
} from '@/lib/types/cao-dashboard.types';
import * as api from '@/lib/api/cao-dashboard.api';

// ── State ────────────────────────────────────────────────────
interface CAODashboardState {
  // Tenders
  tenders: DashboardTender[];
  selectedTender: DashboardTender | null;
  activeTab: TenderTab;
  department: string;
  searchQuery: string;
  pagination: PaginationState;
  tendersLoading: boolean;

  // Registration
  registrations: RegistrationRequest[];
  registrationsLoading: boolean;
  registrationStatusFilter: RegistrationStatus | 'ALL';
  registrationSearch: string;
  registrationPagination: PaginationState;

  // Notifications
  notifications: DashboardNotification[];
  notificationSummary: NotificationSummary | null;
  notificationsLoading: boolean;

  // KPIs
  kpiSummary: KpiSummary | null;
  kpiReport: KpiReportData | null;
  kpiLoading: boolean;

  // Recommendations
  recommendations: Recommendation[];
  recommendationsLoading: boolean;

  // UI
  toasts: ToastMessage[];
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  // ── Actions ──────────────────────────────────────────────────
  setActiveTab: (tab: TenderTab) => void;
  setDepartment: (dept: string) => void;
  setSearchQuery: (q: string) => void;
  setPage: (page: number) => void;
  setSelectedTender: (tender: DashboardTender | null) => void;

  fetchTenders: () => Promise<void>;
  fetchKpiSummary: () => Promise<void>;
  fetchKpiReport: (params: KpiReportParams) => Promise<void>;

  // Registration
  setRegistrationStatusFilter: (status: RegistrationStatus | 'ALL') => void;
  setRegistrationSearch: (q: string) => void;
  fetchRegistrations: () => Promise<void>;
  acceptRegistration: (id: string) => Promise<void>;
  rejectRegistration: (id: string, reason: string) => Promise<void>;

  // Notifications
  fetchNotifications: () => Promise<void>;
  fetchNotificationSummary: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Tender Actions
  approveTender: (id: string) => Promise<void>;
  rejectTender: (id: string, reason: string) => Promise<void>;

  // Recommendation Actions
  fetchRecommendations: (status?: RecommendationStatus) => Promise<void>;
  updateRecommendationStatus: (id: number, status: RecommendationStatus, reason?: string) => Promise<void>;

  // UI Actions
  showToast: (type: ToastType, message: string, actionLabel?: string) => void;
  dismissToast: (id: string) => void;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

// ── Store ────────────────────────────────────────────────────
export const useCAODashboardStore = create<CAODashboardState>(
  (set, get) => ({
    // Initial state
    tenders: [],
    selectedTender: null,
    activeTab: 'pending',
    department: '',
    searchQuery: '',
    pagination: { currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 },
    tendersLoading: false,

    registrations: [],
    registrationsLoading: false,
    registrationStatusFilter: 'PENDING',
    registrationSearch: '',
    registrationPagination: { currentPage: 1, totalPages: 1, pageSize: 20, totalItems: 0 },

    notifications: [],
    notificationSummary: null,
    notificationsLoading: false,

    kpiSummary: null,
    kpiReport: null,
    kpiLoading: false,

    recommendations: [],
    recommendationsLoading: false,

    toasts: [],
    activeModal: null,
    modalData: null,

    // ── Setters ────────────────────────────────────────────────
    setActiveTab: (tab) => set({ activeTab: tab }),
    setDepartment: (dept) => set({ department: dept }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setPage: (page) =>
      set((state) => ({
        pagination: { ...state.pagination, currentPage: page },
      })),
    setSelectedTender: (tender) => set({ selectedTender: tender }),

    // ── Fetch Tenders ──────────────────────────────────────────
    fetchTenders: async () => {
      const { activeTab, department, pagination } = get();
      set({ tendersLoading: true });
      try {
        const result = await api.fetchDashboardTenders(
          activeTab,
          department || undefined,
          pagination.currentPage,
          pagination.pageSize,
        );
        set({ tenders: result.data, pagination: result.pagination });
      } catch {
        set({ tenders: [] });
      } finally {
        set({ tendersLoading: false });
      }
    },

    // ── Registration ───────────────────────────────────────────
    setRegistrationStatusFilter: (status) => set({ registrationStatusFilter: status }),
    setRegistrationSearch: (q) => set({ registrationSearch: q }),

    fetchRegistrations: async () => {
      const { registrationStatusFilter, registrationPagination } = get();
      set({ registrationsLoading: true });
      try {
        if (registrationStatusFilter === 'ALL') {
          const [pending, approved, rejected] = await Promise.all([
            api.fetchRegistrations('PENDING', 1, 100),
            api.fetchRegistrations('APPROVED', 1, 100),
            api.fetchRegistrations('REJECTED', 1, 100),
          ]);
          const allData = [...pending.data, ...approved.data, ...rejected.data];
          set({ 
            registrations: allData, 
            registrationPagination: {
              currentPage: 1,
              totalPages: 1,
              pageSize: 100,
              totalItems: allData.length
            } 
          });
        } else {
          const result = await api.fetchRegistrations(
            registrationStatusFilter as any,
            registrationPagination.currentPage,
            registrationPagination.pageSize,
          );
          set({ registrations: result.data, registrationPagination: result.pagination });
        }
      } catch {
        set({ registrations: [] });
      } finally {
        set({ registrationsLoading: false });
      }
    },

    acceptRegistration: async (id) => {
      try {
        await api.acceptRegistration(id);
        get().showToast('success', 'Registration approved successfully. Approval email sent.');
        // Add notification
        api.addNotification({
          title: 'Registration Approved',
          message: `Officer registration has been approved.`,
          type: 'registration_approved',
          status: 'success',
        });
        get().fetchRegistrations();
        get().fetchKpiSummary();
      } catch (err: any) {
        console.error("Accept registration error:", err);
        const errMsg = err?.response?.data?.message || err?.message || 'Server error';
        get().showToast('error', `Failed to approve registration: ${errMsg}`);
      }
    },

    rejectRegistration: async (id, reason) => {
      try {
        await api.rejectRegistration(id, reason);
        get().showToast('success', 'Registration rejected. Rejection email sent.');
        api.addNotification({
          title: 'Registration Rejected',
          message: `Officer registration rejected. Reason: ${reason}`,
          type: 'registration_rejected',
          status: 'warning',
        });
        get().closeModal();
        get().fetchRegistrations();
      } catch (err: any) {
        console.error("Reject registration error:", err);
        const errMsg = err?.response?.data?.message || err?.message || 'Server error';
        get().showToast('error', `Failed to reject registration: ${errMsg}`);
      }
    },

    // ── Notifications ──────────────────────────────────────────
    fetchNotifications: async () => {
      set({ notificationsLoading: true });
      try {
        const data = await api.fetchDashboardNotifications();
        set({ notifications: data });
      } catch {
        set({ notifications: [] });
      } finally {
        set({ notificationsLoading: false });
      }
    },

    fetchNotificationSummary: async () => {
      // Prevent fetching more than once every 60 seconds to improve performance
      const lastFetch = (get() as any).lastNotificationFetch || 0;
      if (Date.now() - lastFetch < 60000 && get().notificationSummary) return;

      try {
        const data = await api.fetchNotificationSummary();
        set({ notificationSummary: data, lastNotificationFetch: Date.now() } as any);
      } catch {
        set({ notificationSummary: null });
      }
    },

    markNotificationRead: async (id) => {
      try {
        await api.markNotificationRead(id);
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
        }));
      } catch {
        // silent
      }
    },

    markAllNotificationsRead: async () => {
      try {
        // Mark all currently loaded notifications as read in localStorage
        // without re-fetching from 3 services
        const currentNotifs = get().notifications;
        const readNotifs = new Set<string>(
          JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('readNotifications') || '[]' : '[]')
        );
        currentNotifs.forEach(n => readNotifs.add(n.id));
        if (typeof window !== 'undefined') {
          localStorage.setItem('readNotifications', JSON.stringify(Array.from(readNotifs)));
        }
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      } catch {
        // silent
      }
    },

    // ── KPIs ───────────────────────────────────────────────────
    fetchKpiSummary: async () => {
      set({ kpiLoading: true });
      try {
        const data = await api.fetchKpiSummary();
        set({ kpiSummary: data });
      } catch {
        set({ kpiSummary: null });
      } finally {
        set({ kpiLoading: false });
      }
    },

    fetchKpiReport: async (params) => {
      set({ kpiLoading: true });
      try {
        const data = await api.fetchKpiReport(params);
        set({ kpiReport: data });
      } catch {
        set({ kpiReport: null });
      } finally {
        set({ kpiLoading: false });
      }
    },

    // ── Tender Actions ─────────────────────────────────────────
    approveTender: async (id) => {
      try {
        await api.approveTender(id);
        get().showToast('success', 'Tender approved and published successfully.');
        api.addNotification({
          title: 'Tender Approved',
          message: `Tender has been approved and published to the portal.`,
          type: 'tender_approved',
          status: 'success',
        });
        get().closeModal();
        get().fetchTenders();
        get().fetchKpiSummary();
      } catch {
        get().showToast('error', 'Failed to approve tender.');
      }
    },

    rejectTender: async (id, reason) => {
      try {
        await api.rejectTender(id, reason);
        get().showToast('success', 'Tender rejected successfully.');
        api.addNotification({
          title: 'Tender Rejected',
          message: `Tender has been rejected. Reason: ${reason}`,
          type: 'tender_rejected',
          status: 'warning',
        });
        get().closeModal();
        get().fetchTenders();
        get().fetchKpiSummary();
      } catch {
        get().showToast('error', 'Failed to reject tender.');
      }
    },

    // ── Recommendations ────────────────────────────────────────
    fetchRecommendations: async (status) => {
      set({ recommendationsLoading: true });
      try {
        const data = await api.fetchRecommendations(status);
        set({ recommendations: data });
      } catch {
        set({ recommendations: [] });
      } finally {
        set({ recommendationsLoading: false });
      }
    },

    updateRecommendationStatus: async (id, status, reason) => {
      try {
        await api.updateRecommendationStatus(id, status, reason);
        const msg = status === 'APPROVED' ? 'Recommendation approved successfully.' : 'Recommendation rejected.';
        get().showToast('success', msg);
        
        get().closeModal();
        get().fetchRecommendations();
      } catch {
        get().showToast('error', `Failed to ${status.toLowerCase()} recommendation.`);
      }
    },

    // ── UI ─────────────────────────────────────────────────────
    showToast: (type, message, actionLabel) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      set((state) => ({
        toasts: [...state.toasts, { id, type, message, actionLabel }],
      }));
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 5000);
    },

    dismissToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    openModal: (modal, data) => set({ activeModal: modal, modalData: data ?? null }),
    closeModal: () => set({ activeModal: null, modalData: null }),
  }),
);

// ── Selectors ────────────────────────────────────────────────
export const selectDashboardTenders = (s: CAODashboardState) => s.tenders;
export const selectActiveTab = (s: CAODashboardState) => s.activeTab;
export const selectDepartment = (s: CAODashboardState) => s.department;
export const selectDashboardPagination = (s: CAODashboardState) => s.pagination;
export const selectKpiSummary = (s: CAODashboardState) => s.kpiSummary;
export const selectToasts = (s: CAODashboardState) => s.toasts;
export const selectActiveModal = (s: CAODashboardState) => s.activeModal;
export const selectModalData = (s: CAODashboardState) => s.modalData;
