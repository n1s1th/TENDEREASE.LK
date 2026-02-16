-- ===============================================
-- TENDER EASE - BID OPENING AND EVALUATION MODULE
-- Module Owner: D. S. Kankanamge (234101A)
-- ===============================================
-- ===============================================
-- BID OPENING & ACCESS CONTROL MODULE
-- ===============================================

-- 1. Opening Sessions
CREATE TABLE opening_sessions (
    id SERIAL PRIMARY KEY,
    tender_id INT NOT NULL,
    scheduled_opening_time TIMESTAMP NOT NULL,
    actual_opening_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    opening_session_id INT NOT NULL,
    user_id INT NOT NULL,
    designation VARCHAR(150),
    attendance_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EVALUATION, CONSENSUS & REPORTING MODULE
-- ============================================

-- 3. Evaluation Criteria
CREATE TABLE evaluation_criteria (
    id SERIAL PRIMARY KEY,
    tender_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    criteria_type VARCHAR(20) NOT NULL,
    weight DECIMAL(5,2),
    max_score DECIMAL(5,2),
    minimum_score DECIMAL(5,2)
);

-- 4. Evaluations
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    bid_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    technical_total DECIMAL(6,2),
    financial_total DECIMAL(6,2),
    composite_score DECIMAL(6,2),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    submitted_at TIMESTAMP
);

-- 5. Evaluation Scores
CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(6,2),
    comments TEXT,
    is_pass BOOLEAN
);

-- 6. Consensus Sheet
CREATE TABLE consensus_sheets (
    id SERIAL PRIMARY KEY,
    tender_id INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT NOT NULL
);