-- V3: Create core tender domain tables (CLEAN VERSION)

-- Drop existing tables to ensure a clean start for the tender domain
DROP TABLE IF EXISTS clarification_response CASCADE;
DROP TABLE IF EXISTS tender_clarification CASCADE;
DROP TABLE IF EXISTS tender_amendment CASCADE;
DROP TABLE IF EXISTS tender_compliance_checklist CASCADE;
DROP TABLE IF EXISTS tender_schedule CASCADE;
DROP TABLE IF EXISTS tender_document CASCADE;
DROP TABLE IF EXISTS tender_timeline CASCADE;
DROP TABLE IF EXISTS tender_contact CASCADE;
DROP TABLE IF EXISTS tender_category CASCADE;
DROP TABLE IF EXISTS tender CASCADE;

-- Also drop old plural tables from V1 if they exist
DROP TABLE IF EXISTS clarification_responses CASCADE;
DROP TABLE IF EXISTS tender_clarifications CASCADE;
DROP TABLE IF EXISTS tender_amendments CASCADE;
DROP TABLE IF EXISTS tender_documents CASCADE;
DROP TABLE IF EXISTS tender_contacts CASCADE;
DROP TABLE IF EXISTS tenders CASCADE;
DROP TABLE IF EXISTS tender_categories CASCADE;

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER CATEGORY
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_category (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    parent_category_id  BIGINT REFERENCES tender_category(id)
);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER (main entity)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender (
    id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_number     VARCHAR(50)     NOT NULL UNIQUE,
    title             VARCHAR(500)    NOT NULL,
    description       TEXT,
    project_overview  TEXT,
    scope_of_work     TEXT,
    special_requirements TEXT,
    procurement_type  VARCHAR(30)     NOT NULL,
    bidding_method    VARCHAR(10)     NOT NULL,
    tender_type       VARCHAR(30)     NOT NULL,
    ministry_id       BIGINT          NOT NULL REFERENCES ministry(id),
    department_id     BIGINT          NOT NULL REFERENCES department(id),
    estimated_budget  DECIMAL(18,2)   NOT NULL,
    funding_source_id BIGINT          REFERENCES funding_source(id),
    status            VARCHAR(30)     NOT NULL DEFAULT 'DRAFT',
    opening_date      TIMESTAMP,
    closing_date      TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(255),
    updated_by        VARCHAR(255)
);

CREATE INDEX idx_tender_status ON tender(status);
CREATE INDEX idx_tender_ministry_id ON tender(ministry_id);
CREATE INDEX idx_tender_department_id ON tender(department_id);

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
    version           INTEGER,
    template_version  VARCHAR(20),
    uploaded_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(255),
    updated_by        VARCHAR(255)
);

CREATE INDEX idx_tender_document_tender_id ON tender_document(tender_id);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER SCHEDULE (1:1)
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

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER COMPLIANCE CHECKLIST (1:1)
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

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER AMENDMENTS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_amendment (
    id                      BIGSERIAL PRIMARY KEY,
    tender_id               UUID      NOT NULL REFERENCES tender(id) ON DELETE CASCADE,
    amendment_number        INTEGER,
    title                   VARCHAR(255),
    description             TEXT,
    version                 INTEGER,
    previous_closing_date   TIMESTAMP,
    new_closing_date        TIMESTAMP,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER CLARIFICATIONS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_clarification (
    id          BIGSERIAL PRIMARY KEY,
    tender_id   UUID      NOT NULL REFERENCES tender(id) ON DELETE CASCADE,
    question    TEXT,
    asked_by    BIGINT,
    asked_at    TIMESTAMP,
    is_public   BOOLEAN
);

-- ══════════════════════════════════════════════════════════════════════════
-- CLARIFICATION RESPONSES
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE clarification_response (
    id                  BIGSERIAL PRIMARY KEY,
    clarification_id    BIGINT REFERENCES tender_clarification(id) ON DELETE CASCADE,
    response            TEXT,
    responded_by        BIGINT,
    responded_at        TIMESTAMP
);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER TIMELINE
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_timeline (
    id          BIGSERIAL PRIMARY KEY,
    tender_id   UUID REFERENCES tender(id) ON DELETE CASCADE,
    event_type  VARCHAR(50),
    description VARCHAR(500),
    timestamp   TIMESTAMP
);

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER CONTACTS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE tender_contact (
    id              BIGSERIAL PRIMARY KEY,
    tender_id       UUID REFERENCES tender(id) ON DELETE CASCADE,
    officer_name    VARCHAR(255),
    designation     VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(50)
);