-- ============================================================
-- TENDER EASE - CLARIFICATIONS & ADDENDA MODULE
-- Module Owner: K. G. U. Mihiranga (234129P)
-- ============================================================

-- Enable UUID generation (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CLARIFICATION TABLE
-- ============================================================

CREATE TABLE Clarification (
    Clarification_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,
    VendorID UUID NOT NULL,

    Question_Text TEXT NOT NULL,

    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING | ANSWERED | REJECTED | EXPIRED

    Is_Published BOOLEAN DEFAULT FALSE,
    Is_Anonymous BOOLEAN DEFAULT TRUE,

    Submitted_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Clarification_Deadline TIMESTAMP,

    CONSTRAINT fk_clarification_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_clarification_vendor
        FOREIGN KEY (VendorID)
        REFERENCES Vendor(VendorID)
        ON DELETE CASCADE
);

-- ============================================================
-- 2. CLARIFICATION_REPLY TABLE
-- ============================================================

CREATE TABLE Clarification_Reply (
    Reply_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Clarification_ID UUID NOT NULL,
    Officer_ID UUID NOT NULL,

    Answer_Text TEXT NOT NULL,

    Published BOOLEAN DEFAULT FALSE,

    Replied_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reply_clarification
        FOREIGN KEY (Clarification_ID)
        REFERENCES Clarification(Clarification_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_reply_officer
        FOREIGN KEY (Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 3. ADDENDUM TABLE
-- ============================================================

CREATE TABLE Addendum (
    Addendum_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,
    Officer_ID UUID NOT NULL,

    Title VARCHAR(255) NOT NULL,
    Description TEXT,

    Version_Number INTEGER NOT NULL,

    Document_URL TEXT NOT NULL,
    Document_Hash VARCHAR(255) NOT NULL,

    Is_Locked BOOLEAN DEFAULT FALSE,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addendum_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_addendum_officer
        FOREIGN KEY (Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 4. ADDENDUM VERSION HISTORY TABLE
-- ============================================================

CREATE TABLE Addendum_Version (
    Version_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Addendum_ID UUID NOT NULL,

    Version_Number INTEGER NOT NULL,

    Document_URL TEXT NOT NULL,
    Document_Hash VARCHAR(255) NOT NULL,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_version_addendum
        FOREIGN KEY (Addendum_ID)
        REFERENCES Addendum(Addendum_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 5. NOTIFICATION TABLE
-- ============================================================

CREATE TABLE Notification (
    Notification_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID,
    VendorID UUID,
    Officer_ID UUID,

    Type VARCHAR(50) NOT NULL,
    -- CLARIFICATION_SUBMITTED
    -- CLARIFICATION_ANSWERED
    -- ADDENDUM_PUBLISHED

    Message TEXT NOT NULL,

    Is_Read BOOLEAN DEFAULT FALSE,

    Sent_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_vendor
        FOREIGN KEY (VendorID)
        REFERENCES Vendor(VendorID)
        ON DELETE SET NULL,

    CONSTRAINT fk_notification_officer
        FOREIGN KEY (Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE SET NULL
);

-- ============================================================
-- 6. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE Audit_Log (
    Log_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Entity_Type VARCHAR(50) NOT NULL,
    -- CLARIFICATION
    -- REPLY
    -- ADDENDUM
    -- VERSION

    Entity_ID UUID NOT NULL,

    Action_Type VARCHAR(50) NOT NULL,
    -- CREATED
    -- UPDATED
    -- PUBLISHED
    -- LOCKED
    -- DELETED

    Performed_By UUID NOT NULL,

    Old_Value JSONB,
    New_Value JSONB,

    Action_Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_officer
        FOREIGN KEY (Performed_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- INDEXES (Performance Optimization)
-- ============================================================

CREATE INDEX idx_clarification_tender ON Clarification(Tender_Id);
CREATE INDEX idx_clarification_vendor ON Clarification(VendorID);
CREATE INDEX idx_addendum_tender ON Addendum(Tender_Id);
CREATE INDEX idx_notification_vendor ON Notification(VendorID);
CREATE INDEX idx_audit_entity ON Audit_Log(Entity_Type, Entity_ID);

-- ============================================================
-- END OF MODULE SCHEMA
-- ============================================================
