-- TenderEase Database Schema
-- Vendor Registration Tables

CREATE TABLE IF NOT EXISTS vendor (
    id BIGSERIAL PRIMARY KEY,
    business_registration_authority VARCHAR(100) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    business_registration_no VARCHAR(100) NOT NULL UNIQUE,
    type_of_organization VARCHAR(50) NOT NULL,
    registered_address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    website VARCHAR(500),
    official_email VARCHAR(255) NOT NULL,
    official_telephone VARCHAR(50) NOT NULL,
    nic_passport VARCHAR(100) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    mobile_phone VARCHAR(50) NOT NULL,
    officer_email VARCHAR(255) NOT NULL,
    business_registration_document_path VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_other_documents (
    vendor_id BIGINT NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    document_path VARCHAR(1000) NOT NULL
);
