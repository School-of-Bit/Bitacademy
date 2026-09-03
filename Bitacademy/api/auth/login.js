const bcrypt = require("bcryptjs");
const { sql } = require("../db");
const { setSessionCookie } = require("../_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { email, password } = jsonBody(req);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const users = await sql`
      SELECT id, name, email, password_hash, account_type
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (!users.length) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(String(password), user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    setSessionCookie(res, user);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.account_type
      }
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Não foi possível realizar o login." });
  }
};
