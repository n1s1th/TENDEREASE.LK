-- V2: Add bid_data JSONB column to the bid table for dynamic structures like BOQs and vetting items
ALTER TABLE bid ADD COLUMN bid_data JSONB;
