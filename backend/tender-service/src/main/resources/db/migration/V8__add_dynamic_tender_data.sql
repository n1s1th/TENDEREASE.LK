ALTER TABLE tender
ADD COLUMN dynamic_data JSONB,
ADD COLUMN template_id UUID;

CREATE INDEX idx_tender_template_id ON tender(template_id);
