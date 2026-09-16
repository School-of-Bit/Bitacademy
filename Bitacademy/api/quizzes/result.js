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
    const body = jsonBody(req);
    const materia = String(body.materia || "").trim().toLowerCase();
    const titulo = String(body.titulo || "").trim();
    const score = Number(body.score);
    const total = Number(body.total);
    const userId = getSessionUserId(req);

    if (!materia || !titulo || !Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total) {
      return res.status(400).json({ error: "Dados do resultado inválidos." });
    }

    const subjects = await sql`SELECT id FROM subjects WHERE slug = ${materia} LIMIT 1`;
    if (!subjects.length) return res.status(400).json({ error: "Disciplina não encontrada." });

    let playerName = "Visitante";
    if (userId) {
      const users = await sql`SELECT name FROM users WHERE id = ${userId} LIMIT 1`;
      if (users.length) playerName = users[0].name;
    }

    const percentage = Math.round((score / total) * 100);
    const rows = await sql`
      INSERT INTO quiz_attempts
        (user_id, subject_id, quiz_title, score, total_questions, percentage, player_name, started_at, completed_at)
      VALUES
        (${userId}, ${subjects[0].id}, ${titulo}, ${score}, ${total}, ${percentage}, ${playerName}, NOW(), NOW())
      RETURNING id, quiz_title, score, total_questions, percentage, player_name, completed_at
    `;

    return res.status(201).json({
      result: {
        id: rows[0].id,
        materia,
        titulo: rows[0].quiz_title,
        score: rows[0].score,
        total: rows[0].total_questions,
        percent: rows[0].percentage,
        playerName: rows[0].player_name,
        date: rows[0].completed_at
      }
    });
  } catch (error) {
    console.error("Quiz result save failed:", error);
    return res.status(500).json({ error: "Não foi possível salvar o resultado." });
  }
};
