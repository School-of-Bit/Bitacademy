const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

const QUIZ_CONFIG = {
  matematica: { title: "Matemática Avançada", answers: [1, 0, 0, 2] },
  portugues: { title: "Língua Portuguesa & Literatura", answers: [0, 1, 0] },
  ciencias: { title: "Ciências da Natureza", answers: [1, 2, 1] },
  filosofia: { title: "Filosofia Moderna e Ética", answers: [1, 2] },
  historia: { title: "História", answers: [0, 2, 2] },
  geografia: { title: "Geografia", answers: [1, 2, 0] },
  artes: { title: "Artes", answers: [1, 0, 2] },
  ingles: { title: "Inglês", answers: [1, 1, 3] }
};

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  try {
    const action = String(req.query?.action || (req.method === "GET" ? "ranking" : "result")).trim().toLowerCase();

    if (action === "ranking") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

      const materia = String(req.query?.materia || "").trim().toLowerCase();
      const limit = Math.min(Math.max(Number(req.query?.limit) || 10, 1), 50);
      if (!Object.hasOwn(QUIZ_CONFIG, materia)) return res.status(400).json({ error: "Disciplina de quiz inválida." });

      const rows = await sql`
        SELECT qa.id, qa.quiz_title, qa.score, qa.total_questions, qa.percentage, qa.player_name, qa.completed_at
        FROM quiz_attempts qa
        JOIN subjects s ON s.id = qa.subject_id
        WHERE s.slug = ${materia} AND qa.user_id IS NOT NULL
        ORDER BY qa.score DESC, qa.percentage DESC, qa.completed_at ASC
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
    }

    if (action === "result") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

      const body = jsonBody(req);
      const materia = String(body.materia || "").trim().toLowerCase();
      const userId = await getSessionUserId(req);
      if (!userId) return res.status(401).json({ error: "Entre na sua conta para salvar resultados no ranking." });
      const quiz = Object.hasOwn(QUIZ_CONFIG, materia) ? QUIZ_CONFIG[materia] : null;
      if (!quiz) return res.status(400).json({ error: "Disciplina de quiz inválida." });
      const answers = body.answers;

      if (!Array.isArray(answers) || answers.length !== quiz.answers.length) {
        return res.status(400).json({ error: "Respostas do quiz inválidas." });
      }
      const seen = new Set();
      let score = 0;
      for (const answer of answers) {
        const questionIndex = answer?.questionIndex;
        const selected = answer?.selected;
        if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= quiz.answers.length || seen.has(questionIndex)
          || !Number.isInteger(selected) || selected < 0 || selected > 3) {
          return res.status(400).json({ error: "Respostas do quiz inválidas." });
        }
        seen.add(questionIndex);
        if (quiz.answers[questionIndex] === selected) score++;
      }

      const total = quiz.answers.length;
      const percentage = Math.round((score / total) * 100);
      const rows = await sql`WITH subject AS (
          SELECT id FROM subjects WHERE slug = ${materia}
        ), saved AS (
          INSERT INTO quiz_attempts
            (user_id, subject_id, quiz_title, score, total_questions, percentage, player_name, started_at, completed_at)
          SELECT ${userId}, subject.id, ${quiz.title}, ${score}, ${total}, ${percentage}, users.name, NOW(), NOW()
          FROM subject JOIN users ON users.id = ${userId}
          WHERE TRUE
          ON CONFLICT (user_id, subject_id) WHERE user_id IS NOT NULL
          DO UPDATE SET quiz_title = EXCLUDED.quiz_title, score = EXCLUDED.score,
            total_questions = EXCLUDED.total_questions, percentage = EXCLUDED.percentage,
            player_name = EXCLUDED.player_name, started_at = EXCLUDED.started_at, completed_at = NOW()
          WHERE EXCLUDED.score > quiz_attempts.score
          RETURNING id, quiz_title, score, total_questions, percentage, player_name, completed_at
        ) SELECT saved.id, saved.quiz_title, saved.score, saved.total_questions,
            saved.percentage, saved.player_name, saved.completed_at, TRUE AS improved
          FROM saved
        UNION ALL
        SELECT qa.id, qa.quiz_title, qa.score, qa.total_questions, qa.percentage,
            qa.player_name, qa.completed_at, FALSE AS improved
          FROM quiz_attempts qa JOIN subject ON subject.id = qa.subject_id
          WHERE qa.user_id = ${userId} AND NOT EXISTS (SELECT 1 FROM saved)
        LIMIT 1
      `;

      if (!rows.length) return res.status(404).json({ error: "Disciplina não encontrada." });

      return res.status(200).json({
        result: {
          id: rows[0].id,
          materia,
          titulo: rows[0].quiz_title,
          score: rows[0].score,
          total: rows[0].total_questions,
          percent: rows[0].percentage,
          playerName: rows[0].player_name,
          date: rows[0].completed_at,
          improved: rows[0].improved
        }
      });
    }

    return res.status(400).json({ error: "Ação de quiz inválida." });
  } catch (error) {
    console.error("Quizzes API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação do quiz." });
  }
};
