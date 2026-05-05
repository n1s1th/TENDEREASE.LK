CREATE TABLE dashboard_kpi (
    id VARCHAR(255) PRIMARY KEY,
    total_tenders BIGINT DEFAULT 0,
    pending_tenders BIGINT DEFAULT 0,
    approved_tenders BIGINT DEFAULT 0,
    active_officers BIGINT DEFAULT 0,
    pending_registrations BIGINT DEFAULT 0,
    updated_at TIMESTAMP
);

INSERT INTO dashboard_kpi (id, total_tenders, pending_tenders, approved_tenders, active_officers, pending_registrations, updated_at)
VALUES ('GLOBAL_SUMMARY', 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
