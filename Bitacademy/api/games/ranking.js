const { sql } = require("../db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const mode = String(req.query?.mode || "").trim();
    const limit = Math.min(Math.max(Number(req.query?.limit) || 10, 1), 50);
    if (!mode) return res.status(400).json({ error: "Informe o modo do jogo." });

    const rows = await sql`
      SELECT id, game_mode, game_title, score,
             correct_answers, wrong_answers, best_streak,
             duration_seconds, player_name, played_at
      FROM game_scores
      WHERE game_mode = ${mode}
      ORDER BY score DESC, correct_answers DESC, played_at ASC
      LIMIT ${limit}
    `;

    return res.status(200).json({
      ranking: rows.map((row) => ({
        id: row.id,
        mode: row.game_mode,
        title: row.game_title,
        score: row.score,
        correct: row.correct_answers,
        wrong: row.wrong_answers,
        bestStreak: row.best_streak,
        duration: row.duration_seconds,
        playerName: row.player_name,
        date: row.played_at
      }))
    });
  } catch (error) {
    console.error("Game ranking failed:", error);
    return res.status(500).json({ error: "Não foi possível carregar o ranking." });
  }
};
