class MathInfiniteGame {
  constructor() {
    this.initialTime = 30;
    this.maxTime = 60;
    this.timer = null;
    this.isRunning = false;
    this.state = this.createInitialState();

    this.elements = {
      time: document.getElementById("time-left"),
      score: document.getElementById("score"),
      streak: document.getElementById("streak"),
      level: document.getElementById("level-label"),
      feedback: document.getElementById("feedback"),
      question: document.getElementById("question"),
      form: document.getElementById("answer-form"),
      answer: document.getElementById("answer"),
      start: document.getElementById("start-game"),
      reset: document.getElementById("reset-game"),
      ranking: document.getElementById("ranking-list")
    };

    this.bindEvents();
    this.render();
    this.renderRanking();
  }

  createInitialState() {
    return {
      timeLeft: this.initialTime,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correct: 0,
      wrong: 0,
      level: 1,
      currentAnswer: null,
      startedAt: null
    };
  }

  bindEvents() {
    this.elements.start.addEventListener("click", () => this.start());
    this.elements.reset.addEventListener("click", () => this.reset());
    this.elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submitAnswer();
    });
  }

  start() {
    this.state = this.createInitialState();
    this.state.startedAt = Date.now();
    this.isRunning = true;
    this.elements.answer.disabled = false;
    this.elements.form.querySelector("button").disabled = false;
    this.elements.start.disabled = true;
    this.elements.reset.disabled = false;
    this.elements.feedback.textContent = "Valendo!";
    this.nextQuestion();
    this.render();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  reset() {
    this.finish(false);
    this.state = this.createInitialState();
    this.elements.question.textContent = "?";
    this.elements.answer.value = "";
    this.elements.feedback.textContent = "Partida reiniciada. Comece de novo quando quiser.";
    this.render();
  }

  tick() {
    if (!this.isRunning) return;
    this.state.timeLeft -= 1;
    if (this.state.timeLeft <= 0) {
      this.state.timeLeft = 0;
      this.finish(true);
    }
    this.render();
  }

  nextQuestion() {
    const level = Math.min(8, Math.floor(this.state.correct / 5) + 1);
    this.state.level = level;
    const operations = level < 3 ? ["+", "-"] : level < 6 ? ["+", "-", "*"] : ["+", "-", "*", "/"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const max = 8 + level * 6;
    let a = this.randomNumber(2, max);
    let b = this.randomNumber(2, max);
    let answer;

    if (operation === "+") answer = a + b;
    if (operation === "-") {
      if (b > a) [a, b] = [b, a];
      answer = a - b;
    }
    if (operation === "*") {
      b = this.randomNumber(2, Math.min(12, level + 5));
      answer = a * b;
    }
    if (operation === "/") {
      answer = this.randomNumber(2, Math.min(12, level + 5));
      b = this.randomNumber(2, Math.min(12, level + 4));
      a = answer * b;
    }

    this.state.currentAnswer = answer;
    this.elements.question.textContent = `${a} ${operation} ${b}`;
    this.elements.answer.value = "";
    this.elements.answer.focus();
    this.render();
  }

  submitAnswer() {
    if (!this.isRunning) return;
    const userAnswer = Number(this.elements.answer.value);
    if (!Number.isFinite(userAnswer)) return;

    if (userAnswer === this.state.currentAnswer) {
      this.state.correct += 1;
      this.state.streak += 1;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      this.state.score += 10 + this.state.streak * 2 + this.state.level;
      this.state.timeLeft = Math.min(this.maxTime, this.state.timeLeft + 4);
      this.elements.feedback.textContent = "Acertou! +4s";
    } else {
      this.state.wrong += 1;
      this.state.streak = 0;
      this.state.timeLeft = Math.max(0, this.state.timeLeft - 5);
      this.elements.feedback.textContent = `Errou. A resposta era ${this.state.currentAnswer}. -5s`;
    }

    if (this.state.timeLeft <= 0) {
      this.finish(true);
      return;
    }
    this.nextQuestion();
  }

  async finish(saveScore) {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.elements.answer.disabled = true;
    this.elements.form.querySelector("button").disabled = true;
    this.elements.start.disabled = false;
    this.elements.reset.disabled = true;

    if (saveScore && this.state.score > 0) {
      try {
        await window.BitAcademyAuth?.recordGameScore({
          mode: "math-infinite",
          title: "Matemática Infinita",
          score: this.state.score,
          correct: this.state.correct,
          wrong: this.state.wrong,
          bestStreak: this.state.bestStreak,
          duration: Math.round((Date.now() - this.state.startedAt) / 1000)
        });
        this.elements.feedback.textContent = "Fim de jogo! Pontuação salva no ranking.";
      } catch (error) {
        this.elements.feedback.textContent = `Fim de jogo! ${error.message}`;
      }
      await this.renderRanking();
    } else if (saveScore) {
      this.elements.feedback.textContent = "Fim de jogo! Tente marcar pontos na próxima.";
    }
    this.render();
  }

  render() {
    this.elements.time.textContent = `${this.state.timeLeft}s`;
    this.elements.score.textContent = this.state.score;
    this.elements.streak.textContent = this.state.streak;
    this.elements.level.textContent = `Nível ${this.state.level}`;
    document.body.classList.toggle("danger-time", this.state.timeLeft <= 8);
  }

  async renderRanking() {
    try {
      await window.BitAcademyAuth?.ready;
      const scores = await window.BitAcademyAuth?.getGameRanking("math-infinite", 8) || [];
      if (!scores.length) {
        this.elements.ranking.innerHTML = "<p>Nenhuma pontuação registrada ainda.</p>";
        return;
      }
      this.elements.ranking.innerHTML = scores.map((score, index) => `
        <article>
          <span>${index + 1}</span>
          <div>
            <strong>${this.escapeHtml(score.playerName)}</strong>
            <small>${new Date(score.date).toLocaleDateString("pt-BR")} · ${score.correct} acertos</small>
          </div>
          <b>${score.score}</b>
        </article>
      `).join("");
    } catch (error) {
      this.elements.ranking.innerHTML = `<p>Não foi possível carregar o ranking.</p>`;
    }
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MathInfiniteGame();
});
