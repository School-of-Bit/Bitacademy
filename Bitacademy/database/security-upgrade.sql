-- Execute depois das migrações existentes. Não altera nem apaga notas ou usuários.
BEGIN;
CREATE TABLE IF NOT EXISTS login_rate_limits (
    bucket TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL CHECK (attempts > 0),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_expiry ON login_rate_limits(expires_at);
CREATE TABLE IF NOT EXISTS quiz_used_rounds (
    id UUID PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_used_rounds_expiry ON quiz_used_rounds(expires_at);
COMMIT;
-- Manutenção periódica (por exemplo diariamente):
-- DELETE FROM login_rate_limits WHERE expires_at < NOW();
-- DELETE FROM quiz_used_rounds WHERE expires_at < NOW();
