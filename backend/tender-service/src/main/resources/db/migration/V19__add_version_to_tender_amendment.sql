-- V19: Add version column to tender_amendment table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='tender_amendment' AND column_name='version'
    ) THEN
        ALTER TABLE tender_amendment ADD COLUMN version INT DEFAULT 0;
    END IF;
END $$;
