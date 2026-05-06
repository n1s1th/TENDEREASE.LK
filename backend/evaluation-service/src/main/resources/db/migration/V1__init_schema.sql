CREATE TABLE evaluation_criteria (
    id UUID PRIMARY KEY,
    tender_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE evaluation (
    id UUID PRIMARY KEY,
    tender_id UUID NOT NULL,
    bid_id UUID NOT NULL,
    evaluator_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_score DECIMAL(10, 2),
    remarks TEXT,
    evaluated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE evaluation_score (
    id UUID PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluation(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    score DECIMAL(10, 2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE evaluation_result (
    id UUID PRIMARY KEY,
    tender_id UUID NOT NULL,
    winning_bid_id UUID,
    final_score DECIMAL(10, 2),
    approved_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_evaluation_tender_id ON evaluation(tender_id);
CREATE INDEX idx_evaluation_bid_id ON evaluation(bid_id);
CREATE INDEX idx_evaluation_evaluator_id ON evaluation(evaluator_id);
CREATE INDEX idx_evaluation_criteria_tender_id ON evaluation_criteria(tender_id);
CREATE INDEX idx_evaluation_score_eval_id ON evaluation_score(evaluation_id);
CREATE INDEX idx_evaluation_result_tender_id ON evaluation_result(tender_id);
