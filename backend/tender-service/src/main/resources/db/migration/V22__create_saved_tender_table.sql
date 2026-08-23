-- V22: Bookmarked ("saved") tenders, keyed by Keycloak user id.
-- The unique constraint makes saving idempotent and lets the API treat a repeat
-- save as a no-op rather than creating duplicates.

CREATE TABLE IF NOT EXISTS saved_tender (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    VARCHAR(255) NOT NULL,
    tender_id  UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_saved_tender_user_tender UNIQUE (user_id, tender_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_tender_user_id ON saved_tender(user_id);
