// =============================================
//  BITACADEMY – Sistema de Quiz
//  Lógica central para todos os quizzes
// =============================================
const QUIZZES = {
  matematica: {
    titulo: "Matemática Avançada",
    emoji: "📐",
    cor: "#f97316",
    perguntas: [
      {
        pergunta: "Qual é o valor de x na equação logarítmica: log₂(x) + log₂(x − 2) = 3?",
        opcoes: ["x = 2", "x = 4", "x = 8", "x = 6"],
        correta: 1,
        explicação: "Pela propriedade do logaritmo: log₂(x(x − 2)) = 3 ⇒ x² − 2x = 8. Resolvendo a equação do 2º grau (x > 2), obtemos x = 4."
      },
      {
        pergunta: "Em um triângulo retângulo, se a hipotenusa mede 10 e um dos ângulos é 30°, qual o valor do cateto oposto a esse ângulo?",
        opcoes: ["5", "5√3", "10√2", "8"],
        correta: 0,
        explicação: "sen(30°) = cateto oposto / hipotenusa ⇒ 0,5 = x / 10 ⇒ x = 5."
      },
      {
        pergunta: "Qual é a derivada da função f(x) = x³ − 5x + 2?",
        opcoes: ["3x² - 5", "3x² + 5", "x² - 5", "2x³ - 5"],
        correta: 0,
        explicação: "Aplicando a regra do tombo para derivadas polinomiais: d/dx(x³) = 3x², d/dx(−5x) = −5 e d/dx(2) = 0."
      },
      {
        pergunta: "Qual a probabilidade de obter soma 7 ao lançar dois dados não viciados de seis faces?",
        opcoes: ["1/12", "1/8", "1/6", "1/36"],
        correta: 2,
        explicação: "As combinações favoráveis são (1,6), (2,5), (3,4), (4,3), (5,2) e (6,1): 6 casos em 36 possíveis, ou seja, 6/36 = 1/6."
      }
    ]
  },

  portugues: {
    titulo: "Língua Portuguesa & Literatura",
    emoji: "🖋️",
    cor: "#ef4444",
    perguntas: [
      {
        pergunta: "Assinale a alternativa em que há erro de concordância verbal:",
        opcoes: [
          "Fazem dez anos que não o vejo.",
          "Havia muitos alunos na sala.",
          "Mais de um aluno faltou à prova.",
          "Estados Unidos são uma potência."
        ],
        correta: 0,
        explicação: "O verbo 'fazer' indicando tempo decorrido é impessoal e deve permanecer na 3ª pessoa do singular: 'Faz dez anos'."
      },
      {
        pergunta: "Qual é a figura de linguagem predominante em: 'O sol amanheceu pálido e cansado'?",
        opcoes: ["Catacrese", "Prosopopeia", "Sinédoque", "Eufemismo"],
        correta: 1,
        explicação: "Prosopopeia (ou personificação) é a atribuição de características ou sentimentos humanos a seres inanimados."
      },
      {
        pergunta: "Na oração 'Acredito que você vencerá', a oração subordinada é classificada como:",
        opcoes: ["Substantiva Objetiva Direta", "Adjetiva Restritiva", "Adverbial Causal", "Substantiva Completiva Nominal"],
        correta: 0,
        explicação: "A oração 'que você vencerá' exerce função de objeto direto do verbo transitivo direto 'Acredito'."
      }
    ]
  },

  ciencias: {
    titulo: "Ciências da Natureza",
    emoji: "⚛️",
    cor: "#22c55e",
    perguntas: [
      {
        pergunta: "Qual é a molaridade de uma solução com 180 g de Glicose (C₆H₁₂O₆) em 1 L de água? (Massa molar da Glicose = 180 g/mol)",
        opcoes: ["0,5 mol/L", "1,0 mol/L", "2,0 mol/L", "0,1 mol/L"],
        correta: 1,
        explicação: "Número de mols n = massa / massa molar = 180 / 180 = 1 mol em 1 L, resultando em 1,0 mol/L."
      },
      {
        pergunta: "Qual organela celular é responsável pela síntese de ATP através da cadeia transportadora de elétrons?",
        opcoes: ["Ribossomo", "Complexo de Golgi", "Mitocôndria", "Lisossomo"],
        correta: 2,
        explicação: "As mitocôndrias realizam a respiração celular aeróbica, produzindo a maior parte do ATP da célula."
      },
      {
        pergunta: "Na primeira lei da Termodinâmica, se um sistema recebe 500 J de calor e realiza 200 J de trabalho, qual a variação da energia interna?",
        opcoes: ["700J", "300J", "-300J", "500J"],
        correta: 1,
        explicação: "Pela conservação da energia: ΔU = Q − W ⇒ ΔU = 500 J − 200 J = 300 J."
      }
    ]
  },

  filosofia: {
    titulo: "Filosofia Moderna e Ética",
    emoji: "🧠",
    cor: "#8b5cf6",
    perguntas: [
      {
        pergunta: "Para Immanuel Kant, o agir moralmente correto baseia-se em:",
        opcoes: [
          "Maximizar a felicidade geral.",
          "Seguir o Imperativo Categórico.",
          "Agir de acordo com as paixões.",
          "Atingir o sucesso pessoal."
        ],
        correta: 1,
        explicação: "Na ética deontológica de Kant, a ação moral é guiada pelo dever racional universalizável (Imperativo Categórico)."
      },
      {
        pergunta: "Qual conceito de Nietzsche descreve a superação dos valores tradicionais e a criação de novos?",
        opcoes: ["Dialética", "Amor Fati", "Além-do-Homem (Übermensch)", "Niilismo Passivo"],
        correta: 2,
        explicação: "O 'Além-do-Homem' (Übermensch) simboliza aquele capaz de transvalorar os valores e afirmar a vida de modo criador."
      }
    ]
  },

  historia: {
    titulo: "História",
    emoji: "📜",
    cor: "#f59e0b",
    perguntas: [
      {
        pergunta: "Qual acontecimento é considerado um marco inicial da Idade Moderna?",
        opcoes: ["Queda de Constantinopla", "Revolução Francesa", "Primeira Guerra Mundial", "Independência do Brasil"],
        correta: 0,
        explicação: "A tomada de Constantinopla pelos otomanos em 1453 é tradicionalmente usada como marco de transição para a Idade Moderna."
      },
      {
        pergunta: "O Renascimento valorizou principalmente:",
        opcoes: ["O teocentrismo medieval", "A censura científica", "O humanismo e a razão", "O isolamento cultural"],
        correta: 2,
        explicação: "O movimento renascentista destacou o antropocentrismo, o humanismo, a investigação científica e a inspiração greco-romana."
      },
      {
        pergunta: "Em que ano ocorreu a Independência do Brasil?",
        opcoes: ["1500", "1789", "1822", "1889"],
        correta: 2,
        explicação: "A proclamação da Independência do Brasil ocorreu em 7 de setembro de 1822."
      }
    ]
  },

  geografia: {
    titulo: "Geografia",
    emoji: "🌎",
    cor: "#06b6d4",
    perguntas: [
      {
        pergunta: "Qual camada da Terra é formada por placas tectônicas?",
        opcoes: ["Núcleo interno", "Litosfera", "Manto inferior", "Atmosfera"],
        correta: 1,
        explicação: "A litosfera é a camada sólida mais externa da Terra, fragmentada em placas tectônicas que se movimentam sobre a astenosfera."
      },
      {
        pergunta: "O clima de uma região é definido principalmente pela análise:",
        opcoes: ["De um único dia", "De poucos minutos", "De longos períodos", "Apenas da vegetação"],
        correta: 2,
        explicação: "Diferente do tempo meteorológico (momentâneo), o clima caracteriza o padrão atmosférico observado ao longo de décadas."
      },
      {
        pergunta: "Bacia hidrográfica é:",
        opcoes: ["Uma área drenada por um rio principal e seus afluentes", "Um tipo de montanha", "Uma formação de nuvens", "Um movimento das marés"],
        correta: 0,
        explicação: "Toda a água das chuvas captada pelos divisores topográficos de uma bacia escoa para um rio principal e seus afluentes."
      }
    ]
  },

  artes: {
    titulo: "Artes",
    emoji: "🎨",
    cor: "#ec4899",
    perguntas: [
      {
        pergunta: "Qual movimento artístico valorizou a luz natural e as impressões visuais do momento?",
        opcoes: ["Barroco", "Impressionismo", "Cubismo", "Surrealismo"],
        correta: 1,
        explicação: "Os impressionistas pintavam ao ar livre para capturar as variações da luz solar nas cores e formas."
      },
      {
        pergunta: "A perspectiva, nas artes visuais, é usada para:",
        opcoes: ["Representar profundidade", "Apagar cores", "Criar sons", "Medir temperatura"],
        correta: 0,
        explicação: "A técnica da perspectiva cria a ilusão tridimensional de volume e profundidade em superfícies bidimensionais."
      },
      {
        pergunta: "A Semana de Arte Moderna no Brasil ocorreu em:",
        opcoes: ["1822", "1889", "1922", "1964"],
        correta: 2,
        explicação: "Realizada no Theatro Municipal de São Paulo em fevereiro de 1922, marcou o início do Modernismo brasileiro."
      }
    ]
  },

  ingles: {
    titulo: "Inglês",
    emoji: "🗣️",
    cor: "#3b82f6",
    perguntas: [
      {
        pergunta: "Qual alternativa está no Simple Past?",
        opcoes: ["I study every day", "I studied yesterday", "I am studying now", "I will study tomorrow"],
        correta: 1,
        explicação: "'Studied' é a forma no passado simples do verbo regular 'to study', acompanhada do advérbio de tempo passado 'yesterday'."
      },
      {
        pergunta: "A tradução mais adequada de 'false friend' em estudo de idiomas é:",
        opcoes: ["Amigo falso", "Palavra parecida com significado diferente", "Gíria informal", "Verbo irregular"],
        correta: 1,
        explicação: "Falsos cognatos ('false friends') têm grafia semelhante entre dois idiomas, mas sentidos distintos (ex.: 'pretend' = fingir)."
      },
      {
        pergunta: "Qual frase está correta?",
        opcoes: ["She are happy", "They is students", "He am tired", "We are ready"],
        correta: 3,
        explicação: "O pronome 'We' (nós) conjuga o verbo to be na forma 'are': 'We are ready'."
      }
    ]
  }
};

