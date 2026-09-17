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

    const { subjectSlug, title, description, activityType, maxScore, dueAt } = jsonBody(req);
    const subject = String(subjectSlug || "").trim();
    const activityTitle = String(title || "").trim();
    const activityDescription = String(description || "").trim();
    const type = String(activityType || "manual").trim().toLowerCase();
    const score = Number(maxScore ?? 10);
    const deadline = dueAt ? new Date(dueAt) : null;

    if (!subject || !activityTitle || !activityDescription) {
      return res.status(400).json({ error: "Disciplina, título e descrição são obrigatórios." });
    }

    if (!["automatic", "manual"].includes(type)) {
      return res.status(400).json({ error: "Tipo de atividade inválido." });
    }

    if (!Number.isFinite(score) || score <= 0 || score > 100) {
      return res.status(400).json({ error: "A pontuação deve estar entre 0 e 100." });
    }

    if (deadline && Number.isNaN(deadline.getTime())) {
      return res.status(400).json({ error: "Prazo inválido." });
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
      return res.status(403).json({ error: "Você não pode criar atividades nesta disciplina." });
    }

    const rows = await sql`
      INSERT INTO activities (teacher_id, subject_id, title, description, activity_type, max_score, due_at)
      VALUES (
        ${teacherId},
        ${authorized[0].id},
        ${activityTitle},
        ${activityDescription},
        ${type},
        ${score},
        ${deadline ? deadline.toISOString() : null}
      )
      RETURNING id, title, description, activity_type, max_score, due_at, created_at, updated_at
    `;

    return res.status(201).json({ activity: rows[0] });
  } catch (error) {
    console.error("Activity creation failed:", error);
    return res.status(500).json({ error: "Não foi possível criar a atividade." });
  }
};
