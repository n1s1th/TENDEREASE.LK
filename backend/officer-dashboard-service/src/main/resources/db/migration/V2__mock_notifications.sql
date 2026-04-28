-- V2: Insert mock notifications for the officer dashboard
INSERT INTO officer_notifications (
    id, recipient, recipient_user_id, type, subject, message,
    tender_id, tender_number, tender_title, clarification_id,
    question_preview, action_url, status, read, created_at
) VALUES
(gen_random_uuid(), 'damith@tenderease.lk', '1', 'CLARIFICATION_CREATED', 'New Clarification Question', 'A vendor has asked a question regarding tender specifications.',
    gen_random_uuid(), 'TND-001', 'Road Construction Project', 100,
    'Is it possible to extend the deadline?', '/officer-dashboard/tenders/TND-001/clarifications', 'DELIVERED', FALSE, NOW() - INTERVAL '2 HOURS'),
(gen_random_uuid(), 'damith@tenderease.lk', '1', 'CLARIFICATION_CREATED', 'Budget Inquiry', 'A vendor has asked a question regarding the budget.',
    gen_random_uuid(), 'TND-002', 'Hospital Equipment Supply', 101,
    'Does the budget include VAT?', '/officer-dashboard/tenders/TND-002/clarifications', 'DELIVERED', FALSE, NOW() - INTERVAL '1 HOUR'),
(gen_random_uuid(), 'damith@tenderease.lk', '1', 'TENDER_STATUS_CHANGED', 'Tender Approved', 'The tender Road Construction Project has been approved.',
    gen_random_uuid(), 'TND-001', 'Road Construction Project', NULL,
    NULL, '/officer-dashboard/tenders/TND-001', 'DELIVERED', TRUE, NOW() - INTERVAL '1 DAY');
