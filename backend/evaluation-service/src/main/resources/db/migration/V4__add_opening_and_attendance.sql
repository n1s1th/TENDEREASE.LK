-- V2: Add Bid Opening and Committee tables

CREATE TABLE opening_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    scheduled_opening_time TIMESTAMP NOT NULL,
    actual_opening_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    opened_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opening_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opening_session_id UUID NOT NULL REFERENCES opening_session(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    attendance_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (opening_session_id, officer_id)
);

CREATE TABLE evaluation_committee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE committee_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES evaluation_committee(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL,
    officer_name VARCHAR(255),
    role VARCHAR(20) NOT NULL, -- CHAIR, MEMBER, SECRETARIAT, OBSERVER
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (committee_id, officer_id)
);

CREATE INDEX idx_opening_session_tender ON opening_session(tender_id);
CREATE INDEX idx_opening_attendance_session ON opening_attendance(opening_session_id);
CREATE INDEX idx_evaluation_committee_tender ON evaluation_committee(tender_id);
CREATE INDEX idx_committee_member_committee ON committee_member(committee_id);
