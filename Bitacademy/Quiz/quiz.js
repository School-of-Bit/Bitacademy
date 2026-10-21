// =============================================
//  BITACADEMY – Sistema de Quiz
//  Lógica central para todos os quizzes
// =============================================
const QUIZZES = {
  matematica: {
    titulo: "Matemática Avançada",
    emoji: "📐",
    cor: "#4F46E5",
    perguntas: [
      {
        pergunta: "Qual é o valor de x na equação logarítmica: $log_2(x) + log_2(x-2) = 3$?",
        opcoes: ["x = 2", "x = 4", "x = 8", "x = 6"],
        correta: 1,
        explicação: "Pela propriedade do logaritmo: $log_2(x(x-2)) = 3 \Rightarrow x^2-2x = 8$. Resolvendo a equação de 2º grau, x=4."
      },
      {
        pergunta: "Em um triângulo retângulo, se a hipotenusa mede 10 e um dos ângulos é 30°, qual o valor do cateto oposto a esse ângulo?",
        opcoes: ["5", "5√3", "10√2", "8"],
        correta: 0,
        explicação: "sen(30°) = oposto/hipotenusa \Rightarrow 0,5 = x/10 \Rightarrow x = 5."
      },
      {
        pergunta: "Qual é a derivada da função $f(x) = x^3 - 5x + 2$?",
        opcoes: ["3x² - 5", "3x² + 5", "x² - 5", "2x³ - 5"],
        correta: 0
      },
      {
        pergunta: "Qual a probabilidade de obter soma 7 ao lançar dois dados não viciados de seis faces?",
        opcoes: ["1/12", "1/8", "1/6", "1/36"],
        correta: 2,
        explicação: "As combinações são (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 em 36 total."
      }
    ]
  },

  portugues: {
    titulo: "Língua Portuguesa & Literatura",
    emoji: "🖋️",
    cor: "#DC2626",
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
        explicação: "O verbo 'fazer' indicando tempo decorrido é impessoal (deve ficar no singular: 'Faz dez anos')."
      },
      {
        pergunta: "Qual é a figura de linguagem predominante em: 'O sol amanheceu pálido e cansado'?",
        opcoes: ["Catacrese", "Prosopopeia", "Sinédoque", "Eufemismo"],
        correta: 1,
        explicação: "Atribuição de sentimentos humanos a seres inanimados."
      },
      {
        pergunta: "Na oração 'Acredito que você vencerá', a oração subordinada é classificada como:",
        opcoes: ["Substantiva Objetiva Direta", "Adjetiva Restritiva", "Adverbial Causal", "Substantiva Completiva Nominal"],
        correta: 0
      }
    ]
  },

  ciencias: {
    titulo: "Ciências da Natureza",
    emoji: "⚛️",
    cor: "#059669",
    perguntas: [
      {
        pergunta: "Qual é a molaridade de uma solução com 180g de Glicose (C6H12O6) em 1L de água? (Massa molar Glicose = 180g/mol)",
        opcoes: ["0,5 mol/L", "1,0 mol/L", "2,0 mol/L", "0,1 mol/L"],
        correta: 1
      },
      {
        pergunta: "Qual organela celular é responsável pela síntese de ATP através da cadeia transportadora de elétrons?",
        opcoes: ["Ribossomo", "Complexo de Golgi", "Mitocôndria", "Lisossomo"],
        correta: 2
      },
      {
        pergunta: "Na primeira lei da Termodinâmica, se um sistema recebe 500J de calor e realiza 200J de trabalho, qual a variação da energia interna?",
        opcoes: ["700J", "300J", "-300J", "500J"],
        correta: 1,
        explicação: "ΔU = Q - W \Rightarrow ΔU = 500 - 200 = 300J."
      }
    ]
  },

  filosofia: {
    titulo: "Filosofia Moderna e Ética",
    emoji: "🧠",
    cor: "#7C3AED",
    perguntas: [
      {
        pergunta: "Para Immanuel Kant, o agir moralmente correto baseia-se em:",
        opcoes: [
          "Maximizar a felicidade geral.",
          "Seguir o Imperativo Categórico.",
          "Agir de acordo com as paixões.",
          "Atingir o sucesso pessoal."
        ],
        correta: 1
      },
      {
        pergunta: "Qual conceito de Nietzsche descreve a superação dos valores tradicionais e a criação de novos?",
        opcoes: ["Dialética", "Amor Fati", "Além-do-Homem (Übermensch)", "Niilismo Passivo"],
        correta: 2
      }
    ]
  },

  historia: {
    titulo: "História",
    emoji: "📜",
    cor: "#B45309",
    perguntas: [
      {
        pergunta: "Qual acontecimento é considerado um marco inicial da Idade Moderna?",
        opcoes: ["Queda de Constantinopla", "Revolução Francesa", "Primeira Guerra Mundial", "Independência do Brasil"],
        correta: 0,
        explicação: "A queda de Constantinopla, em 1453, é frequentemente usada como marco de transição para a Idade Moderna."
      },
      {
        pergunta: "O Renascimento valorizou principalmente:",
        opcoes: ["O teocentrismo medieval", "A censura científica", "O humanismo e a razão", "O isolamento cultural"],
        correta: 2
      },
      {
        pergunta: "Em que ano ocorreu a Independência do Brasil?",
        opcoes: ["1500", "1789", "1822", "1889"],
        correta: 2
      }
    ]
  },

  geografia: {
    titulo: "Geografia",
    emoji: "🌎",
    cor: "#0891B2",
    perguntas: [
      {
        pergunta: "Qual camada da Terra é formada por placas tectônicas?",
        opcoes: ["Núcleo interno", "Litosfera", "Manto inferior", "Atmosfera"],
        correta: 1
      },
      {
        pergunta: "O clima de uma região é definido principalmente pela análise:",
        opcoes: ["De um único dia", "De poucos minutos", "De longos períodos", "Apenas da vegetação"],
        correta: 2
      },
      {
        pergunta: "Bacia hidrográfica é:",
        opcoes: ["Uma área drenada por um rio principal e seus afluentes", "Um tipo de montanha", "Uma formação de nuvens", "Um movimento das marés"],
        correta: 0
      }
    ]
  },

  artes: {
    titulo: "Artes",
    emoji: "🎨",
    cor: "#DB2777",
    perguntas: [
      {
        pergunta: "Qual movimento artístico valorizou a luz natural e as impressões visuais do momento?",
        opcoes: ["Barroco", "Impressionismo", "Cubismo", "Surrealismo"],
        correta: 1
      },
      {
        pergunta: "A perspectiva, nas artes visuais, é usada para:",
        opcoes: ["Representar profundidade", "Apagar cores", "Criar sons", "Medir temperatura"],
        correta: 0
      },
      {
        pergunta: "A Semana de Arte Moderna no Brasil ocorreu em:",
        opcoes: ["1822", "1889", "1922", "1964"],
        correta: 2
      }
    ]
  },

  ingles: {
    titulo: "Inglês",
    emoji: "🗣️",
    cor: "#2563EB",
    perguntas: [
      {
        pergunta: "Qual alternativa está no Simple Past?",
        opcoes: ["I study every day", "I studied yesterday", "I am studying now", "I will study tomorrow"],
        correta: 1
      },
      {
        pergunta: "A tradução mais adequada de 'false friend' em estudo de idiomas é:",
        opcoes: ["Amigo falso", "Palavra parecida com significado diferente", "Gíria informal", "Verbo irregular"],
        correta: 1
      },
      {
        pergunta: "Qual frase está correta?",
        opcoes: ["She are happy", "They is students", "He am tired", "We are ready"],
        correta: 3
      }
    ]
  }
};

