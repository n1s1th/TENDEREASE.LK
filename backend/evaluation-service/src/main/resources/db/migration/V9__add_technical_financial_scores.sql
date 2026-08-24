ALTER TABLE recommendation_notes ADD COLUMN technical_score DOUBLE PRECISION;
ALTER TABLE recommendation_notes ADD COLUMN financial_score DOUBLE PRECISION;
ALTER TABLE recommendation_notes ADD COLUMN bid_id VARCHAR(255);