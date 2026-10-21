const { randomInt } = require("node:crypto");
const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

const GAME_MODE = "math-infinite";
const GAME_TITLE = "Matemática Infinita";
const INITIAL_TIME_MS = 30_000;
const MAX_TIME_MS = 60_000;

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function createQuestion(correctAnswers) {
  const level = Math.min(8, Math.floor(correctAnswers / 5) + 1);
  const operations = level < 3 ? ["+", "-"] : level < 6 ? ["+", "-", "*"] : ["+", "-", "*", "/"];
  const operation = operations[randomInt(operations.length)];
  const max = 8 + level * 6;
  let a = randomInt(2, max + 1);
  let b = randomInt(2, max + 1);
  let answer;

  if (operation === "+") answer = a + b;
  if (operation === "-") {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  }
  if (operation === "*") {
    b = randomInt(2, Math.min(12, level + 5) + 1);
    answer = a * b;
  }
  if (operation === "/") {
    answer = randomInt(2, Math.min(12, level + 5) + 1);
    b = randomInt(2, Math.min(12, level + 4) + 1);
    a = answer * b;
  }

  return { a, b, operation, answer, level };
}

function mapState(row) {
  return {
    score: Number(row.score),
    correct: Number(row.correct_answers),
    wrong: Number(row.wrong_answers),
    streak: Number(row.streak),
    bestStreak: Number(row.best_streak),
    level: Math.min(8, Math.floor(Number(row.correct_answers) / 5) + 1),
    timeLeft: Math.ceil(Number(row.time_left_ms) / 1000),
    revision: Number(row.revision)
  };
}