// =============================================
//  MOTOR DO QUIZ (QuizEngine)
// =============================================

class QuizEngine {
  constructor(materia) {
    if (!QUIZZES[materia]) throw new Error("Matéria não encontrada");

    this.materiaInfo = QUIZZES[materia];
    this.perguntasTotal = [...this.materiaInfo.perguntas];
    this.perguntaIndices = [];
    this.perguntas = this._prepararPerguntas(5);
    this.atual = 0;
    this.pontuacao = 0;
    this.respostasUsuario = [];
    this.finalizado = false;
  }

  _prepararPerguntas(qtd) {
    const selecionadas = this.perguntasTotal
      .map((pergunta, questionIndex) => ({ pergunta, questionIndex }))
      .sort(() => Math.random() - 0.5)
      .slice(0, qtd);
    this.perguntaIndices = selecionadas.map((item) => item.questionIndex);
    return selecionadas.map((item) => item.pergunta);
  }

  get perguntaAtual() {
    return this.perguntas[this.atual];
  }

  validarResposta(indice) {
    if (this.finalizado) return null;

    const correta = this.perguntaAtual.correta;
    const isCorreto = indice === correta;

    if (isCorreto) this.pontuacao++;

    this.respostasUsuario.push({
      questionIndex: this.perguntaIndices[this.atual],
      selected: Number.isInteger(indice) ? indice : null,
      pergunta: this.perguntaAtual.pergunta,
      opcoes: this.perguntaAtual.opcoes,
      correta,
      acertou: isCorreto,
      escolhida: indice,
      explicacao: this.perguntaAtual.explicação || ""
    });

    return {
      correto: isCorreto,
      indiceCorreto: correta,
      explicacao: this.perguntaAtual.explicação
    };
  }

