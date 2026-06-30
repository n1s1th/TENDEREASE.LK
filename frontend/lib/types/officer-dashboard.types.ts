// ─── Officer Dashboard Types ────────────────────────────────

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
  | 'cancelled'
  | 'recent-awards'
  | 'audit-logs';

// ── Dashboard Tender (officer view) ──────────────────────────
export interface DashboardTender {
  id: string;
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
  rejectionReason?: string;
  tenderNumber?: string;
  referenceNumber?: string;
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

// ── Recommendation ───────────────────────────────────────────
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

// ── Award ────────────────────────────────────────────────────
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
}

// ── Audit Log ────────────────────────────────────────────────
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
  | 'award_letter_generated'
  | 'regret_email_failed'
  | 'regret_letters_sent'
  | 'vendor_notified'
  | 'clarification_received'
  | 'general';

export type DashboardNotificationStatus =
  | 'pdf_generated'
  | 'failed'
  | 'sent'
  | 'pending';

export interface DashboardNotification {
  id: string;
  tenderId: string;
  title: string;
  message: string;
  type: DashboardNotificationType;
  status: DashboardNotificationStatus;
  recipients?: string;
  recipientCount?: number;
  failedCount?: number;
  sentCount?: number;
  time: string;
  performedBy: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface NotificationSummary {
  unread: number;
  failedDeliveries: number;
  awardLettersGenerated: number;
  date: string;
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
  summary: {
    avgCycleTime: string;
    smeParticipation: string;
    totalAwardValue: string;
    totalAwards: number;
  };
}

// ── Registration Request ─────────────────────────────────────
export interface RegistrationRequest {
  id: string;
  name: string;
  designation: string;
  email: string;
  description: string;
  department: string;
  avatarUrl?: string;
}

// ── Assigned Officer ─────────────────────────────────────────
export interface AssignedOfficer {
  id: string;
  name: string;
  designation: string;
  email: string;
  role?: string;
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

// ── Clarification ────────────────────────────────────────────
export interface ClarificationItem {
  id: number;
  tenderId: string;
  tenderTitle?: string;
  tenderNumber?: string;
  question: string;
  answer?: string | null;
  askedAt: string;
  answeredAt?: string | null;
  bidderEmail?: string;
  category?: string;
  department?: string;
  closingDate?: string;
}

// ── Procument ────────────────────────────────────────────────
export interface Procument {
  id: string;
  title: string;
  description: string;
  procuringEntity: string;
  department: string;
  category: string;
  method: string;
}

// ── Pagination ───────────────────────────────────────────────
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}
