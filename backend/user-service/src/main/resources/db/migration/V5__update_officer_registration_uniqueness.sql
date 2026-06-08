-- Swap uniqueness constraints for Officer Registration
-- Official email is now allowed to be duplicated
-- Liaison Officer email and NIC must now be unique

-- 1. Remove unique constraint from officers.official_email
ALTER TABLE officers DROP CONSTRAINT IF EXISTS uq_officer_email;

-- 2. CLEANUP: Remove duplicate registrations to allow unique constraints
-- We keep only the most recent registration for each NIC
DELETE FROM officers WHERE id IN (
    SELECT officer_id FROM (
        SELECT officer_id, ROW_NUMBER() OVER (PARTITION BY nic ORDER BY created_at DESC) as row_num
        FROM liaison_officers
    ) t WHERE row_num > 1
);

-- 3. Restore/Add unique constraint for liaison_officers.nic
ALTER TABLE liaison_officers ADD CONSTRAINT uq_liaison_nic UNIQUE (nic);

-- 4. Add unique constraint for liaison_officers.email
ALTER TABLE liaison_officers ADD CONSTRAINT uq_liaison_email UNIQUE (email);

-- 5. Create index for performance on liaison email
CREATE UNIQUE INDEX IF NOT EXISTS idx_liaison_email ON liaison_officers (email);
