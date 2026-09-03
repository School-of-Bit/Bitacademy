const { sql } = require("./db");
const { getSessionUserId } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    const users = await sql`SELECT id, name, email, account_type FROM users WHERE id = ${userId} LIMIT 1`;
    if (!users.length) return res.status(401).json({ error: "Sessão inválida." });
    const user = users[0];

    const results = await sql`
      SELECT qa.quiz_title, qa.score, qa.total_questions, qa.percentage, qa.completed_at, s.slug AS materia
      FROM quiz_attempts qa
      JOIN subjects s ON s.id = qa.subject_id
      WHERE qa.user_id = ${userId}
      ORDER BY qa.completed_at DESC
      LIMIT 50
    `;

    const games = await sql`
      SELECT mode, title, score, correct, wrong, best_streak, duration, played_at
      FROM game_scores
      WHERE user_id = ${userId}
      ORDER BY played_at DESC
      LIMIT 50
    `;

    return res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, type: user.account_type },
      quizResults: results.map((row) => ({
        materia: row.materia,
        titulo: row.quiz_title,
        score: row.score,
        total: row.total_questions,
        percent: row.percentage,
        date: row.completed_at
      })),
      gameScores: games.map((row) => ({
        mode: row.mode,
        title: row.title,
        score: row.score,
        correct: row.correct,
        wrong: row.wrong,
        bestStreak: row.best_streak,
        duration: row.duration,
        date: row.played_at
      }))
    });
  } catch (error) {
    console.error("Profile lookup failed:", error);
    return res.status(500).json({ error: "Não foi possível carregar o perfil.", diagnostic: error?.message || "Erro interno desconhecido." });
  }
};
