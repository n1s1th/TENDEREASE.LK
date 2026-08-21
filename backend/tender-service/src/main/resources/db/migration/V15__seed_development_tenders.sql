-- V15: Seed mock tenders for development and testing

-- Insert tenders (using distinct UUIDs so they can be re-run safely if needed)
INSERT INTO tender (
    id, tender_number, title, description,
    project_overview, scope_of_work, special_requirements,
    procurement_type, bidding_method, tender_type,
    ministry_id, department_id, estimated_budget,
    status, opening_date, closing_date,
    created_at, updated_at, sme_indicator
)
VALUES
('a0000000-0000-0000-0000-000000000001', 'TND-001', 'Road Construction Project', 'Build highways and connect cities with a modern transit network.',
 'National highway upgrade', 'Design + Build', 'ISO certified contractors, previous work experience of at least 5 years.',
 'GOODS', 'NCB', 'OPEN_TENDER', 4, 7, 5000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '10 days',
 NOW(), NOW(), FALSE),

('a0000000-0000-0000-0000-000000000002', 'TND-002', 'Hospital Equipment Supply', 'Supply state-of-the-art ICU equipment and medical ventilators.',
 'Upgrade hospitals', 'Supply & Install', 'Medical certification required, FDA/CE approval needed.',
 'WORKS', 'ICB', 'OPEN_TENDER', 1, 1, 3000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '8 days',
 NOW(), NOW(), TRUE),

('a0000000-0000-0000-0000-000000000003', 'TND-003', 'School Building Project', 'Construct new primary school buildings with classroom facilities.',
 'Education infrastructure', 'Full construction', 'Experience required in public infrastructure projects.',
 'WORKS', 'NCB', 'OPEN_TENDER', 2, 3, 7000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '12 days',
 NOW(), NOW(), FALSE),

('a0000000-0000-0000-0000-000000000004', 'TND-004', 'IT System Development', 'Develop e-government digital signature and portal system.',
 'Digital transformation', 'Development + Deployment', 'Agile experience, Kubernetes/Spring Boot expertise.',
 'SERVICES', 'NCB', 'OPEN_TENDER', 1, 2, 2000000,
 'PUBLISHED', NOW(), NOW() + INTERVAL '6 days',
 NOW(), NOW(), TRUE)
ON CONFLICT (tender_number) DO NOTHING;

-- Insert tender documents for the seeded tenders
INSERT INTO tender_document (
  tender_id, document_name, document_type, s3_key, file_size_bytes, mime_type, uploaded_at, created_at, updated_at
)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Tender Specification Document', 'SPECIFICATION', 'docs/spec-TND-001.pdf', 1024576, 'application/pdf', NOW(), NOW(), NOW()),
('a0000000-0000-0000-0000-000000000002', 'Tender Specification Document', 'SPECIFICATION', 'docs/spec-TND-002.pdf', 1024576, 'application/pdf', NOW(), NOW(), NOW()),
('a0000000-0000-0000-0000-000000000003', 'Tender Specification Document', 'SPECIFICATION', 'docs/spec-TND-003.pdf', 1024576, 'application/pdf', NOW(), NOW(), NOW()),
('a0000000-0000-0000-0000-000000000004', 'Tender Specification Document', 'SPECIFICATION', 'docs/spec-TND-004.pdf', 1024576, 'application/pdf', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert tender timelines
INSERT INTO tender_timeline (
    tender_id, event_type, description, timestamp
)
VALUES
('a0000000-0000-0000-0000-000000000001', 'PUBLISHED', 'Tender successfully published to public portal', NOW()),
('a0000000-0000-0000-0000-000000000002', 'PUBLISHED', 'Tender successfully published to public portal', NOW()),
('a0000000-0000-0000-0000-000000000003', 'PUBLISHED', 'Tender successfully published to public portal', NOW()),
('a0000000-0000-0000-0000-000000000004', 'PUBLISHED', 'Tender successfully published to public portal', NOW())
ON CONFLICT DO NOTHING;

-- Insert tender contacts
INSERT INTO tender_contact (
    tender_id, officer_name, designation, email, phone
)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Mr. Damith Perera', 'Senior Procurement Officer', 'damith@tenderease.lk', '0112345678'),
('a0000000-0000-0000-0000-000000000002', 'Mr. Damith Perera', 'Senior Procurement Officer', 'damith@tenderease.lk', '0112345678'),
('a0000000-0000-0000-0000-000000000003', 'Mr. Damith Perera', 'Senior Procurement Officer', 'damith@tenderease.lk', '0112345678'),
('a0000000-0000-0000-0000-000000000004', 'Mr. Damith Perera', 'Senior Procurement Officer', 'damith@tenderease.lk', '0112345678')
ON CONFLICT DO NOTHING;
