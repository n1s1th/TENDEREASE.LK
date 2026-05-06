-- ============================================================
-- V2: Officer Registration Tables
-- TenderEase E-Procurement System
-- Service: Officer Registration (user-service)
-- Database: tenderease_user_db
-- ============================================================

-- Sequence for generating officer registration reference IDs (OFF-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS officer_ref_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Sequence for generating error support IDs (ERR-REG-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS officer_support_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ============================================================
-- Officers table (main aggregate)
-- ============================================================
CREATE TABLE officers (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Procuring Entity Info
    procuring_entity_type       VARCHAR(255)    NOT NULL,
    head_designation            VARCHAR(255)    NOT NULL,
    organization_name           VARCHAR(255),
    -- Embedded Address
    country                     VARCHAR(100),
    street_line_1               VARCHAR(255),
    street_line_2               VARCHAR(255),
    city                        VARCHAR(100),
    province                    VARCHAR(100),
    postal_code                 VARCHAR(20),
    -- Contact Info
    personal_land_phone         VARCHAR(20)     NOT NULL,
    official_email              VARCHAR(255)    NOT NULL,
    -- Business Info
    business_registration_number VARCHAR(100),
    vat_registration_number     VARCHAR(100),
    -- System Fields
    registration_reference      VARCHAR(30)     UNIQUE,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    keycloak_user_id            VARCHAR(255),
    terms_accepted              BOOLEAN         DEFAULT FALSE,
    -- Audit fields (from BaseEntity)
    created_at                  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    -- Constraints
    CONSTRAINT uq_officer_email      UNIQUE (official_email),
    CONSTRAINT chk_officer_status    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Indexes for performance
CREATE INDEX idx_officer_email      ON officers (official_email);
CREATE INDEX idx_officer_reference  ON officers (registration_reference);
CREATE INDEX idx_officer_status     ON officers (status);

-- ============================================================
-- Liaison Officers table
-- ============================================================
CREATE TABLE liaison_officers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id      UUID            NOT NULL,
    title           VARCHAR(20)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    designation     VARCHAR(255),
    nic             VARCHAR(20)     NOT NULL,
    mobile          VARCHAR(20)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    -- Audit fields (from BaseEntity)
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    -- Constraints
    CONSTRAINT uq_liaison_nic           UNIQUE (nic),
    CONSTRAINT fk_liaison_officer       FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_liaison_nic        ON liaison_officers (nic);
CREATE INDEX idx_liaison_officer_id ON liaison_officers (officer_id);

-- ============================================================
-- Registration Audits table
-- ============================================================
CREATE TABLE registration_audits (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id    VARCHAR(30),
    status          VARCHAR(50)     NOT NULL,
    error_message   TEXT,
    support_id      VARCHAR(30),
    action          VARCHAR(50)     NOT NULL,
    -- Audit fields (from BaseEntity)
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_audit_reference_id ON registration_audits (reference_id);
CREATE INDEX idx_audit_support_id   ON registration_audits (support_id);
