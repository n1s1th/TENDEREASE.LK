export type OpeningStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';

export interface OpeningSession {
    id: string;
    tenderId: string;
    tenderTitle?: string;
    category?: string;
    division?: string;
    bidsCount?: number;
    scheduledOpeningTime: string;
    actualOpeningTime?: string;
    status: OpeningStatus;
    openedBy?: string;
}

export interface OpeningAttendance {
    id: string;
    officerId: string;
    officerName: string;
    designation: string;
    attendanceTime: string;
    organisation?: string;
    role?: string;
}

export interface OpeningAttendanceRequest {
    officerId: string;
    officerName: string;
    designation: string;
    organisation?: string;
    role?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
