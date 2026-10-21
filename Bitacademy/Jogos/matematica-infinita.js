class MathInfiniteGame {
  constructor() {
    this.initialTime = 30;
    this.timer = null;
    this.isRunning = false;
    this.pendingAnswer = false;
    this.sessionId = null;
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
      revision: 0
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

  async start() {
    if (this.isRunning) return;
    this.elements.start.disabled = true;
    this.elements.feedback.textContent = "Preparando partida...";
    try {
      await window.BitAcademyAuth?.ready;
      if (!window.BitAcademyAuth?.getCurrentUser()) throw new Error("Entre na sua conta para iniciar uma partida ranqueada.");
      const game = await window.BitAcademyAuth.startGame();
      this.sessionId = game.sessionId;
      this.state = this.createInitialState();
      this.applyServerState(game);
      this.isRunning = true;
      this.elements.answer.disabled = false;
      this.elements.form.querySelector("button").disabled = false;
      this.elements.start.disabled = true;
      this.elements.reset.disabled = false;
      this.elements.feedback.textContent = "Valendo!";
      this.timer = setInterval(() => this.tick(), 1000);
    } catch (error) {
      this.elements.start.disabled = false;
      this.elements.feedback.textContent = error.message;
    }
  }

  reset() {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.pendingAnswer = false;
    if (this.sessionId) window.BitAcademyAuth?.abortGame?.(this.sessionId).catch(() => {});
    this.sessionId = null;
    this.state = this.createInitialState();
    this.elements.answer.disabled = true;
    this.elements.form.querySelector("button").disabled = true;
    this.elements.start.disabled = false;
    this.elements.reset.disabled = true;
    this.elements.question.textContent = "?";
    this.elements.answer.value = "";
    this.elements.feedback.textContent = "Partida reiniciada. Comece de novo quando quiser.";
    this.render();
  }

  tick() {
    if (!this.isRunning || this.pendingAnswer) return;
    this.state.timeLeft -= 1;
    if (this.state.timeLeft <= 0) {
      this.state.timeLeft = 0;
      this.finish();
    }
    this.render();
  }

  applyServerState(game) {
    const state = game.state;
    this.state.score = Number(state.score);
    this.state.correct = Number(state.correct);
    this.state.wrong = Number(state.wrong);
    this.state.streak = Number(state.streak);
    this.state.bestStreak = Number(state.bestStreak);
    this.state.level = Number(state.level);
    this.state.timeLeft = Number(state.timeLeft);
    this.state.revision = Number(state.revision);
    if (game.question) this.elements.question.textContent = game.question;
    this.elements.answer.value = "";
    this.render();
  }

  async submitAnswer() {
    if (!this.isRunning || this.pendingAnswer) return;
    const userAnswer = Number(this.elements.answer.value);
    if (!Number.isInteger(userAnswer)) return;
    this.pendingAnswer = true;
    this.elements.answer.disabled = true;
    this.elements.form.querySelector("button").disabled = true;
    this.elements.reset.disabled = true;
    this.elements.feedback.textContent = "Verificando resposta...";
    try {
      const game = await window.BitAcademyAuth.submitGameAnswer({
        sessionId: this.sessionId,
        answer: userAnswer,
        revision: this.state.revision
      });
      this.applyServerState(game);
      if (game.finished) {
        this.completeGame(game);
        return;
      }
      this.elements.feedback.textContent = game.accepted === false
        ? "A resposta já havia sido enviada. Questão atualizada."
        : game.wasCorrect ? "Acertou! +4s" : `Errou. A resposta era ${game.correctAnswer}. -5s`;
      this.elements.answer.disabled = false;
      this.elements.form.querySelector("button").disabled = false;
      this.elements.reset.disabled = false;
      this.elements.answer.focus();
    } catch (error) {
      this.elements.feedback.textContent = error.message;
      this.elements.answer.disabled = false;
      this.elements.form.querySelector("button").disabled = false;
      this.elements.reset.disabled = false;
      this.elements.answer.focus();
    } finally {
      this.pendingAnswer = false;
    }
  }

  async finish() {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.pendingAnswer = true;
    this.elements.answer.disabled = true;
    this.elements.form.querySelector("button").disabled = true;
    this.elements.start.disabled = true;
    this.elements.reset.disabled = true;
    try {
      const result = await window.BitAcademyAuth.finishGame(this.sessionId);
      this.completeGame(result);
    } catch (error) {
      this.elements.feedback.textContent = `Fim de jogo! ${error.message}`;
      this.elements.start.disabled = true;
      this.elements.reset.disabled = false;
    } finally {
      this.pendingAnswer = false;
    }
  }

  async completeGame(result) {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.sessionId = null;
    this.pendingAnswer = false;
    this.state = { ...this.state, ...result.state };
    this.elements.answer.disabled = true;
    this.elements.form.querySelector("button").disabled = true;
    this.elements.start.disabled = false;
    this.elements.reset.disabled = true;
    if (!result.recorded) this.elements.feedback.textContent = "Fim de jogo! Nenhum ponto foi marcado.";
    else this.elements.feedback.textContent = result.improved
      ? "Fim de jogo! Recorde atualizado no ranking."
      : "Fim de jogo! Seu recorde no ranking continua sendo sua melhor pontuação.";
    this.render();
    await this.renderRanking();
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
