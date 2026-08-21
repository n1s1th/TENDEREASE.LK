// ─── Tender Types — mirrors backend TenderDetailsDTO ─────────────────────────

export type TenderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "PENDING_OPENING"
  | "OPEN"
  | "EVALUATION"
  | "AWARDED"
  | "NO_BID"
  | "CLOSED"
  | "CANCELLED";

export type TimelineEventType =
  | "CREATED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "OPENED"
  | "EVALUATION_STARTED"
  | "AWARDED"
  | "NO_BID"
  | "CLOSED"
  | "CANCELLED"
  | "AMENDED";

export interface TimelineEvent {
  eventType: TimelineEventType;
  description: string;
  timestamp: string;
}

export interface TenderDocument {
  id: string;
  documentName: string;
  documentType: string;
  downloadUrl: string;
  version: number;
  fileSizeBytes?: number;
  uploadedAt?: string;
}

export interface TenderAddendum {
  id: number;
  amendmentNumber: number;
  title: string;
  description: string;
  changeNote?: string;
  documentName?: string;
  version?: number;
  downloadUrl?: string;
  newClosingDate?: string;
  createdAt: string;
}

export interface TenderClarification {
  id: number;
  question: string;
  answer?: string;
  askedAt: string;
  answeredAt?: string;
}

export interface TenderContact {
  officerName: string;
  designation: string;
  email: string;
  phone: string;
}

export interface TenderDetailsDTO {
  id: string;
  tenderNumber: string;
  title: string;
  description?: string;
  projectOverview?: string;
  scopeOfWork?: string;
  specialRequirements?: string;
  dynamicData?: Record<string, unknown>;

  estimatedBudget?: number;

  ministryId?: number;
  ministryName?: string;
  departmentId?: number;
  departmentName?: string;
  fundingSourceId?: number;
  fundingSourceName?: string;

  procurementType?: string;
  biddingMethod?: string;
  tenderType?: string;
  status?: TenderStatus;

  openingDate?: string;
  closingDate?: string;
  createdAt?: string;
  updatedAt?: string;
  timeRemaining?: number;

  // Tab data
  documents: TenderDocument[];
  addenda: TenderAddendum[];
  clarifications: TenderClarification[];
  timeline: TimelineEvent[];
  contacts: TenderContact[];
}

/** Legacy alias – keep for any code still importing `Tender` */
export type Tender = TenderDetailsDTO;

export interface TenderFilter {
  category?: string;
  status?: TenderStatus;
  search?: string;
  minValue?: number;
  maxValue?: number;
}
