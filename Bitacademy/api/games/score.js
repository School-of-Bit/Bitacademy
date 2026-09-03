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
    const mode = String(body.mode || "").trim();
    const title = String(body.title || "").trim();
    const score = Number(body.score);
    const correct = Number(body.correct || 0);
    const wrong = Number(body.wrong || 0);
    const bestStreak = Number(body.bestStreak || 0);
    const duration = Number(body.duration || 0);
    const userId = getSessionUserId(req);

    if (!mode || !title || !Number.isFinite(score) || score < 0 || !Number.isInteger(correct) || !Number.isInteger(wrong) || !Number.isInteger(bestStreak) || !Number.isInteger(duration)) {
      return res.status(400).json({ error: "Dados da pontuação inválidos." });
    }

    let playerName = "Visitante";
    if (userId) {
      const users = await sql`SELECT name FROM users WHERE id = ${userId} LIMIT 1`;
      if (users.length) playerName = users[0].name;
    }

    const rows = await sql`
      INSERT INTO game_scores (user_id, mode, title, score, correct, wrong, best_streak, duration, player_name)
      VALUES (${userId}, ${mode}, ${title}, ${Math.round(score)}, ${correct}, ${wrong}, ${bestStreak}, ${duration}, ${playerName})
      RETURNING id, mode, title, score, correct, wrong, best_streak, duration, player_name, played_at
    `;

    return res.status(201).json({
      result: {
        id: rows[0].id,
        mode: rows[0].mode,
        title: rows[0].title,
        score: rows[0].score,
        correct: rows[0].correct,
        wrong: rows[0].wrong,
        bestStreak: rows[0].best_streak,
        duration: rows[0].duration,
        playerName: rows[0].player_name,
        date: rows[0].played_at
      }
    });
  } catch (error) {
    console.error("Game score save failed:", error);
    return res.status(500).json({ error: "Não foi possível salvar a pontuação.", diagnostic: error?.message || "Erro interno desconhecido." });
  }
};
