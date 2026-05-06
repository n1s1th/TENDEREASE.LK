CREATE TABLE IF NOT EXISTS recommendation_notes (
    id BIGSERIAL PRIMARY KEY,
    tender_id VARCHAR(255) NOT NULL,
    tender_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    estimated_budget DECIMAL(19, 2) NOT NULL,
    bidder_name VARCHAR(255) NOT NULL,
    recommended_value DECIMAL(19, 2) NOT NULL,
    final_score DOUBLE PRECISION NOT NULL,
    justification TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actioned_at TIMESTAMP WITHOUT TIME ZONE
);

-- Insert dummy data for interim evaluation using real published tender info
INSERT INTO recommendation_notes 
(tender_id, tender_name, department, estimated_budget, bidder_name, recommended_value, final_score, justification, status)
VALUES 
('TR-2026-036', 'Sample Tender for IT Equipment', 'Planning Division', 15000000.00, 'Tech Solutions Ltd.', 14200000.00, 87.4, 'Meets all technical specifications and offers the best value for money.', 'PENDING'),
('TR-2026-032', 'Sample Tender for IT Equipment', 'Planning Division', 15000000.00, 'Comfort Seats Co.', 14850000.00, 92.1, 'Highest quality materials and shortest delivery timeline.', 'PENDING'),
('TR-2026-009', 'Sample Tender for IT Equipment', 'Planning Division', 15000000.00, 'Global Nets PLC', 14500000.00, 85.0, 'Proven track record with similar large-scale projects.', 'APPROVED');
