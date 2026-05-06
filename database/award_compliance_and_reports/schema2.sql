-- ============================================================
-- TENDEREASE.LK - RECOMMENDATION, APPROVALS, AWARD & KPI MODULE
-- Module Owner: Tamasha
-- Database: PostgreSQL 16+
-- References (from core schema):
--   Tender(Tender_Id), Vendor(VendorID), Officer(Officer_ID), user_role ENUM
-- ============================================================

-- Core already enables these, but keeping is safe:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 0: ENUM TYPES (safe create)
-- ============================================================

DO $$
BEGIN
    CREATE TYPE recommendation_status AS ENUM (
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'AWARD_PROCESSING',
        'COMPLETED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE approval_decision AS ENUM (
        'PENDING',
        'APPROVED',
        'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE award_status AS ENUM (
        'GENERATED',
        'SENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE award_notification_type AS ENUM (
        'WINNER',
        'REGRET'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'PENDING',
        'SENT',
        'FAILED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- SECTION 1: RECOMMENDATION NOTE
-- ============================================================

CREATE TABLE IF NOT EXISTS Recommendation (
    Recommendation_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,
    Created_By UUID NOT NULL,            -- Officer who creates the note

    Selected_VendorID UUID NOT NULL,     -- Winning vendor (recommended)

    Final_Score NUMERIC(6,2),
    Award_Value DECIMAL(15,2),
    Justification TEXT,

    Status recommendation_status NOT NULL DEFAULT 'DRAFT',
    Rejection_Reason TEXT,

    Submitted_At TIMESTAMP,
    Approved_At TIMESTAMP,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendation_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_creator
        FOREIGN KEY (Created_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_recommendation_selected_vendor
        FOREIGN KEY (Selected_VendorID)
        REFERENCES Vendor(VendorID)
        ON DELETE RESTRICT
);

CREATE OR REPLACE FUNCTION update_recommendation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.Updated_At = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recommendation_updated_at ON Recommendation;
CREATE TRIGGER trg_recommendation_updated_at
BEFORE UPDATE ON Recommendation
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_updated_at();


-- ============================================================
-- SECTION 2: RECOMMENDATION ATTACHMENTS (optional supporting docs)
-- ============================================================

CREATE TABLE IF NOT EXISTS Recommendation_Document (
    Document_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Recommendation_ID UUID NOT NULL,

    File_Name VARCHAR(255) NOT NULL,
    Document_URL TEXT NOT NULL,           
    Document_Hash VARCHAR(255),           
    Mime_Type VARCHAR(50),
    File_Size BIGINT,

    Uploaded_By UUID NOT NULL,
    Uploaded_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recdoc_recommendation
        FOREIGN KEY (Recommendation_ID)
        REFERENCES Recommendation(Recommendation_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_recdoc_officer
        FOREIGN KEY (Uploaded_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT
);


-- ============================================================
-- SECTION 3: APPROVAL CHAIN DEFINITION
-- ============================================================

CREATE TABLE IF NOT EXISTS Approval_Workflow (
    Workflow_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Workflow_Name VARCHAR(150) NOT NULL,
    Is_Active BOOLEAN NOT NULL DEFAULT TRUE,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Approval_Stage (
    Stage_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Workflow_ID UUID NOT NULL,

    Stage_Name VARCHAR(120) NOT NULL,      -- e.g., "Technical Head", "CAO"
    Stage_Order INTEGER NOT NULL,          
    Role_Required user_role NOT NULL,     

    Is_Required BOOLEAN NOT NULL DEFAULT TRUE,
    Is_Active BOOLEAN NOT NULL DEFAULT TRUE,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stage_workflow
        FOREIGN KEY (Workflow_ID)
        REFERENCES Approval_Workflow(Workflow_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_stage_order
        UNIQUE (Workflow_ID, Stage_Order)
);

-- Map each tender to a workflow 
CREATE TABLE IF NOT EXISTS Tender_Approval_Workflow (
    Tender_Id UUID PRIMARY KEY,
    Workflow_ID UUID NOT NULL,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_taw_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_taw_workflow
        FOREIGN KEY (Workflow_ID)
        REFERENCES Approval_Workflow(Workflow_ID)
        ON DELETE RESTRICT
);


-- ============================================================
-- SECTION 4: APPROVAL TIMELINE (per stage decision tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS Recommendation_Approval (
    Approval_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Recommendation_ID UUID NOT NULL,
    Stage_ID UUID NOT NULL,

    Decision approval_decision NOT NULL DEFAULT 'PENDING',
    Comments TEXT,

    Approved_By UUID,                     
    Decided_At TIMESTAMP,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recapproval_recommendation
        FOREIGN KEY (Recommendation_ID)
        REFERENCES Recommendation(Recommendation_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_recapproval_stage
        FOREIGN KEY (Stage_ID)
        REFERENCES Approval_Stage(Stage_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_recapproval_officer
        FOREIGN KEY (Approved_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT,

    CONSTRAINT uq_rec_stage
        UNIQUE (Recommendation_ID, Stage_ID)
);


-- ============================================================
-- SECTION 5: AWARD LETTER GENERATION
-- ============================================================

CREATE TABLE IF NOT EXISTS Award_Letter (
    Award_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Recommendation_ID UUID NOT NULL UNIQUE,
    Tender_Id UUID NOT NULL,              
    Letter_Subject VARCHAR(255),
    Letter_Content TEXT,                  

    PDF_Path TEXT,                        

    Generated_By UUID NOT NULL,           
    Generated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    Sent_To_Winner_At TIMESTAMP,
    Status award_status NOT NULL DEFAULT 'GENERATED',

    CONSTRAINT fk_award_recommendation
        FOREIGN KEY (Recommendation_ID)
        REFERENCES Recommendation(Recommendation_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_award_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_award_generator
        FOREIGN KEY (Generated_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT
);


-- ============================================================
-- SECTION 6: WINNER + REGRET NOTIFICATIONS (delivery logs)
-- ============================================================

CREATE TABLE IF NOT EXISTS Award_Notification (
    Notification_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Award_ID UUID NOT NULL,
    Tender_Id UUID NOT NULL,
    VendorID UUID NOT NULL,

    Notification_Type award_notification_type NOT NULL,  
    Delivery_Method VARCHAR(10) NOT NULL,                
    Delivery_Status delivery_status NOT NULL DEFAULT 'PENDING',

    Subject VARCHAR(255),
    Message TEXT,

    Sent_At TIMESTAMP,
    Failure_Reason TEXT,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_awnotif_award
        FOREIGN KEY (Award_ID)
        REFERENCES Award_Letter(Award_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_awnotif_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_awnotif_vendor
        FOREIGN KEY (VendorID)
        REFERENCES Vendor(VendorID)
        ON DELETE RESTRICT,

    CONSTRAINT chk_delivery_method
        CHECK (Delivery_Method IN ('EMAIL','SMS'))
);


-- ============================================================
-- SECTION 7: AUDIT LOG (module-specific)
-- ============================================================

CREATE TABLE IF NOT EXISTS Audit_Log_AwardModule (
    Log_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Entity_Type VARCHAR(60) NOT NULL,
    -- RECOMMENDATION | RECOMMENDATION_DOCUMENT | APPROVAL_STAGE | RECOMMENDATION_APPROVAL
    -- AWARD_LETTER | AWARD_NOTIFICATION | KPI

    Entity_ID UUID NOT NULL,

    Action_Type VARCHAR(60) NOT NULL,
    -- CREATED | UPDATED | SUBMITTED | APPROVED | REJECTED | PDF_GENERATED | SENT | RESENT | FAILED

    Performed_By UUID NOT NULL,           -- Officer who performed action

    Old_Value JSONB,
    New_Value JSONB,

    Action_Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_awardmodule_officer
        FOREIGN KEY (Performed_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT
);


-- ============================================================
-- SECTION 8: KPI VIEW (for dashboards)
-- ============================================================

CREATE OR REPLACE VIEW v_award_kpis AS
SELECT
    t.Tender_Id,
    t.Tender_Reference,
    t.Title,
    r.Recommendation_ID,
    r.Award_Value,

    -- Cycle time in days (from submission deadline to approval)
    CASE
        WHEN r.Approved_At IS NULL THEN NULL
        ELSE EXTRACT(EPOCH FROM (r.Approved_At - t.Submission_Deadline)) / 86400.0
    END AS Cycle_Time_Days,

    -- SME indicator for the selected vendor (0/1)
    CASE
        WHEN v.Vendor_Category ILIKE 'SME' THEN 1
        ELSE 0
    END AS Selected_Vendor_Is_SME,

    r.Approved_At,
    a.Generated_At,
    a.Status AS Award_Status
FROM Tender t
JOIN Recommendation r ON r.Tender_Id = t.Tender_Id
LEFT JOIN Award_Letter a ON a.Recommendation_ID = r.Recommendation_ID
JOIN Vendor v ON v.VendorID = r.Selected_VendorID;


-- ============================================================
-- SECTION 9: INDEXES (Performance Optimization)
-- ============================================================

-- Recommendation
CREATE INDEX IF NOT EXISTS idx_recommendation_tender ON Recommendation(Tender_Id);
CREATE INDEX IF NOT EXISTS idx_recommendation_status ON Recommendation(Status);
CREATE INDEX IF NOT EXISTS idx_recommendation_creator ON Recommendation(Created_By);

-- Documents
CREATE INDEX IF NOT EXISTS idx_recdoc_recommendation ON Recommendation_Document(Recommendation_ID);

-- Approval chain
CREATE INDEX IF NOT EXISTS idx_stage_workflow_order ON Approval_Stage(Workflow_ID, Stage_Order);
CREATE INDEX IF NOT EXISTS idx_recapproval_recommendation ON Recommendation_Approval(Recommendation_ID);
CREATE INDEX IF NOT EXISTS idx_recapproval_decision ON Recommendation_Approval(Decision);

-- Awards & notifications
CREATE INDEX IF NOT EXISTS idx_award_tender ON Award_Letter(Tender_Id);
CREATE INDEX IF NOT EXISTS idx_awnotif_award_status ON Award_Notification(Award_ID, Delivery_Status);
CREATE INDEX IF NOT EXISTS idx_awnotif_vendor ON Award_Notification(VendorID);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_award_entity ON Audit_Log_AwardModule(Entity_Type, Entity_ID);

-- ============================================================
-- END OF MODULE SCHEMA
-- ============================================================
