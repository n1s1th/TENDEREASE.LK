-- ============================================================
-- TENDEREASE.LK - CORE DATABASE SCHEMA
-- Version: 1.0
-- Database: PostgreSQL 16+
-- Description: Core schema for Tender Management System
-- ============================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "citext";    -- For case-insensitive text

-- ============================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- ============================================================

-- 1.1 USER ROLES ENUM TYPE
CREATE TYPE user_role AS ENUM (
    'VENDOR',
    'PROCUREMENT_OFFICER', 
    'ADMIN',
    'EVALUATOR',
    'APPROVER'
);

-- 1.2 USER TABLE (Base table for all users)
CREATE TABLE "User" (
    User_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Email CITEXT UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    
    Role user_role NOT NULL,
    
    Is_Active BOOLEAN DEFAULT TRUE,
    Is_Verified BOOLEAN DEFAULT FALSE,
    
    Last_Login TIMESTAMP,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_email_format CHECK (Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 1.3 VENDOR TABLE (Extends User for vendors/suppliers)
CREATE TABLE Vendor (
    VendorID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID UUID NOT NULL UNIQUE,
    
    Company_Name VARCHAR(255) NOT NULL,
    Registration_Number VARCHAR(100) UNIQUE NOT NULL,
    
    Contact_Person VARCHAR(255) NOT NULL,
    Phone_Number VARCHAR(20) NOT NULL,
    Address TEXT,
    
    Tax_ID VARCHAR(50),
    Bank_Account_Number VARCHAR(50),
    Bank_Name VARCHAR(100),
    
    Vendor_Category VARCHAR(100),
    Certification_Level VARCHAR(50),
    
    Is_Blacklisted BOOLEAN DEFAULT FALSE,
    Blacklist_Reason TEXT,
    
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vendor_user
        FOREIGN KEY (User_ID)
        REFERENCES "User"(User_ID)
        ON DELETE CASCADE
);

-- 1.4 OFFICER TABLE (Extends User for procurement officers)
CREATE TABLE Officer (
    Officer_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID UUID NOT NULL UNIQUE,
    
    Full_Name VARCHAR(255) NOT NULL,
    Employee_ID VARCHAR(50) UNIQUE NOT NULL,
    
    Department VARCHAR(100) NOT NULL,
    Position VARCHAR(100) NOT NULL,
    
    Phone_Number VARCHAR(20),
    Office_Location VARCHAR(255),
    
    Authority_Level VARCHAR(50),
    
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_officer_user
        FOREIGN KEY (User_ID)
        REFERENCES "User"(User_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- SECTION 2: CPV (COMMON PROCUREMENT VOCABULARY) HIERARCHY
-- ============================================================

-- 2.1 CPV CODE TABLE (Hierarchical classification system)
CREATE TABLE CPV_Code (
    CPV_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    CPV_Code VARCHAR(20) UNIQUE NOT NULL,
    -- Format: XXXXX000-Y (8 digits + check digit)
    -- Example: 45000000-7 (Construction work)
    
    Description TEXT NOT NULL,
    
    Level INTEGER NOT NULL,
    -- 1: Division (2 digits)
    -- 2: Group (3 digits)
    -- 3: Class (4 digits)
    -- 4: Category (5 digits)
    -- 5: Subcategory (8 digits)
    
    Parent_CPV_ID UUID,
    
    Is_Active BOOLEAN DEFAULT TRUE,
    
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cpv_parent
        FOREIGN KEY (Parent_CPV_ID)
        REFERENCES CPV_Code(CPV_ID)
        ON DELETE SET NULL,
    
    CONSTRAINT chk_cpv_level CHECK (Level BETWEEN 1 AND 5),
    CONSTRAINT chk_cpv_code_format CHECK (CPV_Code ~* '^[0-9]{8}-[0-9]$')
);

-- ============================================================
-- SECTION 3: TENDER CORE ENTITY
-- ============================================================

-- 3.1 TENDER STATUS ENUM
CREATE TYPE tender_status AS ENUM (
    'DRAFT',              -- Initial creation
    'PENDING_APPROVAL',   -- Submitted for approval
    'APPROVED',           -- Approved for publication
    'PUBLISHED',          -- Active and accepting bids
    'CLARIFICATION',      -- In clarification period
    'SUBMISSION_CLOSED',  -- Bid submission closed
    'UNDER_EVALUATION',   -- Bids being evaluated
    'AWARDED',            -- Contract awarded
    'CANCELLED',          -- Tender cancelled
    'SUSPENDED',          -- Temporarily suspended
    'COMPLETED'           -- Fully completed
);

-- 3.2 PROCUREMENT METHOD ENUM
CREATE TYPE procurement_method AS ENUM (
    'OPEN_TENDER',
    'RESTRICTED_TENDER',
    'TWO_STAGE_TENDER',
    'REQUEST_FOR_QUOTATION',
    'DIRECT_PROCUREMENT',
    'FRAMEWORK_AGREEMENT'
);

-- 3.3 TENDER TABLE (Core tender entity)
CREATE TABLE Tender (
    Tender_Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    Tender_Reference VARCHAR(100) UNIQUE NOT NULL,
    Title VARCHAR(500) NOT NULL,
    Description TEXT NOT NULL,
    
    -- Procurement Details
    Procurement_Method procurement_method NOT NULL,
    Procurement_Entity VARCHAR(255) NOT NULL,
    
    -- Status Management
    Status tender_status NOT NULL DEFAULT 'DRAFT',
    
    -- CPV Classification
    Primary_CPV_ID UUID NOT NULL,
    
    -- Financial Information
    Estimated_Value DECIMAL(15, 2),
    Currency VARCHAR(3) DEFAULT 'LKR',
    Budget_Code VARCHAR(50),
    
    -- Timeline
    Publication_Date TIMESTAMP,
    Submission_Deadline TIMESTAMP NOT NULL,
    Clarification_Deadline TIMESTAMP,
    Opening_Date TIMESTAMP,
    
    -- Bid Details
    Bid_Security_Amount DECIMAL(15, 2),
    Bid_Security_Type VARCHAR(50),
    Bid_Validity_Days INTEGER DEFAULT 90,
    
    -- Contract Information
    Contract_Duration_Days INTEGER,
    Contract_Start_Date DATE,
    
    -- Document Requirements
    Eligibility_Criteria TEXT,
    Evaluation_Criteria TEXT,
    Technical_Requirements TEXT,
    
    -- Officers
    Created_By UUID NOT NULL,
    Approved_By UUID,
    
    -- Flags
    Is_Published BOOLEAN DEFAULT FALSE,
    Is_Urgent BOOLEAN DEFAULT FALSE,
    Allow_Late_Submission BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Published_At TIMESTAMP,
    Cancelled_At TIMESTAMP,
    Completed_At TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_tender_cpv
        FOREIGN KEY (Primary_CPV_ID)
        REFERENCES CPV_Code(CPV_ID)
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_tender_created_by
        FOREIGN KEY (Created_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_tender_approved_by
        FOREIGN KEY (Approved_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE SET NULL,
    
    CONSTRAINT chk_currency_code CHECK (LENGTH(Currency) = 3),
    CONSTRAINT chk_submission_deadline CHECK (Submission_Deadline > Created_At),
    CONSTRAINT chk_clarification_before_submission CHECK (
        Clarification_Deadline IS NULL OR 
        Clarification_Deadline < Submission_Deadline
    ),
    CONSTRAINT chk_estimated_value CHECK (Estimated_Value IS NULL OR Estimated_Value > 0),
    CONSTRAINT chk_bid_validity CHECK (Bid_Validity_Days > 0)
);

-- 3.4 TENDER CPV MAPPING TABLE (Many-to-Many for multiple CPV codes)
CREATE TABLE Tender_CPV (
    Mapping_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Tender_Id UUID NOT NULL,
    CPV_ID UUID NOT NULL,
    
    Is_Primary BOOLEAN DEFAULT FALSE,
    
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tender_cpv_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_tender_cpv_code
        FOREIGN KEY (CPV_ID)
        REFERENCES CPV_Code(CPV_ID)
        ON DELETE CASCADE,
    
    CONSTRAINT uq_tender_cpv UNIQUE (Tender_Id, CPV_ID)
);

-- 3.5 TENDER STATUS HISTORY TABLE (Track status changes)
CREATE TABLE Tender_Status_History (
    History_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Tender_Id UUID NOT NULL,
    
    Previous_Status tender_status,
    New_Status tender_status NOT NULL,
    
    Changed_By UUID NOT NULL,
    Change_Reason TEXT,
    
    Changed_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_status_history_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_status_history_officer
        FOREIGN KEY (Changed_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT
);

-- ============================================================
-- SECTION 4: DOCUMENT MANAGEMENT WITH VERSIONING
-- ============================================================

-- 4.1 DOCUMENT TYPE ENUM
CREATE TYPE document_type AS ENUM (
    'TENDER_NOTICE',
    'TECHNICAL_SPECIFICATION',
    'BID_DOCUMENT',
    'TERMS_CONDITIONS',
    'CLARIFICATION',
    'ADDENDUM',
    'EVALUATION_REPORT',
    'AWARD_NOTICE',
    'CONTRACT',
    'OTHER'
);

-- 4.2 DOCUMENT TABLE (Core document entity with versioning)
CREATE TABLE Document (
    Document_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Tender_Id UUID NOT NULL,
    
    -- Document Metadata
    Document_Type document_type NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    
    -- File Information
    File_Name VARCHAR(255) NOT NULL,
    File_Path TEXT NOT NULL,
    File_Size BIGINT NOT NULL, -- Size in bytes
    File_Type VARCHAR(50) NOT NULL, -- MIME type
    
    -- Security & Integrity
    File_Hash VARCHAR(255) NOT NULL, -- SHA-256 hash
    Is_Encrypted BOOLEAN DEFAULT FALSE,
    
    -- Versioning
    Version_Number INTEGER NOT NULL DEFAULT 1,
    Is_Latest_Version BOOLEAN DEFAULT TRUE,
    Parent_Document_ID UUID, -- References previous version
    
    -- Access Control
    Is_Public BOOLEAN DEFAULT FALSE,
    Requires_Authentication BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    Uploaded_By UUID NOT NULL,
    
    -- Status
    Is_Active BOOLEAN DEFAULT TRUE,
    Is_Archived BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Archived_At TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_document_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_document_parent
        FOREIGN KEY (Parent_Document_ID)
        REFERENCES Document(Document_ID)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_document_uploaded_by
        FOREIGN KEY (Uploaded_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT,
    
    CONSTRAINT chk_file_size CHECK (File_Size > 0),
    CONSTRAINT chk_version_number CHECK (Version_Number > 0)
);

-- 4.3 DOCUMENT VERSION HISTORY TABLE
CREATE TABLE Document_Version_History (
    Version_History_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Document_ID UUID NOT NULL,
    
    Version_Number INTEGER NOT NULL,
    
    -- Snapshot of file at this version
    File_Path TEXT NOT NULL,
    File_Hash VARCHAR(255) NOT NULL,
    File_Size BIGINT NOT NULL,
    
    Change_Description TEXT,
    
    Created_By UUID NOT NULL,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_version_document
        FOREIGN KEY (Document_ID)
        REFERENCES Document(Document_ID)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_doc_version_creator
        FOREIGN KEY (Created_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT,
    
    CONSTRAINT uq_document_version UNIQUE (Document_ID, Version_Number)
);

-- 4.4 DOCUMENT ACCESS LOG TABLE (Track downloads/views)
CREATE TABLE Document_Access_Log (
    Access_Log_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    Document_ID UUID NOT NULL,
    
    Accessed_By UUID NOT NULL, -- User_ID
    Access_Type VARCHAR(20) NOT NULL, -- VIEW, DOWNLOAD
    
    IP_Address INET,
    User_Agent TEXT,
    
    Accessed_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_access_document
        FOREIGN KEY (Document_ID)
        REFERENCES Document(Document_ID)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_doc_access_user
        FOREIGN KEY (Accessed_By)
        REFERENCES "User"(User_ID)
        ON DELETE CASCADE,
    
    CONSTRAINT chk_access_type CHECK (Access_Type IN ('VIEW', 'DOWNLOAD'))
);

-- ============================================================
-- SECTION 5: PERFORMANCE OPTIMIZATION - INDEXES
-- ============================================================

-- User indexes
CREATE INDEX idx_user_email ON "User"(Email);
CREATE INDEX idx_user_role ON "User"(Role);
CREATE INDEX idx_user_active ON "User"(Is_Active);

-- Vendor indexes
CREATE INDEX idx_vendor_user ON Vendor(User_ID);
CREATE INDEX idx_vendor_company ON Vendor(Company_Name);
CREATE INDEX idx_vendor_registration ON Vendor(Registration_Number);
CREATE INDEX idx_vendor_blacklist ON Vendor(Is_Blacklisted);

-- Officer indexes
CREATE INDEX idx_officer_user ON Officer(User_ID);
CREATE INDEX idx_officer_employee ON Officer(Employee_ID);
CREATE INDEX idx_officer_department ON Officer(Department);

-- CPV indexes
CREATE INDEX idx_cpv_code ON CPV_Code(CPV_Code);
CREATE INDEX idx_cpv_parent ON CPV_Code(Parent_CPV_ID);
CREATE INDEX idx_cpv_level ON CPV_Code(Level);
CREATE INDEX idx_cpv_active ON CPV_Code(Is_Active);

-- Tender indexes
CREATE INDEX idx_tender_reference ON Tender(Tender_Reference);
CREATE INDEX idx_tender_status ON Tender(Status);
CREATE INDEX idx_tender_cpv ON Tender(Primary_CPV_ID);
CREATE INDEX idx_tender_created_by ON Tender(Created_By);
CREATE INDEX idx_tender_publication_date ON Tender(Publication_Date);
CREATE INDEX idx_tender_submission_deadline ON Tender(Submission_Deadline);
CREATE INDEX idx_tender_is_published ON Tender(Is_Published);
CREATE INDEX idx_tender_procurement_method ON Tender(Procurement_Method);
CREATE INDEX idx_tender_created_at ON Tender(Created_At);

-- Tender CPV mapping indexes
CREATE INDEX idx_tender_cpv_mapping_tender ON Tender_CPV(Tender_Id);
CREATE INDEX idx_tender_cpv_mapping_cpv ON Tender_CPV(CPV_ID);
CREATE INDEX idx_tender_cpv_primary ON Tender_CPV(Tender_Id, Is_Primary);

-- Tender status history indexes
CREATE INDEX idx_status_history_tender ON Tender_Status_History(Tender_Id);
CREATE INDEX idx_status_history_changed_at ON Tender_Status_History(Changed_At);

-- Document indexes
CREATE INDEX idx_document_tender ON Document(Tender_Id);
CREATE INDEX idx_document_type ON Document(Document_Type);
CREATE INDEX idx_document_uploaded_by ON Document(Uploaded_By);
CREATE INDEX idx_document_latest ON Document(Is_Latest_Version);
CREATE INDEX idx_document_public ON Document(Is_Public);
CREATE INDEX idx_document_created_at ON Document(Created_At);

-- Document version history indexes
CREATE INDEX idx_doc_version_document ON Document_Version_History(Document_ID);
CREATE INDEX idx_doc_version_number ON Document_Version_History(Document_ID, Version_Number);

-- Document access log indexes
CREATE INDEX idx_doc_access_document ON Document_Access_Log(Document_ID);
CREATE INDEX idx_doc_access_user ON Document_Access_Log(Accessed_By);
CREATE INDEX idx_doc_access_timestamp ON Document_Access_Log(Accessed_At);

-- ============================================================
-- SECTION 6: TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.Updated_At = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_updated_at
    BEFORE UPDATE ON Vendor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officer_updated_at
    BEFORE UPDATE ON Officer
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tender_updated_at
    BEFORE UPDATE ON Tender
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_updated_at
    BEFORE UPDATE ON Document
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECTION 7: VIEWS FOR COMMON QUERIES
-- ============================================================

-- 7.1 Active Tenders View
CREATE VIEW v_active_tenders AS
SELECT 
    t.Tender_Id,
    t.Tender_Reference,
    t.Title,
    t.Description,
    t.Status,
    t.Procurement_Method,
    t.Estimated_Value,
    t.Currency,
    t.Submission_Deadline,
    t.Publication_Date,
    cpv.CPV_Code,
    cpv.Description AS CPV_Description,
    o.Full_Name AS Created_By_Name,
    t.Created_At
FROM Tender t
JOIN CPV_Code cpv ON t.Primary_CPV_ID = cpv.CPV_ID
JOIN Officer o ON t.Created_By = o.Officer_ID
WHERE t.Status IN ('PUBLISHED', 'CLARIFICATION')
  AND t.Is_Published = TRUE
  AND t.Submission_Deadline > CURRENT_TIMESTAMP
ORDER BY t.Publication_Date DESC;

-- 7.2 Tender with Documents View
CREATE VIEW v_tender_documents AS
SELECT 
    t.Tender_Id,
    t.Tender_Reference,
    t.Title AS Tender_Title,
    d.Document_ID,
    d.Document_Type,
    d.Title AS Document_Title,
    d.Version_Number,
    d.Is_Latest_Version,
    d.File_Name,
    d.File_Size,
    d.Is_Public,
    d.Created_At
FROM Tender t
JOIN Document d ON t.Tender_Id = d.Tender_Id
WHERE d.Is_Active = TRUE
ORDER BY t.Tender_Reference, d.Document_Type, d.Version_Number DESC;

-- 7.3 CPV Hierarchy View
CREATE VIEW v_cpv_hierarchy AS
WITH RECURSIVE cpv_tree AS (
    -- Base case: top-level CPV codes
    SELECT 
        CPV_ID,
        CPV_Code,
        Description,
        Level,
        Parent_CPV_ID,
        CPV_Code::TEXT AS Path,
        Description::TEXT AS Full_Path
    FROM CPV_Code
    WHERE Parent_CPV_ID IS NULL AND Is_Active = TRUE
    
    UNION ALL
    
    -- Recursive case: child CPV codes
    SELECT 
        c.CPV_ID,
        c.CPV_Code,
        c.Description,
        c.Level,
        c.Parent_CPV_ID,
        ct.Path || ' > ' || c.CPV_Code,
        ct.Full_Path || ' > ' || c.Description
    FROM CPV_Code c
    JOIN cpv_tree ct ON c.Parent_CPV_ID = ct.CPV_ID
    WHERE c.Is_Active = TRUE
)
SELECT * FROM cpv_tree
ORDER BY Path;

-- ============================================================
-- SECTION 8: INITIAL DATA - SAMPLE CPV CODES
-- ============================================================

-- Insert top-level CPV divisions (Level 1)
INSERT INTO CPV_Code (CPV_Code, Description, Level, Parent_CPV_ID, Is_Active) VALUES
('03000000-1', 'Agricultural, farming, fishing, forestry and related products', 1, NULL, TRUE),
('09000000-3', 'Petroleum products, fuel, electricity and other sources of energy', 1, NULL, TRUE),
('15000000-8', 'Food, beverages, tobacco and related products', 1, NULL, TRUE),
('30000000-9', 'Office and computing machinery, equipment and supplies except furniture and software packages', 1, NULL, TRUE),
('31000000-6', 'Electrical machinery, apparatus, equipment and consumables; lighting', 1, NULL, TRUE),
('32000000-3', 'Radio, television, communication, telecommunication and related equipment', 1, NULL, TRUE),
('33000000-0', 'Medical equipments, pharmaceuticals and personal care products', 1, NULL, TRUE),
('34000000-7', 'Transport equipment and auxiliary products to transportation', 1, NULL, TRUE),
('35000000-4', 'Security, fire-fighting, police and defence equipment', 1, NULL, TRUE),
('39000000-2', 'Furniture (including office furniture), furnishings, domestic appliances (excl. lighting) and cleaning products', 1, NULL, TRUE),
('44000000-0', 'Construction structures and materials; auxiliary products to construction', 1, NULL, TRUE),
('45000000-7', 'Construction work', 1, NULL, TRUE),
('48000000-8', 'Software package and information systems', 1, NULL, TRUE),
('50000000-5', 'Repair and maintenance services', 1, NULL, TRUE),
('51000000-9', 'Installation services (except software)', 1, NULL, TRUE),
('55000000-0', 'Hotel, restaurant and retail trade services', 1, NULL, TRUE),
('60000000-8', 'Transport services (excl. waste transport)', 1, NULL, TRUE),
('63000000-9', 'Supporting and auxiliary transport services; travel agencies services', 1, NULL, TRUE),
('64000000-6', 'Postal and telecommunications services', 1, NULL, TRUE),
('65000000-3', 'Public utilities', 1, NULL, TRUE),
('66000000-0', 'Financial and insurance services', 1, NULL, TRUE),
('70000000-1', 'Real estate services', 1, NULL, TRUE),
('71000000-8', 'Architectural, construction, engineering and inspection services', 1, NULL, TRUE),
('72000000-5', 'IT services: consulting, software development, Internet and support', 1, NULL, TRUE),
('73000000-2', 'Research and development services and related consultancy services', 1, NULL, TRUE),
('75000000-6', 'Administration, defence and social security services', 1, NULL, TRUE),
('76000000-3', 'Services related to the oil and gas industry', 1, NULL, TRUE),
('77000000-0', 'Agricultural, forestry, horticultural, aquacultural and apicultural services', 1, NULL, TRUE),
('79000000-4', 'Business services: law, marketing, consulting, recruitment, printing and security', 1, NULL, TRUE),
('80000000-4', 'Education and training services', 1, NULL, TRUE),
('85000000-9', 'Health and social work services', 1, NULL, TRUE),
('90000000-7', 'Sewage, refuse, cleaning and environmental services', 1, NULL, TRUE),
('92000000-1', 'Recreational, cultural and sporting services', 1, NULL, TRUE),
('98000000-3', 'Other community, social and personal services', 1, NULL, TRUE);

-- ============================================================
-- END OF CORE SCHEMA
-- ============================================================

-- Schema validation comments
COMMENT ON TABLE "User" IS 'Base user table for authentication and role management';
COMMENT ON TABLE Vendor IS 'Vendor/Supplier profile extending User table';
COMMENT ON TABLE Officer IS 'Procurement officer profile extending User table';
COMMENT ON TABLE CPV_Code IS 'Common Procurement Vocabulary hierarchical classification';
COMMENT ON TABLE Tender IS 'Core tender entity with full lifecycle management';
COMMENT ON TABLE Tender_CPV IS 'Many-to-many mapping between Tenders and CPV codes';
COMMENT ON TABLE Tender_Status_History IS 'Audit trail for tender status changes';
COMMENT ON TABLE Document IS 'Document management with versioning support';
COMMENT ON TABLE Document_Version_History IS 'Historical versions of documents';
COMMENT ON TABLE Document_Access_Log IS 'Audit trail for document access';

-- Normalization Notes:
-- 1NF: All attributes contain atomic values, no repeating groups
-- 2NF: All non-key attributes fully depend on primary key
-- 3NF: No transitive dependencies, all attributes depend only on primary key
