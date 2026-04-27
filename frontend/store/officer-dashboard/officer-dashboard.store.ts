// ─── Officer Dashboard Store ─────────────────────────────────
import { create } from 'zustand';
import type {
  DashboardTender,
  Officer,
  AuditLogEntry,
  Award,
  DashboardNotification,
  NotificationSummary,
  KpiSummary,
  KpiReportData,
  RegistrationRequest,
  TenderTab,
  ToastMessage,
  ToastType,
  PaginationState,
} from '@/lib/types/officer-dashboard.types';
import * as api from '@/lib/api/officer-dashboard.api';

// ── State ────────────────────────────────────────────────────
interface OfficerDashboardState {
  // Tenders
  tenders: DashboardTender[];
  selectedTender: DashboardTender | null;
  activeTab: TenderTab;
  department: string;
  searchQuery: string;
  pagination: PaginationState;
  tendersLoading: boolean;

  // Officers
  officers: Officer[];
  officersLoading: boolean;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  auditLogsLoading: boolean;
  auditLogFilter: string;

  // Awards
  awards: Award[];
  awardsLoading: boolean;

  // Notifications
  notifications: DashboardNotification[];
  notificationSummary: NotificationSummary | null;
  notificationsLoading: boolean;

  // KPIs
  kpiSummary: KpiSummary | null;
  kpiReport: KpiReportData | null;
  kpiLoading: boolean;

  // Registration
  registrations: RegistrationRequest[];
  registrationsLoading: boolean;

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
  fetchOfficers: (department?: string, search?: string) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  setAuditLogFilter: (tenderId: string) => void;
  fetchAwards: () => Promise<void>;
  fetchNotifications: (search?: string, type?: string, status?: string) => Promise<void>;
  fetchNotificationSummary: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  fetchKpiSummary: () => Promise<void>;
  fetchKpiReport: (params: {
    startDate?: string;
    endDate?: string;
    department?: string;
    category?: string;
  }) => Promise<void>;
  fetchRegistrations: (department?: string, search?: string) => Promise<void>;
  acceptRegistration: (id: string) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;

  approveTender: (id: string) => Promise<void>;
  rejectTender: (id: string, reason: string) => Promise<void>;
  assignOfficers: (
    tenderId: string,
    assignments: { officerId: string; role: string }[],
  ) => Promise<void>;

