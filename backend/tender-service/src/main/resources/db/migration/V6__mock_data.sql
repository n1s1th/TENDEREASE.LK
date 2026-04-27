-- V6: Insert mock tender data for development
-- Standardized on singular table names and matching schema from V3

-- ══════════════════════════════════════════════════════════════════════════
-- TENDERS
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender (
    id, tender_number, title, description,
    project_overview, scope_of_work, special_requirements,
    procurement_type, bidding_method, tender_type,
    ministry_id, department_id, estimated_budget,
    status, opening_date, closing_date,
    created_at, updated_at
)
VALUES
(gen_random_uuid(), 'TND-001', 'Road Construction Project', 'Build highways',
 'National highway upgrade', 'Design + Build', 'ISO certified contractors',
 'GOODS', 'NCB', 'OPEN_TENDER', 4, 7, 5000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '10 days',
 NOW(), NOW()),

(gen_random_uuid(), 'TND-002', 'Hospital Equipment Supply', 'Supply ICU equipment',
 'Upgrade hospitals', 'Supply & Install', 'Medical certification required',
 'WORKS', 'ICB', 'OPEN_TENDER', 1, 1, 3000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '8 days',
 NOW(), NOW()),

(gen_random_uuid(), 'TND-003', 'School Building Project', 'Construct school buildings',
 'Education infrastructure', 'Full construction', 'Experience required',
 'WORKS', 'NCB', 'OPEN_TENDER', 2, 3, 7000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '12 days',
 NOW(), NOW()),

(gen_random_uuid(), 'TND-004', 'IT System Development', 'Develop e-government system',
 'Digital transformation', 'Development + Deployment', 'Agile experience',
 'SERVICES', 'NCB', 'OPEN_TENDER', 1, 2, 2000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '6 days',
 NOW(), NOW());

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER DOCUMENTS
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender_document (
  tender_id, document_name, document_type, s3_key, file_size_bytes, mime_type, uploaded_at
)
SELECT
  t.id,
  'Tender Specification Document',
  'SPECIFICATION',
  'docs/spec-' || t.tender_number || '.pdf',
  1024576,
  'application/pdf',
  NOW()
FROM tender t;

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER AMENDMENTS
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender_amendment (
    tender_id, amendment_number, title, description,
    version, previous_closing_date, new_closing_date, created_at
)
SELECT
    t.id,
    1,
    'Deadline Extension',
    'Closing date extended due to public holidays',
    1,
    t.closing_date,
    t.closing_date + INTERVAL '2 days',
    NOW()
FROM tender t;

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER CLARIFICATIONS
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender_clarification (
    tender_id, question, asked_by, asked_at, is_public, bidder_email
)
SELECT
    t.id,
    'Is it possible to submit the bid via email?',
    101,
    NOW() - INTERVAL '1 day',
    true,
    'bidder' || t.tender_number || '@example.com'
FROM tender t;

-- ══════════════════════════════════════════════════════════════════════════
-- CLARIFICATION RESPONSES
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO clarification_response (
    clarification_id, response, responded_by, responded_at
)
SELECT
    c.id,
    'No, all bids must be submitted through the portal.',
    1,
    NOW()
FROM tender_clarification c;

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER TIMELINE
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender_timeline (
    tender_id, event_type, description, timestamp
)
SELECT
    t.id,
    'PUBLISHED',
    'Tender successfully published to public portal',
    t.created_at
FROM tender t;

-- ══════════════════════════════════════════════════════════════════════════
-- TENDER CONTACTS
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO tender_contact (
    tender_id, officer_name, designation, email, phone
)
SELECT 
    t.id,
    'Mr. Damith Perera',
    'Senior Procurement Officer',
    'damith@tenderease.lk',
    '0112345678'
FROM tender t;