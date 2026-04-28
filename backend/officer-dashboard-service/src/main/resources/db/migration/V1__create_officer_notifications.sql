CREATE TABLE IF NOT EXISTS officer_notifications (
    id UUID PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    recipient_user_id VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    tender_id UUID,
    tender_number VARCHAR(100),
    tender_title VARCHAR(500),
    clarification_id BIGINT,
    question_preview VARCHAR(500),
    action_url VARCHAR(500),
    status VARCHAR(50) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_officer_notifications_recipient_user_id ON officer_notifications (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_officer_notifications_recipient ON officer_notifications (recipient);
CREATE INDEX IF NOT EXISTS idx_officer_notifications_read ON officer_notifications (read);
CREATE INDEX IF NOT EXISTS idx_officer_notifications_created_at ON officer_notifications (created_at);
