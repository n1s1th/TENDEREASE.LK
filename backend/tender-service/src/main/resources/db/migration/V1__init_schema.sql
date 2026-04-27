-- Create enum types
CREATE TYPE procurement_method AS ENUM ('NCB', 'ICB', 'RFQ');
CREATE TYPE tender_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CLOSED', 'CANCELLED');
CREATE TYPE document_type AS ENUM ('SPECIFICATION', 'TERMS', 'DRAWING', 'OTHER');
CREATE TYPE timeline_event_type AS ENUM ('CREATED', 'PUBLISHED', 'AMENDED', 'CLOSED');

-- Create tender_categories table
CREATE TABLE tender_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id BIGINT,
    FOREIGN KEY (parent_category_id) REFERENCES tender_categories(id)
);

-- Create tenders table
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    tender_number VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    special_requirements TEXT,
    project_overview TEXT,
    scope_of_work TEXT,
    procurement_method procurement_method,
    status tender_status,
    estimated_budget DECIMAL(19,2),
    opening_date TIMESTAMP WITHOUT TIME ZONE,
    closing_date TIMESTAMP WITHOUT TIME ZONE,
    department_name VARCHAR(255),
    procuring_entity_id BIGINT
);

-- Create tender_documents table
CREATE TABLE tender_documents (
    id BIGSERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_type document_type,
    s3_key VARCHAR(500),
    version INTEGER,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE,
    tender_id UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);

-- Create tender_amendments table
CREATE TABLE tender_amendments (
    id BIGSERIAL PRIMARY KEY,
    amendment_number INTEGER,
    title VARCHAR(255),
    description TEXT,
    version INTEGER,
    previous_closing_date TIMESTAMP WITHOUT TIME ZONE,
    new_closing_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    tender_id UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);

-- Create tender_clarifications table
CREATE TABLE tender_clarifications (
    id BIGSERIAL PRIMARY KEY,
    question TEXT,
    asked_by BIGINT,
    asked_at TIMESTAMP WITHOUT TIME ZONE,
    is_public BOOLEAN,
    tender_id UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);

-- Create clarification_responses table
CREATE TABLE clarification_responses (
    id BIGSERIAL PRIMARY KEY,
    response TEXT,
    responded_by BIGINT,
    responded_at TIMESTAMP WITHOUT TIME ZONE,
    clarification_id BIGINT,
    FOREIGN KEY (clarification_id) REFERENCES tender_clarifications(id)
);

-- Create tender_timeline table
CREATE TABLE tender_timeline (
    id BIGSERIAL PRIMARY KEY,
    event_type timeline_event_type,
    description VARCHAR(500),
    timestamp TIMESTAMP WITHOUT TIME ZONE,
    tender_id UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);

-- Create tender_contacts table
CREATE TABLE tender_contacts (
    id BIGSERIAL PRIMARY KEY,
    officer_name VARCHAR(255),
    designation VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    tender_id UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id)
);