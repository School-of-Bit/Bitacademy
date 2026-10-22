-- Keep only each account's best quiz result per subject and best game result per mode.
-- Run after schema.sql. Safe to rerun after the cleanup has completed.

DELETE FROM quiz_attempts
WHERE user_id IS NULL;

WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, subject_id
               ORDER BY score DESC, percentage DESC, completed_at ASC, id
           ) AS position
    FROM quiz_attempts
    WHERE user_id IS NOT NULL
)
DELETE FROM quiz_attempts qa
USING ranked
WHERE qa.id = ranked.id AND ranked.position > 1;

DELETE FROM game_scores
WHERE user_id IS NULL;

WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, game_mode
               ORDER BY score DESC, correct_answers DESC, best_streak DESC, played_at ASC, id
           ) AS position
    FROM game_scores
    WHERE user_id IS NOT NULL
)
DELETE FROM game_scores gs
USING ranked
WHERE gs.id = ranked.id AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_best_per_user_subject
    ON quiz_attempts (user_id, subject_id)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_scores_best_per_user_mode
    ON game_scores (user_id, game_mode)
    WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_mode VARCHAR(50) NOT NULL CHECK (game_mode = 'math-infinite'),
    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'finished', 'aborted')),
    current_a INTEGER NOT NULL,
    current_b INTEGER NOT NULL,
    current_operation VARCHAR(1) NOT NULL
        CHECK (current_operation IN ('+', '-', '*', '/')),
    current_answer INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
    wrong_answers INTEGER NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
    streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
    best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
    time_left_ms INTEGER NOT NULL DEFAULT 30000 CHECK (time_left_ms BETWEEN 0 AND 60000),
    revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_status
    ON game_sessions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated
    ON game_sessions (updated_at);
