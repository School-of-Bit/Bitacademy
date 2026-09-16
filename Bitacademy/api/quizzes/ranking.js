const { sql } = require("../db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const materia = String(req.query?.materia || "").trim().toLowerCase();
    const limit = Math.min(Math.max(Number(req.query?.limit) || 10, 1), 50);
    if (!materia) return res.status(400).json({ error: "Informe a disciplina." });

    const rows = await sql`
      SELECT qa.id, qa.quiz_title, qa.score, qa.total_questions, qa.percentage, qa.player_name, qa.completed_at
      FROM quiz_attempts qa
      JOIN subjects s ON s.id = qa.subject_id
      WHERE s.slug = ${materia}
      ORDER BY qa.percentage DESC, qa.score DESC, qa.completed_at ASC
      LIMIT ${limit}
    `;

    return res.status(200).json({
      ranking: rows.map((row) => ({
        id: row.id,
        titulo: row.quiz_title,
        score: row.score,
        total: row.total_questions,
        percent: row.percentage,
        playerName: row.player_name,
        date: row.completed_at
      }))
    });
  } catch (error) {
    console.error("Quiz ranking failed:", error);
    return res.status(500).json({ error: "Não foi possível carregar o ranking." });
  }
};
