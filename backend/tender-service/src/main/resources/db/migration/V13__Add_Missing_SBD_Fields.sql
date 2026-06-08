-- Add columns if they don't exist to prevent errors
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tender' AND column_name='sbd_template') THEN
        ALTER TABLE tender ADD COLUMN sbd_template VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tender' AND column_name='template_version') THEN
        ALTER TABLE tender ADD COLUMN template_version VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tender' AND column_name='rejection_reason') THEN
        ALTER TABLE tender ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;
