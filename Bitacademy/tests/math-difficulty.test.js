const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const difficulty = require('../lib/math-difficulty');
const { createQuestion, difficultyFor } = difficulty;

test('difficulty advances every five total correct answers and stops at level 12', () => {
  for (let level = 1; level <= 12; level++) {
    const start = (level - 1) * 5;
    for (let i = 0; i < 5; i++) {
      const state = difficultyFor(start + i);
      assert.equal(state.level, level);
      assert.equal(state.nextLevelIn, level === 12 ? 0 : 5 - i);
      assert.equal(state.maxLevel, 12);
      assert.ok(state.levelName);
    }
  }
  assert.equal(difficultyFor(10000).level, 12);
});

test('every tier produces correct integer arithmetic within the API limits', () => {
  for (let level = 1; level <= 12; level++) {
    for (let i = 0; i < 300; i++) {
      const q = createQuestion((level - 1) * 5);
      const evaluate = { '+': () => q.a + q.b, '-': () => q.a - q.b,
        '*': () => q.a * q.b, '/': () => q.a / q.b };
      assert.equal(q.level, level);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 100000);
      assert.equal(q.answer, evaluate[q.operation]());
      if (level < 3) assert.ok(['+', '-'].includes(q.operation));
      if (level < 4) assert.notEqual(q.operation, '/');
    }
  }
});

test('every operation has increasing operand ranges and never produces trivial high-level subtraction', () => {
  // Force each available operation and its minimum / maximum random operand.
  const code = fs.readFileSync(path.join(__dirname, '../lib/math-difficulty.js'), 'utf8');
  for (const edge of ['min', 'max']) {
    for (const op of [0, 1, 2, 3]) {
      const mod = { exports: {} };
      vm.runInNewContext(code, { module: mod, require: () => ({ randomInt: (a, b) => {
        if (b === undefined) { assert.ok(op < a); return op; }
        return edge === 'min' ? a : b - 1;
      } }) });
      let previous = 0;
      for (let level = op === 2 ? 3 : op === 3 ? 4 : 1; level <= 12; level++) {
        const q = mod.exports.createQuestion((level - 1) * 5);
        assert.equal(q.operation, ['+', '-', '*', '/'][op]);
        assert.ok(q.answer > previous);
        previous = q.answer;
      }
    }
  }
});

const sessionId = '12345678-1234-1234-1234-123456789abc';
function mockGame() {
  let row = { id: sessionId, user_id: 'student', status: 'active', game_mode: 'math-infinite',
    current_a: 3, current_b: 4, current_operation: '+', current_answer: 7,
    score: 10, correct_answers: 4, wrong_answers: 0, streak: 4, best_streak: 4,
    time_left_ms: 30000, elapsed_ms: 1000, revision: 4 };
  const sql = async (strings, ...values) => {
    const query = strings.join('?');
    if (query.includes('SELECT id, user_id, game_mode, status,')) return [{ ...row }];
    if (query.includes('UPDATE game_sessions SET') && query.includes('current_a =')) {
      const [score, correct, wrong, streak, best, time, a, b, operation, answer, status] = values;
      row = { ...row, score, correct_answers: correct, wrong_answers: wrong, streak, best_streak: best,
        time_left_ms: time, current_a: a, current_b: b, current_operation: operation, current_answer: answer,
        status, revision: row.revision + 1 };
      // The real UPDATE does not return current_answer.
      const { current_answer, ...returned } = row;
      return [returned];
    }
    throw new Error('Unexpected SQL: ' + query);
  };
  const mod = { exports: {} };
  const code = fs.readFileSync(path.join(__dirname, '../api/games.js'), 'utf8');
  vm.runInNewContext(code, { module: mod, require: name => ({
    '../lib/math-difficulty': difficulty, '../lib/db': { sql },
    '../lib/_auth': { getSessionUserId: async () => 'student' }
  }[name]), console });
  return { row: () => row, answer: async (answer, revision, extras = {}) => {
    const res = { status(n) { this.statusCode = n; return this; }, json(d) { this.data = d; return this; } };
    await mod.exports({ method: 'POST', query: { action: 'answer' }, body: { sessionId, answer, revision, ...extras } }, res);
    assert.equal(res.statusCode, 200);
    return res.data;
  } };
}

test('server advances on fifth correct answer, ignores forged level, and reveals only previous answer', async () => {
  const game = mockGame();
  const result = await game.answer(7, 4, { level: 12, correct: 999 });
  assert.equal(result.wasCorrect, true);
  assert.equal(result.correctAnswer, 7);
  assert.equal(result.state.correct, 5);
  assert.equal(result.state.level, 2);
  assert.equal(result.state.nextLevelIn, 5);
  assert.equal(result.question, `${game.row().current_a} ${game.row().current_operation} ${game.row().current_b}`);
  assert.equal(result.state.score, 31);
  const wrong = await game.answer(game.row().current_answer + 1, 5);
  assert.equal(wrong.wasCorrect, false);
  assert.equal(wrong.state.correct, 5);
  assert.equal(wrong.state.level, 2);
  assert.equal(wrong.state.streak, 0);
  assert.equal(wrong.state.wrong, 1);
  const replay = await game.answer(7, 4);
  assert.equal(replay.accepted, false);
  assert.equal(replay.state.correct, 5);
  assert.equal(replay.state.level, 2);
});
