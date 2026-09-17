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
      SELECT a.id, a.title, a.description, a.activity_type, a.max_score, a.due_at, a.created_at, a.updated_at
      FROM activities a
      JOIN subjects s ON s.id = a.subject_id
      WHERE a.teacher_id = ${teacherId}
        AND s.slug = ${subjectSlug}
      ORDER BY a.created_at DESC
    `;

    return res.status(200).json({ activities: rows });
  } catch (error) {
    console.error("Activities list failed:", error);
    return res.status(500).json({ error: "Não foi possível carregar as atividades." });
  }
};
