-- Add column sme_indicator to tender table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tender' AND column_name='sme_indicator') THEN
        ALTER TABLE tender ADD COLUMN sme_indicator BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
