-- V21: Move addendum version files from Cloudinary to S3.
-- The Cloudinary public id already held the object path, so it becomes the S3 key.
-- The two derived URL columns are dropped: download URLs are now built from the key.

ALTER TABLE addendum_version ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'addendum_version' AND column_name = 'cloudinary_public_id'
    ) THEN
        UPDATE addendum_version SET s3_key = cloudinary_public_id WHERE s3_key IS NULL;
    END IF;
END $$;

-- Any row that still has no key predates S3 and has no retrievable object.
DELETE FROM addendum_version WHERE s3_key IS NULL;

ALTER TABLE addendum_version ALTER COLUMN s3_key SET NOT NULL;

ALTER TABLE addendum_version DROP COLUMN IF EXISTS cloudinary_public_id;
ALTER TABLE addendum_version DROP COLUMN IF EXISTS cloudinary_url;
ALTER TABLE addendum_version DROP COLUMN IF EXISTS secure_url;
