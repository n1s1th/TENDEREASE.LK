-- V12: Seed Officer Dashboard sample tenders
-- These represent tenders that have been approved by the CAO
-- and are now in various stages of the officer's workflow.

-- We need ministry and department references. Let's check what exists.
-- Based on V5__seed_reference_data.sql, we expect ministry id=1, department id=1 to exist.

INSERT INTO tender (id, tender_number, title, description, procurement_type, bidding_method, tender_type,
                    ministry_id, department_id, estimated_budget, status, opening_date, closing_date,
                    created_at, updated_at, created_by)
VALUES
    -- Active tenders (PENDING_OPENING)
    ('a1111111-1111-1111-1111-111111111111', 'TND-2025-001',
     'Supply of Office Equipment for Ministry HQ',
     'Procurement of desks, chairs, filing cabinets and office accessories',
     'GOODS', 'NCB', 'NATIONAL',
     1, 1, 2500000.00, 'PENDING_OPENING',
     NOW() + INTERVAL '5 days', NOW() + INTERVAL '30 days',
     NOW(), NOW(), 'officer-user'),

    ('a2222222-2222-2222-2222-222222222222', 'TND-2025-002',
     'Road Rehabilitation - Colombo to Kandy A1 Section',
     'Full rehabilitation of 25km stretch including drainage improvements',
     'WORKS', 'ICB', 'INTERNATIONAL',
     1, 1, 150000000.00, 'PENDING_OPENING',
     NOW() + INTERVAL '7 days', NOW() + INTERVAL '45 days',
     NOW(), NOW(), 'officer-user'),

    -- Open tenders (OPEN)
    ('b1111111-1111-1111-1111-111111111111', 'TND-2025-003',
     'IT Consultancy for Digital Transformation Project',
     'Selection of consulting firm for e-government platform development',
     'CONSULTING_SERVICES', 'NCB', 'NATIONAL',
     1, 1, 35000000.00, 'OPEN',
     NOW() - INTERVAL '2 days', NOW() + INTERVAL '20 days',
     NOW(), NOW(), 'officer-user'),

    ('b2222222-2222-2222-2222-222222222222', 'TND-2025-004',
     'Medical Equipment Procurement - District Hospitals',
     'Supply of diagnostic imaging equipment to 5 district hospitals',
     'GOODS', 'ICB', 'INTERNATIONAL',
     1, 1, 85000000.00, 'OPEN',
     NOW() - INTERVAL '5 days', NOW() + INTERVAL '15 days',
     NOW(), NOW(), 'officer-user'),

    -- Under Evaluation (EVALUATION)
    ('c1111111-1111-1111-1111-111111111111', 'TND-2025-005',
     'Security Guard Services for Government Buildings',
     'Outsourcing of security services for 12 government buildings in Western Province',
     'NON_CONSULTING_SERVICES', 'NCB', 'NATIONAL',
     1, 1, 18000000.00, 'EVALUATION',
     NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days',
     NOW(), NOW(), 'officer-user'),

    ('c2222222-2222-2222-2222-222222222222', 'TND-2025-006',
     'Construction of Multi-Story Car Park - Government Complex',
     'Design and build of 500-space multi-story car park',
     'WORKS', 'NCB', 'NATIONAL',
     1, 1, 220000000.00, 'EVALUATION',
     NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days',
     NOW(), NOW(), 'officer-user'),

    ('c3333333-3333-3333-3333-333333333333', 'TND-2025-007',
     'Supply of Laboratory Chemicals and Reagents',
     'Annual supply contract for government research laboratories',
     'GOODS', 'NCB', 'NATIONAL',
     1, 1, 8500000.00, 'EVALUATION',
     NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days',
     NOW(), NOW(), 'officer-user'),

    -- Awarded (AWARDED)
    ('d1111111-1111-1111-1111-111111111111', 'TND-2025-008',
     'Annual Stationery Supply Contract',
     'Framework agreement for stationery supplies to all government departments',
     'GOODS', 'NCB', 'NATIONAL',
     1, 1, 5000000.00, 'AWARDED',
     NOW() - INTERVAL '45 days', NOW() - INTERVAL '30 days',
     NOW(), NOW(), 'officer-user'),

    ('d2222222-2222-2222-2222-222222222222', 'TND-2025-009',
     'Janitorial Services for Central Government Complex',
     'Outsourcing of cleaning and maintenance services',
     'NON_CONSULTING_SERVICES', 'NCB', 'NATIONAL',
     1, 1, 12000000.00, 'AWARDED',
     NOW() - INTERVAL '40 days', NOW() - INTERVAL '25 days',
     NOW(), NOW(), 'officer-user'),

    -- No Bid (NO_BID)
    ('e1111111-1111-1111-1111-111111111111', 'TND-2025-010',
     'Specialized Environmental Monitoring Equipment',
     'Supply of air quality and water quality monitoring stations',
     'GOODS', 'ICB', 'INTERNATIONAL',
     1, 1, 45000000.00, 'NO_BID',
     NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days',
     NOW(), NOW(), 'officer-user')

ON CONFLICT (tender_number) DO NOTHING;
