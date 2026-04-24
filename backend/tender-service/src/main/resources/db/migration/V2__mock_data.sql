-- Insert tenders
INSERT INTO tenders (
    id, tender_number, title, description,
    special_requirements, project_overview, scope_of_work,
    procurement_method, status,
    estimated_budget, opening_date, closing_date,
    department_name, procuring_entity_id,
    created_at, updated_at
)
VALUES
(gen_random_uuid(), 'TND-001', 'Road Construction Project', 'Build highways',
 'ISO certified contractors', 'National highway upgrade', 'Design + Build',
 'ICB', 'PUBLISHED', 5000000, NOW(), NOW() + INTERVAL '10 days',
 'Ministry of Transport', 1, NOW(), NOW()),

(gen_random_uuid(), 'TND-002', 'Hospital Equipment Supply', 'Supply ICU equipment',
 'Medical certification required', 'Upgrade hospitals', 'Supply & Install',
 'NCB', 'PUBLISHED', 3000000, NOW(), NOW() + INTERVAL '8 days',
 'Ministry of Health', 2, NOW(), NOW()),

(gen_random_uuid(), 'TND-003', 'School Building Project', 'Construct school buildings',
 'Experience required', 'Education infrastructure', 'Full construction',
 'ICB', 'PUBLISHED', 7000000, NOW(), NOW() + INTERVAL '12 days',
 'Ministry of Education', 3, NOW(), NOW()),

(gen_random_uuid(), 'TND-004', 'IT System Development', 'Develop e-government system',
 'Agile experience', 'Digital transformation', 'Development + Deployment',
 'RFQ', 'PUBLISHED', 2000000, NOW(), NOW() + INTERVAL '6 days',
 'ICTA', 4, NOW(), NOW());

-- Documents
INSERT INTO tender_documents (
  tender_id, document_name, document_type, version, uploaded_at
)
SELECT
  t.id,
  'Tender Spec',
  'SPECIFICATION',
  1,
  NOW()
FROM tenders t;

-- Amendments
INSERT INTO tender_amendments (
    tender_id, amendment_number, title, description,
    version, previous_closing_date, new_closing_date, created_at
)
SELECT
    t.id,
    1,
    'Deadline Extended',
    'Closing date extended',
    1,
    t.closing_date,
    t.closing_date + INTERVAL '2 days',
    NOW()
FROM tenders t;

-- Clarifications
INSERT INTO tender_clarifications (
    tender_id, question, asked_by, asked_at, is_public
)
SELECT
    t.id,
    'Can deadline be extended?',
    1,
    NOW(),
    true
FROM tenders t;

-- Clarification responses
INSERT INTO clarification_responses (
    clarification_id, response, responded_by, responded_at
)
SELECT
    c.id,
    'Yes, extended by 2 days',
    1,
    NOW()
FROM tender_clarifications c;

-- Timeline
INSERT INTO tender_timeline (
    tender_id, event_type, description, timestamp
)
SELECT
    t.id,
    'PUBLISHED',
    'Tender published',
    NOW()
FROM tenders t;

-- Contacts
INSERT INTO tender_contacts (
    tender_id, officer_name, designation, email, phone
)
SELECT 
    t.id,
    'John Perera',
    'Procurement Officer',
    'john@gov.lk',
    '0771234567'
FROM tenders t;