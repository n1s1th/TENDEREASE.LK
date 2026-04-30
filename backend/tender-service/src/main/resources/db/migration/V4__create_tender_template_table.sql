CREATE TABLE tender_templates (
    id UUID PRIMARY KEY,
    template_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    schema JSONB,
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP
);

CREATE INDEX idx_tender_templates_code ON tender_templates(template_code);
CREATE INDEX idx_tender_templates_status ON tender_templates(status);
CREATE INDEX idx_tender_templates_active ON tender_templates(is_active);
