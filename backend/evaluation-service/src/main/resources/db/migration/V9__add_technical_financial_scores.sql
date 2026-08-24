ALTER TABLE recommendation_notes ADD COLUMN IF NOT EXISTS technical_score DOUBLE PRECISION;
ALTER TABLE recommendation_notes ADD COLUMN IF NOT EXISTS financial_score DOUBLE PRECISION;
ALTER TABLE recommendation_notes ADD COLUMN IF NOT EXISTS bid_id VARCHAR(255);