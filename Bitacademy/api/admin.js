const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    const users = await sql`SELECT account_type FROM users WHERE id = ${userId} LIMIT 1`;
    if (!users.length) return res.status(401).json({ error: "Sessão inválida." });
    if (users[0].account_type !== "Administrador") {
      return res.status(403).json({ error: "Acesso restrito a administradores." });
    }

    const action = String(req.query?.action || (req.method === "GET" ? "dashboard" : "")).trim().toLowerCase();
    if (req.method === "GET" && action === "dashboard") {
      const [teachers, subjects] = await Promise.all([
        sql`SELECT u.id, u.name, u.email, u.created_at,
                   COALESCE(json_agg(json_build_object('id', s.id, 'slug', s.slug, 'name', s.name))
                     FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS subjects
            FROM users u LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
            LEFT JOIN subjects s ON s.id = ts.subject_id
            WHERE u.account_type = 'Professor'
            GROUP BY u.id ORDER BY u.name`,
        sql`SELECT id, slug, name FROM subjects ORDER BY name`
      ]);
      return res.status(200).json({ teachers, subjects });
    }

    if (req.method === "GET" && action === "users") {
      const rows = await sql`SELECT id, name, email, account_type, created_at
        FROM users ORDER BY created_at DESC LIMIT 500`;
      return res.status(200).json({ users: rows });
    }

    if (req.method === "POST" && ["assign-subject", "remove-subject"].includes(action)) {
      const body = jsonBody(req);
      const teacherId = String(body.teacherId || "").trim();
      const subjectId = String(body.subjectId || "").trim();
      if (!teacherId || !subjectId) return res.status(400).json({ error: "Professor e disciplina são obrigatórios." });
      const teacher = await sql`SELECT id FROM users WHERE id = ${teacherId} AND account_type = 'Professor' LIMIT 1`;
      if (!teacher.length) return res.status(404).json({ error: "Professor não encontrado." });
      if (action === "assign-subject") {
        const inserted = await sql`INSERT INTO teacher_subjects (teacher_id, subject_id)
          SELECT ${teacherId}, id FROM subjects WHERE id = ${subjectId}
          ON CONFLICT DO NOTHING RETURNING teacher_id`;
        const subject = await sql`SELECT id FROM subjects WHERE id = ${subjectId} LIMIT 1`;
        if (!subject.length) return res.status(404).json({ error: "Disciplina não encontrada." });
        return res.status(200).json({ ok: true, assigned: inserted.length > 0 });
      }
      const removed = await sql`DELETE FROM teacher_subjects
        WHERE teacher_id = ${teacherId} AND subject_id = ${subjectId} RETURNING teacher_id`;
      return res.status(200).json({ ok: true, removed: removed.length > 0 });
    }

    if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
    return res.status(400).json({ error: "Ação administrativa inválida." });
  } catch (error) {
    console.error("Admin API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação administrativa." });
  }
};
