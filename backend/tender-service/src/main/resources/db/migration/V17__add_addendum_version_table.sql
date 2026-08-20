-- V17: Add addendum versioning support
-- Renames the existing 'version' column and creates addendum_version table

-- Rename existing 'version' column to 'current_version_number'
ALTER TABLE tender_amendment
    RENAME COLUMN version TO current_version_number;

-- Create addendum_version table for immutable file versions
CREATE TABLE addendum_version (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    addendum_id           BIGINT NOT NULL REFERENCES tender_amendment(id) ON DELETE CASCADE,
    version_number        INTEGER NOT NULL,
    cloudinary_public_id  VARCHAR(500) NOT NULL,
    cloudinary_url        VARCHAR(1000) NOT NULL,
    secure_url            VARCHAR(1000) NOT NULL,
    original_filename     VARCHAR(255) NOT NULL,
    content_type          VARCHAR(100) NOT NULL,
    file_size             BIGINT NOT NULL,
    change_description    TEXT,
    uploaded_by           VARCHAR(255),
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_addendum_version UNIQUE (addendum_id, version_number)
);

CREATE INDEX idx_addendum_version_addendum_id ON addendum_version(addendum_id);
