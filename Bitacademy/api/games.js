const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

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

function maximumScoreForCorrectAnswers(correct) {
  let levelBonus = 0;
  for (let level = 1; level <= 7; level++) {
    const first = level === 1 ? 1 : (level - 1) * 5;
    const last = level === 1 ? 4 : level * 5 - 1;
    const count = Math.max(0, Math.min(correct, last) - first + 1);
    levelBonus += count * level;
  }
  if (correct >= 35) levelBonus += (correct - 34) * 8;
  return (10 * correct) + (correct * (correct + 1) / 2) + levelBonus;
}

module.exports = async function handler(req, res) {
  try {
    const action = String(req.query?.action || (req.method === "GET" ? "ranking" : "score")).trim().toLowerCase();

    if (action === "ranking") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

      const mode = String(req.query?.mode || "").trim();
      const limit = Math.min(Math.max(Number(req.query?.limit) || 10, 1), 50);
      if (mode !== "math-infinite") return res.status(400).json({ error: "Modo de jogo inválido." });

      const rows = await sql`
        SELECT id, game_mode, game_title, score,
               correct_answers, wrong_answers, best_streak,
               duration_seconds, player_name, played_at
        FROM game_scores
        WHERE game_mode = ${mode} AND user_id IS NOT NULL
        ORDER BY score DESC, correct_answers DESC, played_at ASC
        LIMIT ${limit}
      `;

      return res.status(200).json({ ranking: rows.map(mapScore) });
    }

    if (action === "score") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

      const body = jsonBody(req);
      const mode = String(body.mode || "").trim();
      const score = Number(body.score);
      const correct = Number(body.correct || 0);
      const wrong = Number(body.wrong || 0);
      const bestStreak = Number(body.bestStreak || 0);
      const duration = Number(body.duration || 0);
      const userId = await getSessionUserId(req);
      if (!userId) return res.status(401).json({ error: "Entre na sua conta para salvar resultados no ranking." });

      if (mode !== "math-infinite" || !Number.isInteger(score) || score <= 0 || score > 2147483647
        || !Number.isInteger(correct) || correct < 1 || correct > 100000
        || !Number.isInteger(wrong) || wrong < 0 || wrong > 100000
        || correct + wrong > 100000
        || !Number.isInteger(bestStreak) || bestStreak < 1 || bestStreak > correct
        || !Number.isInteger(duration) || duration < 1 || duration > 86400
        || score > maximumScoreForCorrectAnswers(correct)) {
        return res.status(400).json({ error: "Dados da pontuação inválidos." });
      }

      const rows = await sql`WITH saved AS (
          INSERT INTO game_scores (user_id, game_mode, game_title, score, correct_answers, wrong_answers, best_streak, duration_seconds, player_name)
          SELECT users.id, ${mode}, 'Matemática Infinita', ${score}, ${correct}, ${wrong}, ${bestStreak}, ${duration}, users.name
          FROM users WHERE users.id = ${userId}
          ON CONFLICT (user_id, game_mode) WHERE user_id IS NOT NULL
          DO UPDATE SET game_title = EXCLUDED.game_title, score = EXCLUDED.score,
            correct_answers = EXCLUDED.correct_answers, wrong_answers = EXCLUDED.wrong_answers,
            best_streak = EXCLUDED.best_streak, duration_seconds = EXCLUDED.duration_seconds,
            player_name = EXCLUDED.player_name, played_at = NOW()
          WHERE EXCLUDED.score > game_scores.score
            OR (EXCLUDED.score = game_scores.score AND EXCLUDED.correct_answers > game_scores.correct_answers)
            OR (EXCLUDED.score = game_scores.score AND EXCLUDED.correct_answers = game_scores.correct_answers
                AND EXCLUDED.best_streak > game_scores.best_streak)
          RETURNING id, game_mode, game_title, score, correct_answers, wrong_answers,
            best_streak, duration_seconds, player_name, played_at
        ) SELECT saved.id, saved.game_mode, saved.game_title, saved.score,
            saved.correct_answers, saved.wrong_answers, saved.best_streak,
            saved.duration_seconds, saved.player_name, saved.played_at, TRUE AS improved
          FROM saved
        UNION ALL
        SELECT game_scores.id, game_scores.game_mode, game_scores.game_title, game_scores.score,
            game_scores.correct_answers, game_scores.wrong_answers, game_scores.best_streak,
            game_scores.duration_seconds, game_scores.player_name, game_scores.played_at, FALSE AS improved
          FROM game_scores
          WHERE game_scores.user_id = ${userId} AND game_scores.game_mode = ${mode}
            AND NOT EXISTS (SELECT 1 FROM saved)
        LIMIT 1
      `;

      if (!rows.length) return res.status(401).json({ error: "Sessão inválida." });
      return res.status(200).json({ result: { ...mapScore(rows[0]), improved: rows[0].improved } });
    }

    return res.status(400).json({ error: "Ação de jogo inválida." });
  } catch (error) {
    console.error("Games API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação do jogo." });
  }
};
