const { sql } = require("./db");
const { getSessionUserId } = require("./_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function mapScore(row) {
  return {
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
  };
}

module.exports = async function handler(req, res) {
  try {
    const action = String(req.query?.action || (req.method === "GET" ? "ranking" : "score")).trim().toLowerCase();

    if (action === "ranking") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

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

      return res.status(200).json({ ranking: rows.map(mapScore) });
    }

    if (action === "score") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

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
        INSERT INTO game_scores (user_id, game_mode, game_title, score, correct_answers, wrong_answers, best_streak, duration_seconds, player_name)
        VALUES (${userId}, ${mode}, ${title}, ${Math.round(score)}, ${correct}, ${wrong}, ${bestStreak}, ${duration}, ${playerName})
        RETURNING id, game_mode, game_title, score, correct_answers, wrong_answers, best_streak, duration_seconds, player_name, played_at
      `;

      return res.status(201).json({ result: mapScore(rows[0]) });
    }

    return res.status(400).json({ error: "Ação de jogo inválida." });
  } catch (error) {
    console.error("Games API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação do jogo." });
  }
};