  proximo() {
    if (this.atual < this.perguntas.length - 1) {
      this.atual++;
      return true;
    } else {
      this.finalizado = true;
      return false;
    }
  }
}

// =============================================
//  INTERFACE DO QUIZ (QuizUI)
// =============================================

class QuizUI {
  constructor(containerId, materia) {
    this.container = document.getElementById(containerId);
    this.materia = materia;
    this.engine = new QuizEngine(materia);
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
        <a class="quiz-nav-link" href="../materia.html?slug=${encodeURIComponent(this.materia)}">← Voltar para ${this.escapeHtml(this.engine.materiaInfo.titulo)}</a>
        <div class="quiz-topbar-right">
          <a class="quiz-nav-link subtle" href="../Bitacademy.html">Página Inicial</a>
          <span data-auth-status></span>
        </div>
      </nav>
    `;
  }

  renderEstrutura() {
    this.container.innerHTML = `
      ${this.renderTopbar()}
      <div class="quiz-card">
        <div class="quiz-header" style="border-left: 6px solid ${this.engine.materiaInfo.cor}">
          <div class="quiz-header-top">
            <span class="quiz-badge">Quiz de Fixação</span>
            <span class="quiz-step-counter">Questão <b id="current-idx">1</b> de ${this.engine.perguntas.length}</span>
          </div>
          <h2>${this.engine.materiaInfo.emoji} ${this.engine.materiaInfo.titulo}</h2>
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
  }

