const { sql } = require("../db");
const { getSessionUserId } = require("../_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    const teacherId = getSessionUserId(req);
    if (!teacherId) return res.status(401).json({ error: "Não autenticado." });

    const { subjectSlug, title, content, link } = jsonBody(req);
    const subject = String(subjectSlug || "").trim();
    const materialTitle = String(title || "").trim();
    const materialContent = String(content || "").trim();
    const materialLink = String(link || "").trim() || null;

    if (!subject || !materialTitle || !materialContent) {
      return res.status(400).json({ error: "Disciplina, título e conteúdo são obrigatórios." });
    }

    const authorized = await sql`
      SELECT s.id, s.name, s.slug
      FROM teacher_subjects ts
      JOIN subjects s ON s.id = ts.subject_id
      JOIN users u ON u.id = ts.teacher_id
      WHERE ts.teacher_id = ${teacherId}
        AND u.account_type = 'Professor'
        AND s.slug = ${subject}
      LIMIT 1
    `;

    if (!authorized.length) {
      return res.status(403).json({ error: "Você não pode publicar nesta disciplina." });
    }

    if (materialLink && !/^https?:\/\//i.test(materialLink)) {
      return res.status(400).json({ error: "O link deve começar com http:// ou https://." });
    }

    const rows = await sql`
      INSERT INTO materials (teacher_id, subject_id, title, content, link)
      VALUES (${teacherId}, ${authorized[0].id}, ${materialTitle}, ${materialContent}, ${materialLink})
      RETURNING id, title, content, link, created_at, updated_at
    `;

    return res.status(201).json({ material: rows[0] });
  } catch (error) {
    console.error("Material creation failed:", error);
    return res.status(500).json({ error: "Não foi possível publicar o material." });
  }
};
