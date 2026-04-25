-- V1: Create reference/lookup tables
-- Ministry, Department, FundingSource, SbdTemplate

-- ══════════════════════════════════════════════════════════════════════════
-- MINISTRY
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE ministry (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    code        VARCHAR(20)     NOT NULL UNIQUE
);

CREATE UNIQUE INDEX idx_ministry_code ON ministry(code);

-- ══════════════════════════════════════════════════════════════════════════
-- DEPARTMENT
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE department (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    ministry_id BIGINT          NOT NULL REFERENCES ministry(id) ON DELETE CASCADE
);

CREATE INDEX idx_department_ministry_id ON department(ministry_id);

-- ══════════════════════════════════════════════════════════════════════════
-- FUNDING SOURCE
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE funding_source (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    source_type VARCHAR(50)     NOT NULL
);

-- ══════════════════════════════════════════════════════════════════════════
-- SBD TEMPLATE (Standard Bidding Document)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE sbd_template (
    id                BIGSERIAL       PRIMARY KEY,
    name              VARCHAR(255)    NOT NULL,
    procurement_type  VARCHAR(30)     NOT NULL,
    version           VARCHAR(20)     NOT NULL,
    is_active         BOOLEAN         NOT NULL DEFAULT true
);
