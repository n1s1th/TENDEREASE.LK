-- Add email column to opening_attendance for unique member identification
ALTER TABLE opening_attendance
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '';

-- Add bid_submission_deadline column to opening_session for countdown timer
ALTER TABLE opening_session
    ADD COLUMN IF NOT EXISTS bid_submission_deadline TIMESTAMP;
