// ─── CAO Dashboard Types ────────────────────────────────

export type OfficerTenderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'awarded'
  | 'awaiting_officer_assignment';

export type TenderTab =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'recent-awards';

// ── Dashboard Tender (officer view) ──────────────────────────
export interface DashboardTender {
  id: string;
  tenderNumber?: string;
  title: string;
  category: string;
  type: string;
  closingDate: string;
  score: number | null;
  status: OfficerTenderStatus;
  department: string;
  estimatedBudget: number;
  description?: string;
  timeRemaining?: string;
  smeIndicator?: boolean;
  createdBy?: string;
  createdByRole?: string;
  createdByEmail?: string;
  rejectionReason?: string;
}

// ── Officer ──────────────────────────────────────────────────
export interface Officer {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  age: number;
  designation: string;
  department: string;
  avatarUrl?: string;
}

// ── Recommendation (kept for future backend development) ─────
export interface Recommendation {
  tenderId: string;
  bidderName: string;
  bidId: string;
  category: string;
  recommendedValue: number;
  justification: string;
  finalScore: number;
  technicalScore: number;
  financialScore: number;
  rank: number;
  isTopRanked: boolean;
}

// ── Approval Timeline ────────────────────────────────────────
export type ApprovalStatus = 'completed' | 'pending';

export interface ApprovalStep {
  role: string;
  label: string;
  status: ApprovalStatus;
  timestamp?: string;
}

// ── Award (kept for future backend development) ──────────────
export interface Award {
  id: string;
  tenderId: string;
  tenderTitle: string;
  awardedVendor: string;
  awardValue: number;
  awardDate: string;
  status: string;
  createdBy?: string;
  createdByRole?: string;
  createdByEmail?: string;
}

// ── Audit Log (kept for compatibility) ───────────────────────
export interface AuditLogEntry {
  id: string;
  tenderId: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  role: string;
  timestamp: string;
  ipAddress: string;
}

// ── Dashboard Notification ───────────────────────────────────
export type DashboardNotificationType =
  | 'tender_submitted'
  | 'officer_registered'
  | 'recommendation_received'
  | 'awards_notification';

export type DashboardNotificationStatus =
  | 'info'
  | 'success'
  | 'warning'
  | 'pending';

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: DashboardNotificationType;
  status: DashboardNotificationStatus;
  time: string;
  isRead: boolean;
  targetId?: string;
}

export interface NotificationSummary {
  unread: number;
  totalToday: number;
  pendingActions: number;
}

// ── KPI ──────────────────────────────────────────────────────
export interface KpiSummary {
  activeTenders: number;
  activeTendersChange: number;
  awardedTenders: number;
  awardedTendersChange: number;
  avgCycleTime: number;
  avgCycleTimeChange: number;
  smeParticipation: number;
  smeParticipationChange: number;
}

export interface KpiReportData {
  cycleTimeTrend: { label: string; value: number }[];
  smeParticipationPercent: number;
  awardValueTrend: { label: string; value: number }[];
  activeTendersTrend: { label: string; value: number }[];
  summary: {
    avgCycleTime: string;
    smeParticipation: string;
    totalAwardValue: string;
    totalAwards: number;
    activeTenders: number;
  };
}

// ── Registration Request ─────────────────────────────────────
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegistrationRequest {
  officerId: string;
  registrationReference: string;
  status: RegistrationStatus;
  procuringEntityType: string;
  headDesignation: string;
  organizationName: string;
  address?: {
    country: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  personalLandPhone: string;
  officialEmail: string;
  businessRegistrationNumber?: string;
  vatRegistrationNumber?: string;
  liaisonOfficer?: {
    title: string;
    name: string;
    designation: string;
    nic: string;
    mobile: string;
    email: string;
  };
  termsAccepted: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Toast ────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  action?: string;
  actionLabel?: string;
}

// ── Pagination ───────────────────────────────────────────────
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}
