const { randomInt } = require('node:crypto');

const ANSWERS_PER_LEVEL = 5;
// Inclusive operand ranges. For division, the first range is the quotient.
// All operations keep integer, nonnegative answers within the API's bounds.
const LEVELS = [
  { name: 'Iniciante', add: [1, 9] },
  { name: 'Básico', add: [5, 20] },
  { name: 'Aprendiz', add: [10, 35], multiply: [[2, 9], [2, 5]] },
  { name: 'Intermediário', add: [20, 65], multiply: [[4, 12], [3, 8]], divide: [[3, 9], [2, 5]] },
  { name: 'Desafiador', add: [40, 99], multiply: [[6, 15], [4, 10]], divide: [[5, 12], [3, 8]] },
  { name: 'Avançado', add: [70, 160], multiply: [[10, 20], [5, 12]], divide: [[8, 18], [4, 10]] },
  { name: 'Especialista', add: [100, 260], multiply: [[12, 25], [8, 15]], divide: [[12, 25], [6, 12]] },
  { name: 'Expert', add: [150, 450], multiply: [[15, 35], [10, 20]], divide: [[15, 35], [8, 15]] },
  { name: 'Mestre', add: [250, 700], multiply: [[20, 45], [12, 25]], divide: [[20, 45], [10, 20]] },
  { name: 'Grão-mestre', add: [400, 1200], multiply: [[30, 60], [15, 30]], divide: [[30, 60], [12, 25]] },
  { name: 'Lendário', add: [700, 2000], multiply: [[40, 85], [20, 40]], divide: [[40, 85], [15, 35]] },
  { name: 'Supremo', add: [1200, 4000], multiply: [[60, 120], [30, 60]], divide: [[60, 120], [25, 50]] }
];

function difficultyFor(correctAnswers) {
  const level = Math.min(LEVELS.length, Math.floor(Math.max(0, correctAnswers) / ANSWERS_PER_LEVEL) + 1);
  return {
    level,
    levelName: LEVELS[level - 1].name,
    maxLevel: LEVELS.length,
    nextLevelIn: level === LEVELS.length ? 0 : ANSWERS_PER_LEVEL - (correctAnswers % ANSWERS_PER_LEVEL)
  };
}

function createQuestion(correctAnswers) {
  const { level } = difficultyFor(correctAnswers);
  const tier = LEVELS[level - 1];
  const operations = ['+', '-'];
  if (tier.multiply) operations.push('*');
  if (tier.divide) operations.push('/');
  const operation = operations[randomInt(operations.length)];
  const pick = ([min, max]) => randomInt(min, max + 1);
  let a, b, answer;
  switch (operation) {
    case '+':
      a = pick(tier.add); b = pick(tier.add); answer = a + b; break;
    case '-': {
      // Generate the difference first so subtraction cannot collapse to 0 or 1 at high levels.
      const difference = pick(tier.add);
      b = pick(tier.add); a = b + difference; answer = difference; break;
    }
    case '*':
      a = pick(tier.multiply[0]); b = pick(tier.multiply[1]); answer = a * b; break;
    case '/':
      answer = pick(tier.divide[0]); b = pick(tier.divide[1]); a = answer * b; break;
  }
  return { a, b, operation, answer, level };
}

module.exports = { createQuestion, difficultyFor };
