const bcrypt = require("bcryptjs");
const { sql } = require("../db");
const { setSessionCookie } = require("../_auth");

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
    const { name, email, password, type, materia } = jsonBody(req);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();

    if (normalizedName.length < 2) {
      return res.status(400).json({ error: "Informe um nome válido." });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }
    if (String(password || "").length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    }
    if (!["Aluno", "Professor"].includes(type)) {
      return res.status(400).json({ error: "Tipo de conta inválido." });
    }

    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (existing.length) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const created = await sql`
      INSERT INTO users (name, email, password_hash, account_type)
      VALUES (${normalizedName}, ${normalizedEmail}, ${passwordHash}, ${type})
      RETURNING id, name, email, account_type
    `;

    const user = created[0];

    if (type === "Professor" && materia) {
      const subjects = await sql`
        SELECT id FROM subjects WHERE slug = ${String(materia).trim().toLowerCase()} LIMIT 1
      `;

      if (subjects.length) {
        await sql`
          INSERT INTO teacher_subjects (teacher_id, subject_id)
          VALUES (${user.id}, ${subjects[0].id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    setSessionCookie(res, user);
    return res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({ error: "Não foi possível criar a conta." });
  }
};