  handleSelection(e) {
    const btn = e.currentTarget;
    const idx = parseInt(btn.dataset.idx, 10);
    const result = this.engine.validarResposta(idx);

    if (!result) return;

    document.querySelectorAll(".option-btn").forEach((b) => {
      b.disabled = true;
      const bIdx = parseInt(b.dataset.idx, 10);
      if (bIdx === result.indiceCorreto) b.classList.add("correct");
      else if (bIdx === idx && !result.correto) b.classList.add("wrong");
    });

    const feedback = document.getElementById("feedback-area");
    feedback.classList.remove("hidden");
    feedback.className = `feedback-box ${result.correto ? "is-correct" : "is-wrong"}`;
    feedback.innerHTML = result.correto
      ? `<b>✨ Resposta correta!</b> ${this.escapeHtml(result.explicacao || "")}`
      : `<b>⚠️ Resposta incorreta:</b> A alternativa correta é a <strong>${String.fromCharCode(65 + result.indiceCorreto)}</strong>. ${this.escapeHtml(result.explicacao || "")}`;

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
    const total = this.engine.perguntas.length;
    const score = this.engine.pontuacao;
    const percent = Math.round((score / total) * 100);
    await window.BitAcademyAuth?.ready;
    const user = window.BitAcademyAuth?.getCurrentUser();
    let saveMessage = user
      ? "Resultado sincronizado e salvo no seu perfil."
      : "Entre ou crie sua conta para registrar seu recorde no ranking oficial.";

    let autoGradedNotice = "";
    if (user) {
      try {
        const saved = await window.BitAcademyAuth.recordQuizResult({
          materia: this.materia,
          answers: this.engine.respostasUsuario.map(({ questionIndex, selected }) => ({ questionIndex, selected }))
        });
        if (!saved.improved) saveMessage = "Seu recorde anterior nesta disciplina foi mantido como sua maior pontuação.";
        if (saved.autoGradedActivities > 0) {
          const autoGrade = ((score / total) * 10).toFixed(2);
          autoGradedNotice = `⚡ Nota ${autoGrade}/10 lançada automaticamente em ${saved.autoGradedActivities} ${saved.autoGradedActivities === 1 ? "atividade avaliativa" : "atividades avaliativas"} da sua turma!`;
        }
      } catch (error) {
        saveMessage = error.message;
      }
    }

    let ranking = [];
    try { ranking = await window.BitAcademyAuth?.getQuizRanking(this.materia, 5) || []; } catch {}
    const rankingHtml = ranking.length ? `
      <div class="quiz-ranking">
        <h4>🏆 Top 5 deste Quiz</h4>
        ${ranking.map((item, index) => `
          <article class="${index < 3 ? `podium-${index + 1}` : ""}">
            <span>${this.medalForRank(index)}</span>
            <strong>${this.escapeHtml(item.playerName)}</strong>
            <b>${item.score}/${item.total} (${item.percent}%)</b>
          </article>
        `).join("")}
      </div>
    ` : "";

    const reviewHtml = `
      <details class="quiz-review">
        <summary>📋 Ver gabarito comentado (${score} de ${total} acertos)</summary>
        <div class="quiz-review-list">
          ${this.engine.respostasUsuario.map((item, idx) => `
            <article class="quiz-review-item ${item.acertou ? "correct" : "wrong"}">
              <div class="quiz-review-head">
                <span>Questão ${idx + 1}</span>
                <b>${item.acertou ? "✓ Acertou" : "✗ Errou"}</b>
              </div>
              <p class="quiz-review-question">${this.escapeHtml(item.pergunta)}</p>
              <p class="quiz-review-answer">Sua resposta: <strong>${this.escapeHtml(item.opcoes[item.escolhida] ?? "—")}</strong></p>
              ${!item.acertou ? `<p class="quiz-review-correct">Correta: <strong>${this.escapeHtml(item.opcoes[item.correta])}</strong></p>` : ""}
              ${item.explicacao ? `<small class="quiz-review-exp">💡 ${this.escapeHtml(item.explicacao)}</small>` : ""}
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
  }
}

window.iniciarQuiz = (id, mat) => { new QuizUI(id, mat); };
