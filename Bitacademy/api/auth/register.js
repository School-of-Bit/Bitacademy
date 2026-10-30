const bcrypt = require("bcryptjs");
const { sql } = require("../../lib/db");
const { setSessionCookie, getSessionSecret } = require("../../lib/_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.account_type
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Check the deployed function's environment before creating the account,
    // so a missing secret cannot leave an account without a usable session.
    getSessionSecret();
    const { name, email, password, type: requestedType } = jsonBody(req);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const rawPassword = String(password || "");

    if (normalizedName.length < 2 || normalizedName.length > 150 || /[<>]/.test(normalizedName)) {
      return res.status(400).json({ error: "Informe um nome válido, com 2 a 150 caracteres." });
    }
    if (normalizedEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }
    if (Buffer.byteLength(rawPassword, "utf8") < 8 || Buffer.byteLength(rawPassword, "utf8") > 72
      || !/[a-z]/.test(rawPassword) || !/[A-Z]/.test(rawPassword) || !/\d/.test(rawPassword) || !/[^A-Za-z0-9À-ÿ]/.test(rawPassword)) {
      return res.status(400).json({ error: "A senha deve ter 8 a 72 bytes e incluir maiúscula, minúscula, número e símbolo." });
    }
    if (requestedType && requestedType !== "Aluno") {
      return res.status(403).json({ error: "Contas de professor devem ser criadas por um administrador." });
    }
    // Public registration is restricted to students. Staff accounts are created by admins.
    const accountType = "Aluno";

    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (existing.length) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const created = await sql`
      INSERT INTO users (name, email, password_hash, account_type)
      VALUES (${normalizedName}, ${normalizedEmail}, ${passwordHash}, ${accountType})
      RETURNING id, name, email, account_type, auth_version
    `;

    const user = created[0];

    setSessionCookie(res, user);
    return res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    console.error("Registration failed:", error);
    if (error?.message?.includes("JWT_SECRET")) {
      return res.status(500).json({ error: "Configuração de sessão ausente nesta implantação. Configure JWT_SECRET ou JWT_SECRET_KEY para o ambiente correto e publique novamente." });
    }
    return res.status(500).json({
      error: "Não foi possível criar a conta."
    });
  }
};
