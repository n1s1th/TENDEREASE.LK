-- V2: Create core tender tables
-- Tender, TenderDocument, TenderSchedule, TenderComplianceChecklist

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER (main entity)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender (
    id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_number     VARCHAR(50)     NOT NULL UNIQUE,
    title             VARCHAR(500)    NOT NULL,
    description       TEXT,
    procurement_type  VARCHAR(30)     NOT NULL,
    bidding_method    VARCHAR(10)     NOT NULL,
    tender_type       VARCHAR(30)     NOT NULL,
    ministry_id       BIGINT          NOT NULL REFERENCES ministry(id),
    department_id     BIGINT          NOT NULL REFERENCES department(id),
    estimated_budget  DECIMAL(18,2)   NOT NULL,
    funding_source_id BIGINT          REFERENCES funding_source(id),
    status            VARCHAR(30)     NOT NULL DEFAULT 'DRAFT',
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(255),
    updated_by        VARCHAR(255)
);

CREATE INDEX idx_tender_status ON tender(status);
CREATE INDEX idx_tender_ministry_id ON tender(ministry_id);
CREATE INDEX idx_tender_department_id ON tender(department_id);
CREATE UNIQUE INDEX idx_tender_number ON tender(tender_number);
CREATE INDEX idx_tender_created_by ON tender(created_by);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER DOCUMENT
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_document (
    id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id         UUID            NOT NULL REFERENCES tender(id) ON DELETE CASCADE,
    sbd_template_id   BIGINT          REFERENCES sbd_template(id),
    document_name     VARCHAR(255)    NOT NULL,
    document_type     VARCHAR(30)     NOT NULL,
    s3_key            VARCHAR(1000)   NOT NULL,
    file_size_bytes   BIGINT          NOT NULL,
    mime_type         VARCHAR(100)    NOT NULL,
    template_version  VARCHAR(20),
    uploaded_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(255),
    updated_by        VARCHAR(255)
);

CREATE INDEX idx_tender_document_tender_id ON tender_document(tender_id);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER SCHEDULE (one-to-one with Tender)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_schedule (
    id                         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id                  UUID      NOT NULL UNIQUE REFERENCES tender(id) ON DELETE CASCADE,
    advertisement_start_date   DATE      NOT NULL,
    bid_submission_deadline    DATE      NOT NULL,
    pre_bid_meeting_enabled    BOOLEAN   NOT NULL DEFAULT false,
    pre_bid_meeting_date       DATE,
    pre_bid_meeting_time       TIME,
    created_at                 TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by                 VARCHAR(255),
    updated_by                 VARCHAR(255)
);

CREATE UNIQUE INDEX idx_tender_schedule_tender_id ON tender_schedule(tender_id);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER COMPLIANCE CHECKLIST (one-to-one with Tender)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_compliance_checklist (
    id                                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id                         UUID      NOT NULL UNIQUE REFERENCES tender(id) ON DELETE CASCADE,
    procurement_plan_approved         BOOLEAN   NOT NULL DEFAULT false,
    budget_availability_confirmed     BOOLEAN   NOT NULL DEFAULT false,
    sbds_compliant_with_guidelines    BOOLEAN   NOT NULL DEFAULT false,
    evaluation_criteria_defined       BOOLEAN   NOT NULL DEFAULT false,
    created_at                        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                        TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by                        VARCHAR(255),
    updated_by                        VARCHAR(255)
);

CREATE UNIQUE INDEX idx_tender_compliance_checklist_tender_id ON tender_compliance_checklist(tender_id);