function mapQuestion(row) {
  return `${row.current_a} ${row.current_operation} ${row.current_b}`;
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

async function getSession(sessionId, userId) {
  const rows = await sql`SELECT id, user_id, game_mode, status,
      current_a, current_b, current_operation, current_answer,
      score, correct_answers, wrong_answers, streak, best_streak,
      time_left_ms, revision, created_at, updated_at, finished_at,
      GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - updated_at)) * 1000)) AS elapsed_ms
    FROM game_sessions
    WHERE id = ${sessionId} AND user_id = ${userId}
    LIMIT 1`;
  return rows[0] || null;
}

async function persistBestScore(session) {
  if (Number(session.score) <= 0) return false;
  const duration = Math.max(1, Math.floor((new Date(session.finished_at) - new Date(session.created_at)) / 1000));
  const rows = await sql`WITH saved AS (
      INSERT INTO game_scores (user_id, game_mode, game_title, score, correct_answers,
        wrong_answers, best_streak, duration_seconds, player_name)
      SELECT users.id, ${GAME_MODE}, ${GAME_TITLE}, ${session.score},
        ${session.correct_answers}, ${session.wrong_answers}, ${session.best_streak},
        ${duration}, users.name
      FROM users WHERE users.id = ${session.user_id}
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
    ) SELECT saved.*, TRUE AS improved FROM saved
    UNION ALL
    SELECT game_scores.id, game_scores.game_mode, game_scores.game_title, game_scores.score,
      game_scores.correct_answers, game_scores.wrong_answers, game_scores.best_streak,
      game_scores.duration_seconds, game_scores.player_name, game_scores.played_at, FALSE AS improved
    FROM game_scores
    WHERE game_scores.user_id = ${session.user_id} AND game_scores.game_mode = ${GAME_MODE}
      AND NOT EXISTS (SELECT 1 FROM saved)
    LIMIT 1`;
  return rows[0]?.improved === true;
}

async function finishSession(session, userId) {
  let finished = session;
  if (session.status === "active") {
    const remaining = Math.max(0, Number(session.time_left_ms) - Number(session.elapsed_ms));
    const rows = await sql`UPDATE game_sessions
      SET status = 'finished', time_left_ms = ${remaining}, updated_at = NOW(),
          finished_at = NOW(), revision = revision + 1
      WHERE id = ${session.id} AND user_id = ${userId}
        AND revision = ${session.revision} AND status = 'active'
      RETURNING id, user_id, game_mode, status, current_a, current_b, current_operation,
        score, correct_answers, wrong_answers, streak, best_streak, time_left_ms,
        revision, created_at, updated_at, finished_at`;
    if (!rows.length) return null;
    finished = rows[0];
  }
  if (finished.status !== "finished") return null;

  const improved = await persistBestScore(finished);
  return {
    finished: true,
    state: mapState(finished),
    improved,
    recorded: Number(finished.score) > 0
  };
}

module.exports = async function handler(req, res) {
  try {
    const action = String(req.query?.action || (req.method === "GET" ? "ranking" : "score")).trim().toLowerCase();

    if (action === "ranking") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });
      const mode = String(req.query?.mode || "").trim();
      const limit = Math.min(Math.max(Number(req.query?.limit) || 10, 1), 50);
      if (mode !== GAME_MODE) return res.status(400).json({ error: "Modo de jogo inválido." });

      const rows = await sql`SELECT id, game_mode, game_title, score,
          correct_answers, wrong_answers, best_streak, duration_seconds, player_name, played_at
        FROM game_scores WHERE game_mode = ${GAME_MODE} AND user_id IS NOT NULL
        ORDER BY score DESC, correct_answers DESC, played_at ASC LIMIT ${limit}`;
      return res.status(200).json({ ranking: rows.map(mapScore) });
    }

    if (!["start", "answer", "finish", "abort"].includes(action)) {
      return res.status(400).json({ error: "Ação de jogo inválida." });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
    const userId = await getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Entre na sua conta para jogar pelo ranking." });
    const body = jsonBody(req);

    if (action === "start") {
      if (body.mode !== GAME_MODE) return res.status(400).json({ error: "Modo de jogo inválido." });
      const question = createQuestion(0);
      await sql`DELETE FROM game_sessions WHERE updated_at < NOW() - INTERVAL '30 days'`;
      const rows = await sql`INSERT INTO game_sessions
          (user_id, game_mode, current_a, current_b, current_operation, current_answer, time_left_ms)
        VALUES (${userId}, ${GAME_MODE}, ${question.a}, ${question.b}, ${question.operation},
          ${question.answer}, ${INITIAL_TIME_MS})
        RETURNING id, score, correct_answers, wrong_answers, streak, best_streak, time_left_ms, revision`;
      return res.status(201).json({
        sessionId: rows[0].id,
        question: `${question.a} ${question.operation} ${question.b}`,
        state: mapState(rows[0])
      });
    }

    const sessionId = String(body.sessionId || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      return res.status(400).json({ error: "Sessão de jogo inválida." });
    }
    let session = await getSession(sessionId, userId);
    if (!session) return res.status(404).json({ error: "Partida não encontrada." });
    if (session.status === "aborted") return res.status(409).json({ error: "Esta partida foi encerrada." });

    if (action === "abort") {
      if (session.status === "active") {
        await sql`UPDATE game_sessions SET status = 'aborted', time_left_ms = 0,
            updated_at = NOW(), finished_at = NOW(), revision = revision + 1
          WHERE id = ${session.id} AND user_id = ${userId}
            AND revision = ${session.revision} AND status = 'active'`;
      }
      return res.status(200).json({ ok: true });
    }

    if (session.status === "finished") {
      const result = await finishSession(session, userId);
      return res.status(200).json(result || { finished: true, state: mapState(session), improved: false, recorded: Number(session.score) > 0 });
    }

    if (action === "finish") {
      const result = await finishSession(session, userId);
      if (!result) return res.status(409).json({ error: "A partida foi atualizada em outra solicitação. Tente novamente." });
      return res.status(200).json(result);
    }

    if (!Number.isInteger(body.revision) || body.revision < 0) {
      return res.status(400).json({ error: "Versão da partida inválida." });
    }
    if (Number(body.revision) !== Number(session.revision)) {
      const remaining = Math.max(0, Number(session.time_left_ms) - Number(session.elapsed_ms));
      if (remaining <= 0) {
        const result = await finishSession(session, userId);
        if (!result) return res.status(409).json({ error: "A partida foi atualizada em outra solicitação. Tente novamente." });
        return res.status(200).json(result);
      }
      return res.status(200).json({
        accepted: false,
        finished: false,
        question: mapQuestion(session),
        state: mapState({ ...session, time_left_ms: remaining })
      });
    }
    if (!Number.isInteger(body.answer) || body.answer < -100000 || body.answer > 100000) {
      return res.status(400).json({ error: "Resposta inválida." });
    }

    const remainingMs = Math.max(0, Number(session.time_left_ms) - Number(session.elapsed_ms));
    if (remainingMs <= 0) {
      const result = await finishSession(session, userId);
      if (!result) return res.status(409).json({ error: "A partida foi atualizada em outra solicitação. Tente novamente." });
      return res.status(200).json(result);
    }

    const isCorrect = Number(body.answer) === Number(session.current_answer);
    let correct = Number(session.correct_answers);
    let wrong = Number(session.wrong_answers);
    let streak = Number(session.streak);
    let bestStreak = Number(session.best_streak);
    let score = Number(session.score);
    let timeLeftMs = remainingMs;

    if (isCorrect) {
      correct++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      const level = Math.min(8, Math.floor(Number(session.correct_answers) / 5) + 1);
      score += 10 + streak * 2 + level;
      timeLeftMs = Math.min(MAX_TIME_MS, timeLeftMs + 4000);
    } else {
      wrong++;
      streak = 0;
      timeLeftMs = Math.max(0, timeLeftMs - 5000);
    }

    const finished = timeLeftMs <= 0;
    const nextQuestion = finished ? null : createQuestion(correct);
    const rows = await sql`UPDATE game_sessions SET
        score = ${score}, correct_answers = ${correct}, wrong_answers = ${wrong},
        streak = ${streak}, best_streak = ${bestStreak}, time_left_ms = ${timeLeftMs},
        current_a = ${nextQuestion?.a ?? session.current_a},
        current_b = ${nextQuestion?.b ?? session.current_b},
        current_operation = ${nextQuestion?.operation ?? session.current_operation},
        current_answer = ${nextQuestion?.answer ?? session.current_answer},
        status = ${finished ? "finished" : "active"},
        finished_at = CASE WHEN ${finished} THEN NOW() ELSE NULL END,
        updated_at = NOW(), revision = revision + 1
      WHERE id = ${session.id} AND user_id = ${userId}
        AND revision = ${session.revision} AND status = 'active'
      RETURNING id, user_id, game_mode, status, current_a, current_b, current_operation,
        score, correct_answers, wrong_answers, streak, best_streak, time_left_ms,
        revision, created_at, updated_at, finished_at`;
    if (!rows.length) return res.status(409).json({ error: "A resposta já foi processada. Atualize a partida." });

    session = rows[0];
    if (finished) {
      const result = await finishSession(session, userId);
      return res.status(200).json({ ...result, wasCorrect: isCorrect, correctAnswer: Number(session.current_answer) });
    }
    return res.status(200).json({
      accepted: true,
      finished: false,
      wasCorrect: isCorrect,
      correctAnswer: Number(session.current_answer),
      question: mapQuestion(session),
      state: mapState(session)
    });
  } catch (error) {
    console.error("Games API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação do jogo." });
  }
};
