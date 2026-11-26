// Quiz: perguntas e correção fornecidas pela API; sem gabarito no cliente.
class QuizEngine {
  constructor(quiz, token) {
    this.materiaInfo = quiz;
    this.perguntas = quiz.perguntas;
    this.token = token;
    this.atual = 0;
    this.respostasUsuario = [];
    this.finalizado = false;
  }
  get perguntaAtual() { return this.perguntas[this.atual]; }
  validarResposta(indice) {
    if (this.finalizado || this.respostasUsuario.length !== this.atual || !Number.isInteger(indice) || indice < 0 || indice >= this.perguntaAtual.opcoes.length) return false;
    this.respostasUsuario.push({ questionIndex: this.atual, selected: indice });
    return true;
  }
  proximo() {
    if (this.respostasUsuario.length !== this.atual + 1) return false;
    if (this.atual < this.perguntas.length - 1) { this.atual++; return true; }
    this.finalizado = true;
    return false;
  }
}

class QuizUI {
  constructor(containerId, materia, round) {
    this.container = document.getElementById(containerId);
    this.materia = materia;
    this.engine = new QuizEngine(round.quiz, round.token);
    this.init();
  }

  init() {
    this.container.style.setProperty("--quiz-accent", this.engine.materiaInfo.cor);
    this.renderEstrutura();
    this.renderPergunta();
  }

  renderTopbar() {
    return `
      <nav class="quiz-topbar" aria-label="Navegação do quiz">
        <a class="quiz-nav-link" href="../materia.html?slug=${encodeURIComponent(this.materia)}"><i data-lucide="arrow-left" data-lucide-size="16"></i> Voltar para ${this.escapeHtml(this.engine.materiaInfo.titulo)}</a>
        <div class="quiz-topbar-right">
          <a class="quiz-nav-link subtle" href="../Bitacademy.html">Página Inicial</a>
          <span data-auth-status></span>
        </div>
      </nav>
    `;
  }

  renderEstrutura() {
    const iconHtml = window.BitAcademyIcons
      ? window.BitAcademyIcons.forSubject(this.materia, this.engine.materiaInfo.emoji, 24)
      : this.engine.materiaInfo.emoji;
    this.container.innerHTML = `
      ${this.renderTopbar()}
      <div class="quiz-card">
        <div class="quiz-header" style="border-left: 6px solid ${this.engine.materiaInfo.cor}">
          <div class="quiz-header-top">
            <span class="quiz-badge"><i data-lucide="clipboard-check" data-lucide-size="14"></i> Quiz de Fixação</span>
            <span class="quiz-step-counter">Questão <b id="current-idx">1</b> de ${this.engine.perguntas.length}</span>
          </div>
          <h2 style="display: flex; align-items: center; gap: 10px;">${iconHtml} ${this.engine.materiaInfo.titulo}</h2>
          <div class="quiz-meta">
            <div class="progress-bg"><div id="progress-bar" class="progress-fill"></div></div>
          </div>
        </div>
        <div id="quiz-content"></div>
        <div id="quiz-footer" class="hidden">
           <button id="btn-next" class="btn-primary">Próxima Pergunta →</button>
        </div>
      </div>
    `;

    this.btnNext = document.getElementById("btn-next");
    this.btnNext.addEventListener("click", () => this.handleNext());
    window.BitAcademyAuth?.ready?.then(() => window.BitAcademyAuth?.renderAuthStatus?.());
  }

