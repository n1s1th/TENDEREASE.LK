CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    answered_by VARCHAR(100) NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id)
        REFERENCES questions (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_questions_category ON questions (category);
CREATE INDEX idx_questions_status ON questions (status);
CREATE INDEX idx_questions_user_id ON questions (user_id);
CREATE INDEX idx_questions_created_at ON questions (created_at DESC);
