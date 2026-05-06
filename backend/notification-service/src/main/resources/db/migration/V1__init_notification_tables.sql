CREATE TABLE notification_history (
    id UUID PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    tender_id UUID,
    sent_at TIMESTAMP NOT NULL,
    status VARCHAR(50)
);
