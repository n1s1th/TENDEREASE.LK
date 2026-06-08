export type OpeningStatus = 'SCHEDULED' | 'PENDING_OPENING' | 'OPEN' | 'CLOSED';

export interface OpeningSession {
    id: string;
    tenderId: string;
    scheduledOpeningTime: string;
    actualOpeningTime?: string;
    bidSubmissionDeadline?: string;
    status: OpeningStatus;
    openedBy?: string;
    attendanceCount?: number;
}

export interface OpeningAttendance {
    id: string;
    officerId: string;
    officerName: string;
    designation: string;
    email: string;
    attendanceTime: string;
    organisation?: string;
    role?: string;
}

export interface OpeningAttendanceRequest {
    officerId: string;
    officerName: string;
    designation: string;
    email: string;
    organisation?: string;
    role?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
