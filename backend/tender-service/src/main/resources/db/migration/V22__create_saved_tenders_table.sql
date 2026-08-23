CREATE TABLE saved_tenders (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tender_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_saved_tenders_tender_id FOREIGN KEY (tender_id) REFERENCES tender(id),
    CONSTRAINT uk_saved_tenders_user_tender UNIQUE (user_id, tender_id)
);
