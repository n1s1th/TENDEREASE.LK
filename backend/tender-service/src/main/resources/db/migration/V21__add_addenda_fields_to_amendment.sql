-- V16: Add change_note and document_id to tender_amendment for addenda/versioning
ALTER TABLE tender_amendment
    ADD COLUMN IF NOT EXISTS change_note TEXT,
    ADD COLUMN IF NOT EXISTS document_id UUID;
