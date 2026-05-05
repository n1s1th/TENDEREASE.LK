-- V9: Remove all mock data inserted by V6
-- This cleans up the database to only show real tenders created by users.

-- Delete in reverse dependency order to avoid FK violations

DELETE FROM clarification_response
WHERE clarification_id IN (
    SELECT c.id FROM tender_clarification c
    JOIN tender t ON c.tender_id = t.id
    WHERE t.tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender_clarification
WHERE tender_id IN (
    SELECT id FROM tender WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender_contact
WHERE tender_id IN (
    SELECT id FROM tender WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender_timeline
WHERE tender_id IN (
    SELECT id FROM tender WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender_amendment
WHERE tender_id IN (
    SELECT id FROM tender WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender_document
WHERE tender_id IN (
    SELECT id FROM tender WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004')
);

DELETE FROM tender
WHERE tender_number IN ('TND-001', 'TND-002', 'TND-003', 'TND-004');
