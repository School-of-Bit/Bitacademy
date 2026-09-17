const { sql } = require("../db");
const { getSessionUserId } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const teacherId = getSessionUserId(req);
    if (!teacherId) return res.status(401).json({ error: "Não autenticado." });

    const subjectSlug = String(req.query?.subject || "").trim();
    if (!subjectSlug) return res.status(400).json({ error: "Informe a disciplina." });

    const rows = await sql`
      SELECT m.id, m.title, m.content, m.link, m.created_at, m.updated_at
      FROM materials m
      JOIN subjects s ON s.id = m.subject_id
      WHERE m.teacher_id = ${teacherId}
        AND s.slug = ${subjectSlug}
      ORDER BY m.created_at DESC
    `;

    return res.status(200).json({ materials: rows });
  } catch (error) {
    console.error("Materials list failed:", error);
    return res.status(500).json({ error: "Não foi possível carregar os materiais." });
  }
};
