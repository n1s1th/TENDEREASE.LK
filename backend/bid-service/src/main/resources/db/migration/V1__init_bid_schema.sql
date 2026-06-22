-- V1: Create bid table and seed sample data for Officer Dashboard

CREATE TABLE bid (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id       UUID            NOT NULL,
    bidder_name     VARCHAR(255)    NOT NULL,
    bidder_email    VARCHAR(255)    NOT NULL,
    company_name    VARCHAR(500),
    bid_amount      DECIMAL(18,2),
    currency        VARCHAR(10)     DEFAULT 'LKR',
    status          VARCHAR(30)     NOT NULL DEFAULT 'SUBMITTED',
    technical_score DECIMAL(8,2),
    financial_score DECIMAL(8,2),
    submitted_at    TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE INDEX idx_bid_tender_id ON bid(tender_id);
CREATE INDEX idx_bid_status ON bid(status);
CREATE INDEX idx_bid_bidder_email ON bid(bidder_email);

-- ═══════════════════════════════════════════════════════
-- SEED DATA: Sample bids linked to the officer dashboard tenders
-- Tender IDs match V12 in tender-service
-- ═══════════════════════════════════════════════════════

-- Bids for TND-2025-003 (OPEN tender - IT Consultancy)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, submitted_at)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'Amal Perera', 'amal@techsolutions.lk', 'TechSolutions Lanka Pvt Ltd', 32000000.00, 'SUBMITTED', NOW() - INTERVAL '1 day'),
    ('b1111111-1111-1111-1111-111111111111', 'Nimal Fernando', 'nimal@digitallk.com', 'Digital LK Holdings', 28500000.00, 'SUBMITTED', NOW() - INTERVAL '2 days'),
    ('b1111111-1111-1111-1111-111111111111', 'Suresh Kumar', 'suresh@infotech.lk', 'InfoTech Services Ltd', 34000000.00, 'SUBMITTED', NOW() - INTERVAL '3 days');

-- Bids for TND-2025-004 (OPEN tender - Medical Equipment)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, submitted_at)
VALUES
    ('b2222222-2222-2222-2222-222222222222', 'Dr. Kumari Silva', 'kumari@medequip.lk', 'MedEquip International', 82000000.00, 'SUBMITTED', NOW() - INTERVAL '1 day'),
    ('b2222222-2222-2222-2222-222222222222', 'Ranjith Wijesinghe', 'ranjith@healthsupply.lk', 'Health Supply Corp', 79000000.00, 'SUBMITTED', NOW() - INTERVAL '4 days');

-- Bids for TND-2025-005 (EVALUATION tender - Security Guards)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, technical_score, financial_score, submitted_at)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Ajith Bandara', 'ajith@safeguard.lk', 'SafeGuard Security Services', 16500000.00, 'EVALUATED', 78.50, 85.00, NOW() - INTERVAL '10 days'),
    ('c1111111-1111-1111-1111-111111111111', 'Priya Jayawardena', 'priya@shieldsec.lk', 'Shield Security Lanka', 17200000.00, 'EVALUATED', 82.00, 79.50, NOW() - INTERVAL '12 days'),
    ('c1111111-1111-1111-1111-111111111111', 'Dinesh Rajapaksa', 'dinesh@protectsec.lk', 'Protect & Serve Ltd', 15800000.00, 'EVALUATED', 71.00, 90.00, NOW() - INTERVAL '11 days');

-- Bids for TND-2025-006 (EVALUATION tender - Car Park)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, technical_score, submitted_at)
VALUES
    ('c2222222-2222-2222-2222-222222222222', 'Chaminda Peris', 'chaminda@buildright.lk', 'BuildRight Construction', 210000000.00, 'EVALUATED', 85.00, NOW() - INTERVAL '8 days'),
    ('c2222222-2222-2222-2222-222222222222', 'Lakshman De Silva', 'lakshman@megabuild.lk', 'MegaBuild Engineering', 225000000.00, 'EVALUATED', 88.50, NOW() - INTERVAL '9 days');

-- Bids for TND-2025-007 (EVALUATION tender - Lab Chemicals)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, submitted_at)
VALUES
    ('c3333333-3333-3333-3333-333333333333', 'Sanjay Patel', 'sanjay@chemlab.lk', 'ChemLab Suppliers', 7800000.00, 'SUBMITTED', NOW() - INTERVAL '15 days'),
    ('c3333333-3333-3333-3333-333333333333', 'Wasana Gunasekara', 'wasana@sciencesupply.lk', 'Science Supply Lanka', 8200000.00, 'SUBMITTED', NOW() - INTERVAL '18 days');

-- Bids for TND-2025-008 (AWARDED tender - Stationery)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, technical_score, financial_score, submitted_at)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'Malini Ratnayake', 'malini@stationery.lk', 'Lanka Stationery World', 4200000.00, 'AWARDED', 90.00, 92.00, NOW() - INTERVAL '35 days'),
    ('d1111111-1111-1111-1111-111111111111', 'Rohan Mendis', 'rohan@officesupply.lk', 'Office Supply Co', 4800000.00, 'REJECTED', 75.00, 70.00, NOW() - INTERVAL '36 days');

-- Bids for TND-2025-009 (AWARDED tender - Janitorial)
INSERT INTO bid (tender_id, bidder_name, bidder_email, company_name, bid_amount, status, technical_score, financial_score, submitted_at)
VALUES
    ('d2222222-2222-2222-2222-222222222222', 'Kamal Wickramasinghe', 'kamal@cleanpro.lk', 'CleanPro Services', 11000000.00, 'AWARDED', 88.00, 85.50, NOW() - INTERVAL '30 days'),
    ('d2222222-2222-2222-2222-222222222222', 'Sanduni Perera', 'sanduni@sparkle.lk', 'Sparkle Cleaning Solutions', 11500000.00, 'REJECTED', 72.00, 78.00, NOW() - INTERVAL '32 days');

-- No bids for TND-2025-010 (NO_BID tender) - intentionally empty
