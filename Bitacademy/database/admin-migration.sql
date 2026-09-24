-- Execute no Neon para habilitar o papel de administrador em bancos existentes.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE users ADD CONSTRAINT users_account_type_check
    CHECK (account_type IN ('Aluno', 'Professor', 'Administrador'));

-- Promova uma conta confiável manualmente, substituindo o e-mail:
-- UPDATE users SET account_type = 'Administrador' WHERE email = 'seu-email@exemplo.com';
