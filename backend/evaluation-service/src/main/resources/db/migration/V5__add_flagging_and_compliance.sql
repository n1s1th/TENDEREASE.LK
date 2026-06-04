-- Migration to add flagging and technical compliance to evaluations
ALTER TABLE evaluation ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE evaluation ADD COLUMN compliance_status VARCHAR(50) DEFAULT 'PENDING';
