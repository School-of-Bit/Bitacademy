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
