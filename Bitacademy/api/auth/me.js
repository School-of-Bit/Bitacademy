const { sql } = require("../db");
const { getSessionUserId } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const userId = getSessionUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const users = await sql`
      SELECT id, name, email, account_type
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!users.length) {
      return res.status(401).json({ error: "Sessão inválida." });
    }

    const user = users[0];
    let subjects = [];

    if (user.account_type === "Professor") {
      subjects = await sql`
        SELECT s.slug, s.name
        FROM teacher_subjects ts
        JOIN subjects s ON s.id = ts.subject_id
        WHERE ts.teacher_id = ${user.id}
        ORDER BY s.name
      `;
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.account_type,
        subjects
      }
    });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return res.status(500).json({ error: "Não foi possível verificar a sessão." });
  }
};
