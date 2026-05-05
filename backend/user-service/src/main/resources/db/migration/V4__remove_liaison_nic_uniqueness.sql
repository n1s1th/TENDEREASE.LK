-- Remove uniqueness constraint on liaison officer NIC
-- A Liaison Officer can now be associated with multiple registrations
ALTER TABLE liaison_officers DROP CONSTRAINT IF EXISTS uq_liaison_nic;
