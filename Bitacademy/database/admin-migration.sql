-- Execute no Neon após qualquer atualização deste arquivo para habilitar o papel
-- de administrador e a revogação de sessões em bancos existentes. É seguro reexecutar.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE users ADD CONSTRAINT users_account_type_check
    CHECK (account_type IN ('Aluno', 'Professor', 'Administrador'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_version_check;
ALTER TABLE users ADD CONSTRAINT users_auth_version_check CHECK (auth_version >= 0);

-- Promova uma conta confiável manualmente, substituindo o e-mail:
-- UPDATE users SET account_type = 'Administrador' WHERE email = 'seu-email@exemplo.com';
