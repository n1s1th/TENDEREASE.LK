-- V12: Add historical mock tenders for reporting trend analysis
INSERT INTO tender (
    id, tender_number, title, description,
    procurement_type, bidding_method, tender_type,
    ministry_id, department_id, estimated_budget,
    status, opening_date, closing_date,
    created_at, updated_at
)
VALUES
-- Jan
(gen_random_uuid(), 'TND-HIST-001', 'Jan Tender 1', 'Jan project', 'GOODS', 'NCB', 'OPEN_TENDER', 1, 1, 1000000, 'PUBLISHED', '2026-01-15', '2026-01-25', '2026-01-10', '2026-01-10'),
-- Feb
(gen_random_uuid(), 'TND-HIST-002', 'Feb Tender 1', 'Feb project', 'WORKS', 'NCB', 'OPEN_TENDER', 2, 3, 2000000, 'PUBLISHED', '2026-02-15', '2026-02-25', '2026-02-10', '2026-02-10'),
(gen_random_uuid(), 'TND-HIST-003', 'Feb Tender 2', 'Feb project', 'SERVICES', 'NCB', 'OPEN_TENDER', 1, 2, 1500000, 'PUBLISHED', '2026-02-16', '2026-02-26', '2026-02-11', '2026-02-11'),
-- Mar
(gen_random_uuid(), 'TND-HIST-004', 'Mar Tender 1', 'Mar project', 'GOODS', 'NCB', 'OPEN_TENDER', 4, 7, 3000000, 'PUBLISHED', '2026-03-15', '2026-03-25', '2026-03-10', '2026-03-10'),
(gen_random_uuid(), 'TND-HIST-005', 'Mar Tender 2', 'Mar project', 'WORKS', 'NCB', 'OPEN_TENDER', 5, 10, 4000000, 'PUBLISHED', '2026-03-20', '2026-03-30', '2026-03-12', '2026-03-12');
