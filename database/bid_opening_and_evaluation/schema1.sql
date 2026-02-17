-- =================================================
-- TENDEREASE.LK - BID OPENING AND EVALUATION MODULE
-- Version: 1.0
-- Module Owner: D. S. Kankanamge (234101A)
-- =================================================
-- =================================================
-- BID OPENING & ACCESS CONTROL MODULE
-- =================================================

-- =================================================
-- SECTION 1: BID OPENING & ACCESS CONTROL
-- =================================================

-- 1.1 OPENING SESSION TABLE
CREATE TABLE Opening_Session (
    Opening_Session_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,

    Scheduled_Opening_Time TIMESTAMP NOT NULL,
    Actual_Opening_Time TIMESTAMP,

    Status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    -- SCHEDULED | OPEN | CLOSED

    Opened_By UUID,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_opening_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_opened_by_officer
        FOREIGN KEY (Opened_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE SET NULL,

    CONSTRAINT chk_opening_status
        CHECK (Status IN ('SCHEDULED', 'OPEN', 'CLOSED'))
);

-- 1.2 OPENING ATTENDANCE TABLE
CREATE TABLE Opening_Attendance (
    Attendance_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Opening_Session_ID UUID NOT NULL,
    Officer_ID UUID NOT NULL,

    Designation VARCHAR(150) NOT NULL,
    Attendance_Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_session
        FOREIGN KEY (Opening_Session_ID)
        REFERENCES Opening_Session(Opening_Session_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_officer
        FOREIGN KEY (Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_attendance UNIQUE (Opening_Session_ID, Officer_ID)
);

-- ====================================================
-- SECTION 2: EVALUATION COMMITTEE & ROLE CONTROL
-- ====================================================

-- 2.1 COMMITTEE TABLE
CREATE TABLE Evaluation_Committee (
    Committee_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_committee_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE
);

-- 2.2 COMMITTEE MEMBERS
CREATE TABLE Committee_Member (
    Committee_Member_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Committee_ID UUID NOT NULL,
    Officer_ID UUID NOT NULL,

    Role VARCHAR(20) NOT NULL,
    -- REVIEWER | CHAIR

    Assigned_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_member_committee
        FOREIGN KEY (Committee_ID)
        REFERENCES Evaluation_Committee(Committee_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_officer
        FOREIGN KEY (Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE,

    CONSTRAINT chk_committee_role
        CHECK (Role IN ('REVIEWER', 'CHAIR')),

    CONSTRAINT uq_committee_member UNIQUE (Committee_ID, Officer_ID)
);

-- ====================================================
-- SECTION 3: EVALUATION CRITERIA SETUP
-- ====================================================

CREATE TABLE Evaluation_Criteria (
    Criteria_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,

    Criteria_Name VARCHAR(255) NOT NULL,
    Description TEXT,

    Criteria_Type VARCHAR(20) NOT NULL,
    -- TECHNICAL | FINANCIAL | PASS_FAIL

    Weight DECIMAL(5,2),
    Max_Score DECIMAL(6,2),
    Minimum_Score DECIMAL(6,2),

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_criteria_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT chk_criteria_type
        CHECK (Criteria_Type IN ('TECHNICAL', 'FINANCIAL', 'PASS_FAIL'))
);

-- ====================================================
-- SECTION 4: BID EVALUATIONS (INDEPENDENT SCORING)
-- ====================================================

CREATE TABLE Bid_Evaluation (
    Evaluation_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,
    Bidder_User_ID UUID NOT NULL,

    Evaluator_Officer_ID UUID NOT NULL,

    Technical_Total DECIMAL(8,2),
    Financial_Total DECIMAL(8,2),
    Composite_Score DECIMAL(8,2),

    Status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    -- IN_PROGRESS | SUBMITTED | FINALIZED

    Submitted_At TIMESTAMP,

    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eval_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_eval_bidder
        FOREIGN KEY (Bidder_User_ID)
        REFERENCES "User"(User_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_eval_evaluator
        FOREIGN KEY (Evaluator_Officer_ID)
        REFERENCES Officer(Officer_ID)
        ON DELETE CASCADE,

    CONSTRAINT chk_eval_status
        CHECK (Status IN ('IN_PROGRESS', 'SUBMITTED', 'FINALIZED'))
);

-- 4.1 PER-CRITERIA SCORES
CREATE TABLE Evaluation_Score (
    Score_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Evaluation_ID UUID NOT NULL,
    Criteria_ID UUID NOT NULL,

    Score_Value DECIMAL(8,2),
    Is_Pass BOOLEAN,
    Comments TEXT,

    CONSTRAINT fk_score_evaluation
        FOREIGN KEY (Evaluation_ID)
        REFERENCES Bid_Evaluation(Evaluation_ID)
        ON DELETE CASCADE,

    CONSTRAINT fk_score_criteria
        FOREIGN KEY (Criteria_ID)
        REFERENCES Evaluation_Criteria(Criteria_ID)
        ON DELETE CASCADE,

    CONSTRAINT uq_eval_criteria UNIQUE (Evaluation_ID, Criteria_ID)
);

-- ====================================================
-- SECTION 5: CONSENSUS & REPORTING
-- ====================================================

CREATE TABLE Evaluation_Consensus (
    Consensus_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    Tender_Id UUID NOT NULL,

    Generated_By UUID NOT NULL,
    Generated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    Notes TEXT,

    CONSTRAINT fk_consensus_tender
        FOREIGN KEY (Tender_Id)
        REFERENCES Tender(Tender_Id)
        ON DELETE CASCADE,

    CONSTRAINT fk_consensus_generated_by
        FOREIGN KEY (Generated_By)
        REFERENCES Officer(Officer_ID)
        ON DELETE RESTRICT
);

-- ====================================================
-- SECTION 6: VARIANCE VIEW (FOR DISCREPANCY DETECTION)
-- ====================================================

CREATE VIEW v_evaluation_variance AS
SELECT
    es.Criteria_ID,
    be.Tender_Id,
    be.Bidder_User_ID,
    AVG(es.Score_Value) AS Average_Score,
    MAX(es.Score_Value) - MIN(es.Score_Value) AS Score_Variance
FROM Evaluation_Score es
JOIN Bid_Evaluation be ON es.Evaluation_ID = be.Evaluation_ID
GROUP BY es.Criteria_ID, be.Tender_Id, be.Bidder_User_ID;

-- ====================================================
-- SECTION 7: INDEXES
-- ====================================================

CREATE INDEX idx_opening_tender ON Opening_Session(Tender_Id);
CREATE INDEX idx_committee_tender ON Evaluation_Committee(Tender_Id);
CREATE INDEX idx_eval_tender ON Bid_Evaluation(Tender_Id);
CREATE INDEX idx_eval_bidder ON Bid_Evaluation(Bidder_User_ID);
CREATE INDEX idx_score_evaluation ON Evaluation_Score(Evaluation_ID);

-- ====================================================
-- END OF EVALUATION MODULE
-- ====================================================

COMMENT ON TABLE Opening_Session IS 'Controls time-boxed bid opening';
COMMENT ON TABLE Opening_Attendance IS 'Attendance log for opening session';
COMMENT ON TABLE Evaluation_Committee IS 'Evaluation committee per tender';
COMMENT ON TABLE Committee_Member IS 'Role-based committee members';
COMMENT ON TABLE Evaluation_Criteria IS 'Weighted and pass/fail evaluation criteria';
COMMENT ON TABLE Bid_Evaluation IS 'Independent evaluator scoring records';
COMMENT ON TABLE Evaluation_Score IS 'Per-criteria scoring';
COMMENT ON TABLE Evaluation_Consensus IS 'Final consensus and reporting record';