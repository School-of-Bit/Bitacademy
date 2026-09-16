-- BitAcademy - PostgreSQL schema
-- Neon PostgreSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'Aluno',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_account_type_check CHECK (account_type IN ('Aluno', 'Professor'))
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    PRIMARY KEY (teacher_id, subject_id),
    CONSTRAINT fk_teacher_subjects_teacher FOREIGN KEY (teacher_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    subject_id UUID NOT NULL,
    quiz_title VARCHAR(200) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    player_name VARCHAR(150) NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_quiz_attempts_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT quiz_score_check CHECK (score >= 0),
    CONSTRAINT quiz_total_check CHECK (total_questions > 0),
    CONSTRAINT quiz_percentage_check CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT quiz_score_total_check CHECK (score <= total_questions)
);

CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    selected_option INTEGER,
    correct_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    explanation TEXT,
    question_order INTEGER NOT NULL,
    CONSTRAINT fk_quiz_answers_attempt FOREIGN KEY (attempt_id)
        REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT selected_option_check CHECK (selected_option IS NULL OR selected_option >= 0),
    CONSTRAINT correct_option_check CHECK (correct_option >= 0),
    CONSTRAINT question_order_check CHECK (question_order >= 0)
);

CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    game_mode VARCHAR(50) NOT NULL,
    game_title VARCHAR(150) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    player_name VARCHAR(150) NOT NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_game_scores_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT game_score_check CHECK (score >= 0),
    CONSTRAINT game_correct_check CHECK (correct_answers >= 0),
    CONSTRAINT game_wrong_check CHECK (wrong_answers >= 0),
    CONSTRAINT game_streak_check CHECK (best_streak >= 0),
    CONSTRAINT game_duration_check CHECK (duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject ON quiz_attempts(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_ranking ON quiz_attempts(subject_id, percentage DESC, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_ranking ON game_scores(game_mode, score DESC, correct_answers DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_played ON game_scores(played_at DESC);

INSERT INTO subjects (slug, name, icon) VALUES
    ('matematica', 'Matemática', '📐'),
    ('portugues', 'Português', '🖋️'),
    ('ciencias', 'Ciências', '⚛️'),
    ('filosofia', 'Filosofia', '🧠'),
    ('historia', 'História', '📜'),
    ('geografia', 'Geografia', '🌎'),
    ('artes', 'Artes', '🎨'),
    ('ingles', 'Inglês', '🗣️')
ON CONFLICT (slug) DO NOTHING;