// =============================================
//  LÓGICA REFORMULADA (QuizEngine)
// =============================================

class QuizEngine {
  constructor(materia) {
    if (!QUIZZES[materia]) throw new Error("Matéria não encontrada");
    
    this.materiaInfo = QUIZZES[materia];
    this.perguntasTotal = [...this.materiaInfo.perguntas];
    this.perguntaIndices = [];
    this.perguntas = this._prepararPerguntas(5); // Seleciona 5 difíceis
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
//  UI REFORMULADA (QuizUI)
// =============================================

class QuizUI {
  constructor(containerId, materia) {
    this.container = document.getElementById(containerId);
    this.materia = materia;
    this.engine = new QuizEngine(materia);
    this.init();
  }

  init() {
    this.renderEstrutura();
    this.renderPergunta();
  }

  renderEstrutura() {
    this.container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-header" style="border-left: 8px solid ${this.engine.materiaInfo.cor}">
          <h2>${this.engine.materiaInfo.emoji} ${this.engine.materiaInfo.titulo}</h2>
          <div class="quiz-meta">
            <span>Questão <b id="current-idx">1</b> de ${this.engine.perguntas.length}</span>
            <div class="progress-bg"><div id="progress-bar" class="progress-fill"></div></div>
          </div>
        </div>
        <div id="quiz-content"></div>
        <div id="quiz-footer" class="hidden">
           <button id="btn-next" class="btn-primary">Próxima Pergunta</button>
        </div>
      </div>
    `;
    
    this.btnNext = document.getElementById('btn-next');
    this.btnNext.addEventListener('click', () => this.handleNext());
  }

  renderPergunta() {
    const p = this.engine.perguntaAtual;
    const content = document.getElementById('quiz-content');
    
    document.getElementById('current-idx').textContent = this.engine.atual + 1;
    document.getElementById('progress-bar').style.width = `${(this.engine.atual / this.engine.perguntas.length) * 100}%`;

    content.innerHTML = `
      <div class="question-text">${p.pergunta}</div>
      <div class="options-grid">
        ${p.opcoes.map((opt, i) => `
          <button class="option-btn" data-idx="${i}">
            <span class="label">${String.fromCharCode(65 + i)}</span>
            <span class="text">${opt}</span>
          </button>
        `).join('')}
      </div>
      <div id="feedback-area" class="feedback-box hidden"></div>
    `;

    content.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSelection(e));
    });
    
    document.getElementById('quiz-footer').classList.add('hidden');
  }

  handleSelection(e) {
    const btn = e.currentTarget;
    const idx = parseInt(btn.dataset.idx);
    const result = this.engine.validarResposta(idx);

    if (!result) return;

    // Desabilitar outros botões
    document.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = true;
      const bIdx = parseInt(b.dataset.idx);
      if (bIdx === result.indiceCorreto) b.classList.add('correct');
      else if (bIdx === idx && !result.correto) b.classList.add('wrong');
    });

    // Mostrar Feedback
    const feedback = document.getElementById('feedback-area');
    feedback.classList.remove('hidden');
    feedback.innerHTML = result.correto 
      ? `<b>✨ Excelente!</b> ${result.explicacao || ""}`
      : `<b>⚠️ Atenção:</b> A resposta correta é a alternativa ${String.fromCharCode(65 + result.indiceCorreto)}. ${result.explicacao || ""}`;
    
    this.btnNext.textContent = this.engine.atual === this.engine.perguntas.length - 1 ? "Finalizar" : "Próxima";
    document.getElementById('quiz-footer').classList.remove('hidden');
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
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async renderResultado() {
    const total = this.engine.perguntas.length;
    const score = this.engine.pontuacao;
    const percent = Math.round((score / total) * 100);
    await window.BitAcademyAuth?.ready;
    const user = window.BitAcademyAuth?.getCurrentUser();
    let saveMessage = user ? "Resultado salvo no seu perfil." : "Entre ou cadastre-se para registrar seu melhor resultado.";
    if (user) {
      try {
        const saved = await window.BitAcademyAuth.recordQuizResult({
          materia: this.materia,
          answers: this.engine.respostasUsuario.map(({ questionIndex, selected }) => ({ questionIndex, selected }))
        });
        if (!saved.improved) saveMessage = "Seu recorde desta disciplina continua sendo sua melhor pontuação.";
      } catch (error) {
        saveMessage = error.message;
      }
    }

    let ranking = [];
    try { ranking = await window.BitAcademyAuth?.getQuizRanking(this.materia, 5) || []; } catch {}
    const rankingHtml = ranking.length ? `
      <div class="quiz-ranking">
        <h4>Ranking deste quiz</h4>
        ${ranking.map((item, index) => `
          <article>
            <span>${index + 1}</span>
            <strong>${this.escapeHtml(item.playerName)}</strong>
            <b>${item.score}/${item.total}</b>
          </article>
        `).join("")}
      </div>
    ` : "";

    this.container.innerHTML = `
      <div class="result-card">
        <div class="score-circle">${score}/${total}</div>
        <h3>${percent >= 70 ? "Ótimo desempenho!" : "Bom esforço!"}</h3>
        <p>Você acertou ${percent}% das questões.</p>
        <p>${this.escapeHtml(saveMessage)}</p>
        ${rankingHtml}
        <button onclick="location.reload()" class="btn-primary">Tentar novamente</button>
        <a href="../Bitacademy.html" class="btn-secondary">Voltar ao portal</a>
      </div>
    `;
  }
}

// Inicializador global
window.iniciarQuiz = (id, mat) => { new QuizUI(id, mat); };