  // UI Actions
  showToast: (type: ToastType, message: string, actionLabel?: string) => void;
  dismissToast: (id: string) => void;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

// ── Store ────────────────────────────────────────────────────
export const useOfficerDashboardStore = create<OfficerDashboardState>(
  (set, get) => ({
    // Initial state
    tenders: [],
    selectedTender: null,
    activeTab: 'pending',
    department: '',
    searchQuery: '',
    pagination: { currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 },
    tendersLoading: false,

    officers: [],
    officersLoading: false,

    auditLogs: [],
    auditLogsLoading: false,
    auditLogFilter: '',

    awards: [],
    awardsLoading: false,

    notifications: [],
    notificationSummary: null,
    notificationsLoading: false,

    kpiSummary: null,
    kpiReport: null,
    kpiLoading: false,

    registrations: [],
    registrationsLoading: false,

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
        // API not connected yet — will silently fail
        set({ tenders: [] });
      } finally {
        set({ tendersLoading: false });
      }
    },

    // ── Fetch Officers ─────────────────────────────────────────
    fetchOfficers: async (department, search) => {
      set({ officersLoading: true });
      try {
        const data = await api.fetchOfficers(department, search);
        set({ officers: data });
      } catch {
        set({ officers: [] });
      } finally {
        set({ officersLoading: false });
      }
    },

    // ── Fetch Audit Logs ───────────────────────────────────────
    fetchAuditLogs: async () => {
      const { auditLogFilter, pagination } = get();
      set({ auditLogsLoading: true });
      try {
        const result = await api.fetchAuditLogs(
          auditLogFilter || undefined,
          pagination.currentPage,
          pagination.pageSize,
        );
        set({ auditLogs: result.data, pagination: result.pagination });
      } catch {
        set({ auditLogs: [] });
      } finally {
        set({ auditLogsLoading: false });
      }
    },

    setAuditLogFilter: (tenderId) => set({ auditLogFilter: tenderId }),

    // ── Fetch Awards ───────────────────────────────────────────
    fetchAwards: async () => {
      const { department, pagination } = get();
      set({ awardsLoading: true });
      try {
        const result = await api.fetchRecentAwards(
          department || undefined,
          pagination.currentPage,
          pagination.pageSize,
        );
        set({ awards: result.data, pagination: result.pagination });
      } catch {
        set({ awards: [] });
      } finally {
        set({ awardsLoading: false });
      }
    },

    // ── Notifications ──────────────────────────────────────────
    fetchNotifications: async (search, type, status) => {
      set({ notificationsLoading: true });
      try {
        const data = await api.fetchDashboardNotifications(search, type, status);
        set({ notifications: data });
      } catch {
        set({ notifications: [] });
      } finally {
        set({ notificationsLoading: false });
      }
    },

    fetchNotificationSummary: async () => {
      try {
        const data = await api.fetchNotificationSummary();
        set({ notificationSummary: data });
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
        await api.markAllNotificationsRead();
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

    // ── Registration ───────────────────────────────────────────
    fetchRegistrations: async (department, search) => {
      set({ registrationsLoading: true });
      try {
        const data = await api.fetchRegistrations(department, search);
        set({ registrations: data });
      } catch {
        set({ registrations: [] });
      } finally {
        set({ registrationsLoading: false });
      }
    },

    acceptRegistration: async (id) => {
      try {
        await api.acceptRegistration(id);
        set((state) => ({
          registrations: state.registrations.filter((r) => r.id !== id),
        }));
        get().showToast('success', 'Registration accepted successfully.');
      } catch {
        get().showToast('error', 'Failed to accept registration.');
      }
    },

    deleteRegistration: async (id) => {
      try {
        await api.deleteRegistration(id);
        set((state) => ({
          registrations: state.registrations.filter((r) => r.id !== id),
        }));
        get().showToast('success', 'Registration deleted.');
      } catch {
        get().showToast('error', 'Failed to delete registration.');
      }
    },

    // ── Tender Actions ─────────────────────────────────────────
    approveTender: async (id) => {
      try {
        await api.approveTender(id);
        get().showToast('success', 'Tender Approved Successfully.');
        get().closeModal();
        get().fetchTenders();
      } catch {
        get().showToast('error', 'Failed to approve tender.');
      }
    },

    rejectTender: async (id, reason) => {
      try {
        await api.rejectTender(id, reason);
        get().showToast('success', 'Tender Rejected Successfully.');
        get().closeModal();
        get().fetchTenders();
      } catch {
        get().showToast('error', 'Failed to reject tender.');
      }
    },

    assignOfficers: async (tenderId, assignments) => {
      try {
        await api.assignOfficers(tenderId, assignments);
        get().showToast(
          'success',
          `Officer Assigned Successfully.\nTender ID ${tenderId}.`,
        );
        get().closeModal();
      } catch {
        get().showToast('error', 'Failed to assign officers.');
      }
    },

    // ── UI ─────────────────────────────────────────────────────
    showToast: (type, message, actionLabel) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      set((state) => ({
        toasts: [...state.toasts, { id, type, message, actionLabel }],
      }));
      // auto-dismiss after 5s
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
export const selectDashboardTenders = (s: OfficerDashboardState) => s.tenders;
export const selectActiveTab = (s: OfficerDashboardState) => s.activeTab;
export const selectDepartment = (s: OfficerDashboardState) => s.department;
export const selectDashboardPagination = (s: OfficerDashboardState) => s.pagination;
export const selectKpiSummary = (s: OfficerDashboardState) => s.kpiSummary;
export const selectToasts = (s: OfficerDashboardState) => s.toasts;
export const selectActiveModal = (s: OfficerDashboardState) => s.activeModal;
export const selectModalData = (s: OfficerDashboardState) => s.modalData;
