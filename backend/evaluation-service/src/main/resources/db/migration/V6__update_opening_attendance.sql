-- Update officer_id to accept string badge numbers/IDs
ALTER TABLE opening_attendance 
    ALTER COLUMN officer_id TYPE VARCHAR(50) USING officer_id::varchar;

-- Add new columns for organisation and role
ALTER TABLE opening_attendance 
    ADD COLUMN organisation VARCHAR(150),
    ADD COLUMN role VARCHAR(50);