  renderPergunta() {
    const p = this.engine.perguntaAtual;
    const content = document.getElementById("quiz-content");

    document.getElementById("current-idx").textContent = this.engine.atual + 1;
    document.getElementById("progress-bar").style.width = `${((this.engine.atual + 1) / this.engine.perguntas.length) * 100}%`;

    content.innerHTML = `
      <div class="question-text">${this.escapeHtml(p.pergunta)}</div>
      <div class="options-grid">
        ${p.opcoes.map((opt, i) => `
          <button class="option-btn" data-idx="${i}">
            <span class="label">${String.fromCharCode(65 + i)}</span>
            <span class="text">${this.escapeHtml(opt)}</span>
          </button>
        `).join("")}
      </div>
      <div id="feedback-area" class="feedback-box hidden"></div>
    `;

    content.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleSelection(e));
    });

    document.getElementById("quiz-footer").classList.add("hidden");
    window.BitAcademyMotion?.panelIn(content.querySelector(".question-text"));
    window.BitAcademyMotion?.staggerCards(content, ".option-btn", { stagger: 0.045, y: 12 });
  }

  handleSelection(e) {
    const btn = e.currentTarget;
    const idx = parseInt(btn.dataset.idx, 10);
    const result = this.engine.validarResposta(idx);

    if (!result) return;

    document.querySelectorAll(".option-btn").forEach(b => { b.disabled = true; });
    btn.classList.add("selected");
    const feedback = document.getElementById("feedback-area");
    feedback.classList.remove("hidden");
    feedback.textContent = "Resposta registrada. O gabarito será exibido ao final do quiz.";

    this.btnNext.textContent = this.engine.atual === this.engine.perguntas.length - 1 ? "Ver Resultado Final 🏆" : "Próxima Questão →";
    document.getElementById("quiz-footer").classList.remove("hidden");
  }

  handleNext() {
    if (this.engine.finalizado) return;
    if (this.engine.proximo()) {
      this.renderPergunta();
    } else {
      this.btnNext.disabled = true;
      this.renderResultado();
    }
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  medalForRank(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return String(index + 1);
  }

  async renderResultado() {
    let saved;
    try {
      saved = await window.BitAcademyAuth.recordQuizResult({ materia: this.materia,
        token: this.engine.token, answers: this.engine.respostasUsuario });
    } catch (error) {
      const message = document.getElementById("feedback-area");
      message.textContent = error.message || "Não foi possível corrigir o quiz.";
      message.classList.remove("hidden");
      this.btnNext.textContent = "Iniciar novo quiz";
      this.btnNext.disabled = false;
      this.btnNext.addEventListener("click", () => location.reload(), { once: true });
      return;
    }
    const score = saved.currentScore ?? saved.score;
    const total = saved.currentTotal ?? saved.total;
    const percent = saved.currentPercent ?? saved.percent;
    this.engine.respostasUsuario = saved.review;
    const saveMessage = saved.practiceOnly ? "Modo treino. Entre na sua conta para registrar recordes." :
      saved.improved ? "Resultado sincronizado e salvo no seu perfil." : "Seu recorde anterior foi mantido.";
    const autoGradedNotice = saved.autoGradedActivities > 0 ?
      `Nota ${((score / total) * 10).toFixed(2)}/10 sincronizada em ${saved.autoGradedActivities} atividade(s) elegível(is).` : "";

    let ranking = [];
    try { ranking = await window.BitAcademyAuth?.getQuizRanking(this.materia, 5) || []; } catch {}
    const rankingHtml = ranking.length ? `
      <div class="quiz-ranking">
        <h4 style="display: flex; align-items: center; justify-content: center; gap: 8px;"><i data-lucide="trophy" data-lucide-size="18"></i> Top 5 deste Quiz</h4>
        ${ranking.map((item, index) => `
          <article class="${index < 3 ? `podium-${index + 1}` : ""}">
            <span>${this.medalForRank(index)}</span>
            <strong style="display: flex; align-items: center; gap: 8px;">${window.BitAcademyIcons ? window.BitAcademyIcons.avatar(item.playerName, 24, "user-avatar-sm") : ""}${this.escapeHtml(item.playerName)}</strong>
            <b>${item.score}/${item.total} (${item.percent}%)</b>
          </article>
        `).join("")}
      </div>
    ` : "";

    const reviewHtml = `
      <details class="quiz-review">
        <summary><i data-lucide="clipboard-list" data-lucide-size="16"></i> Ver gabarito comentado (${score} de ${total} acertos)</summary>
        <div class="quiz-review-list">
          ${this.engine.respostasUsuario.map((item, idx) => `
            <article class="quiz-review-item ${item.acertou ? "correct" : "wrong"}">
              <div class="quiz-review-head">
                <span>Questão ${idx + 1}</span>
                <b>${item.acertou ? '<i data-lucide="check-circle-2" data-lucide-size="15"></i> Acertou' : '<i data-lucide="x-circle" data-lucide-size="15"></i> Errou'}</b>
              </div>
              <p class="quiz-review-question">${this.escapeHtml(item.pergunta)}</p>
              <p class="quiz-review-answer">Sua resposta: <strong>${this.escapeHtml(item.opcoes[item.escolhida] ?? "—")}</strong></p>
              ${!item.acertou ? `<p class="quiz-review-correct">Correta: <strong>${this.escapeHtml(item.opcoes[item.correta])}</strong></p>` : ""}
              ${item.explicacao ? `<small class="quiz-review-exp"><i data-lucide="lightbulb" data-lucide-size="14"></i> ${this.escapeHtml(item.explicacao)}</small>` : ""}
            </article>
          `).join("")}
        </div>
      </details>
    `;

    this.container.innerHTML = `
      ${this.renderTopbar()}
      <div class="result-card">
        <div class="score-circle">${score}/${total}</div>
        <h3>${percent === 100 ? "Desempenho Perfeito! 🌟" : percent >= 70 ? "Ótimo desempenho! 👏" : "Bom esforço! Continue praticando 💪"}</h3>
        <p class="result-percent">Aproveitamento de <strong>${percent}%</strong> em ${this.escapeHtml(this.engine.materiaInfo.titulo)}.</p>
        <p class="result-save-status">${this.escapeHtml(saveMessage)}</p>
        ${autoGradedNotice ? `<p style="margin: 10px 0 14px; padding: 10px 14px; border-radius: 10px; background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.35); color: #6ee7b7; font-weight: 700; font-size: 0.92rem;">${this.escapeHtml(autoGradedNotice)}</p>` : ""}
        ${rankingHtml}
        ${reviewHtml}
        <div class="result-actions">
          <button onclick="location.reload()" class="btn-primary">Jogar novamente</button>
          <a href="../materia.html?slug=${encodeURIComponent(this.materia)}" class="btn-secondary">Revisar matéria</a>
          <a href="../Bitacademy.html" class="btn-secondary">Voltar ao portal</a>
        </div>
      </div>
    `;
    window.BitAcademyAuth?.renderAuthStatus?.();
    window.BitAcademyMotion?.panelIn(this.container.querySelector(".result-card"));
    window.BitAcademyMotion?.pop(this.container.querySelector(".score-circle"), 1.15);
    window.BitAcademyMotion?.staggerCards(this.container, ".quiz-ranking article", { stagger: 0.055, y: 12 });
  }
}

window.iniciarQuiz = async (id, mat) => {
  const container = document.getElementById(id);
  container.textContent = "Carregando perguntas...";
  try {
    await window.BitAcademyAuth.ready;
    const round = await window.BitAcademyAuth.getQuizQuestions(mat);
    new QuizUI(id, mat, round);
  } catch (error) {
    container.textContent = error.message || "Não foi possível carregar o quiz.";
    const retry = document.createElement("button");
    retry.textContent = "Tentar novamente";
    retry.className = "btn-primary";
    retry.onclick = () => window.iniciarQuiz(id, mat);
    container.appendChild(retry);
  }
};
