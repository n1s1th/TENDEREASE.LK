-- ===============================================
-- TENDER EASE - BID OPENING AND EVALUATION MODULE
-- Module Owner: D. S. Kankanamge (234101A)
-- ===============================================
-- ===============================================
-- BID OPENING & ACCESS CONTROL MODULE
-- ===============================================

-- =========================
-- EVALUATION COMMITTEE
-- =========================
CREATE TABLE evaluation_committees (
    id SERIAL PRIMARY KEY,
    tender_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_committee_tender
        FOREIGN KEY (tender_id)
        REFERENCES tenders(id)
        ON DELETE CASCADE
);

-- =========================
-- COMMITTEE MEMBERS
-- =========================
CREATE TABLE committee_members (
    id SERIAL PRIMARY KEY,
    committee_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL, 
    -- REVIEWER | CHAIR
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_committee
        FOREIGN KEY (committee_id)
        REFERENCES evaluation_committees(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- BID EVALUATIONS (Per Evaluator)
-- =========================
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    bid_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    technical_total DECIMAL(6,2),
    financial_total DECIMAL(6,2),
    composite_score DECIMAL(6,2),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', 
    -- IN_PROGRESS | SUBMITTED | FINALIZED
    submitted_at TIMESTAMP,
    CONSTRAINT fk_eval_bid
        FOREIGN KEY (bid_id)
        REFERENCES bids(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_eval_user
        FOREIGN KEY (evaluator_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- CRITERIA LEVEL SCORES
-- =========================
CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(6,2),
    comments TEXT,
    is_pass BOOLEAN,
    CONSTRAINT fk_score_evaluation
        FOREIGN KEY (evaluation_id)
        REFERENCES evaluations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_score_criteria
        FOREIGN KEY (criteria_id)
        REFERENCES evaluation_criteria(id)
        ON DELETE CASCADE,
    UNIQUE (evaluation_id, criteria_id)
);

-- =========================
-- CONSENSUS SUMMARY
-- =========================
CREATE TABLE consensus_sheets (
    id SERIAL PRIMARY KEY,
    tender_id INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT NOT NULL,
    CONSTRAINT fk_consensus_tender
        FOREIGN KEY (tender_id)
        REFERENCES tenders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_consensus_user
        FOREIGN KEY (generated_by)
        REFERENCES users(id)
);

-- =========================
-- VARIANCE VIEW
-- =========================
CREATE VIEW evaluation_variance AS
SELECT 
    es.criteria_id,
    e.bid_id,
    AVG(es.score) AS average_score,
    MAX(es.score) - MIN(es.score) AS score_variance
FROM evaluation_scores es
JOIN evaluations e ON es.evaluation_id = e.id
GROUP BY es.criteria_id, e.bid_id;
