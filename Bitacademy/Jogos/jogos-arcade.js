(() => {
  const CATALOG = [
    {
      mode: "portugues-termo",
      title: "Termo Escolar",
      subjectSlug: "portugues",
      subjectName: "Português",
      accent: "#ef4444",
      icon: "book-open-text",
      badgeLabel: "Mecânica",
      badgeValue: "Palavra de 5 Letras",
      subtitle: "Descubra palavras do vocabulário escolar em até 6 tentativas com feedback colorido por letra."
    },
    {
      mode: "ingles-match",
      title: "Word Match Bilíngue",
      subjectSlug: "ingles",
      subjectName: "Inglês",
      accent: "#3b82f6",
      icon: "languages",
      badgeLabel: "Mecânica",
      badgeValue: "Memória 3D",
      subtitle: "Encontre os pares corretos entre Inglês e Português com o menor número de jogadas e maior combo."
    },
    {
      mode: "historia-cronologia",
      title: "Antes ou Depois?",
      subjectSlug: "historia",
      subjectName: "História",
      accent: "#f59e0b",
      icon: "landmark",
      badgeLabel: "Mecânica",
      badgeValue: "Linha do Tempo",
      subtitle: "Decida se cada marco histórico ocorreu antes ou depois do evento de referência para empilhar sua cronologia."
    },
    {
      mode: "geografia-radar",
      title: "GeoRadar",
      subjectSlug: "geografia",
      subjectName: "Geografia",
      accent: "#06b6d4",
      icon: "globe-2",
      badgeLabel: "Mecânica",
      badgeValue: "Capitais & Biomas",
      subtitle: "Identifique capitais, estados brasileiros, continentes e biomas com 3 vidas e dicas progressivas."
    },
    {
      mode: "ciencias-lab",
      title: "Lab Relâmpago",
      subjectSlug: "ciencias",
      subjectName: "Ciências",
      accent: "#22c55e",
      icon: "flask-conical",
      badgeLabel: "Mecânica",
      badgeValue: "Classificador Rápido",
      subtitle: "Classifique fenômenos, elementos químicos, sistemas do corpo e animais antes que a barra de tempo acabe."
    },
    {
      mode: "artes-estudio",
      title: "Estúdio Cromático",
      subjectSlug: "artes",
      subjectName: "Artes",
      accent: "#ec4899",
      icon: "palette",
      badgeLabel: "Mecânica",
      badgeValue: "Mistura RGB & Estilos",
      subtitle: "Misture canais de cor em tempo real para recriar tons-alvo e identifique movimentos artísticos."
    },
    {
      mode: "filosofia-oraculo",
      title: "Oráculo Filosófico",
      subjectSlug: "filosofia",
      subjectName: "Filosofia",
      accent: "#8b5cf6",
      icon: "brain",
      badgeLabel: "Mecânica",
      badgeValue: "Dedução por Pistas",
      subtitle: "Desvende pensadores clássicos usando até 3 pistas progressivas. Quanto menos pistas usar, mais pontos ganha."
    }
  ];

  const ALL_SWITCHER_GAMES = [
    {
      mode: "math-infinite",
      title: "Matemática Infinita",
      subjectName: "Matemática",
      icon: "calculator",
      href: "matematica-infinita.html"
    },
    ...CATALOG.map((g) => ({
      mode: g.mode,
      title: g.title,
      subjectName: g.subjectName,
      icon: g.icon,
      href: `jogo.html?mode=${encodeURIComponent(g.mode)}`
    }))
  ];

  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get("mode") || "portugues-termo";
  const currentConfig = CATALOG.find((g) => g.mode === requestedMode) || CATALOG[0];

  const stageEl = document.getElementById("arcade-stage");
  const feedbackEl = document.getElementById("arcade-feedback");
  const rankingListEl = document.getElementById("ranking-list");
  const rankingStatusEl = document.getElementById("ranking-status");
  const rankingTitleEl = document.getElementById("ranking-title");
  const switcherListEl = document.getElementById("arcade-switcher-list");

  const statEls = [
    { label: document.getElementById("stat-1-label"), value: document.getElementById("stat-1-value") },
    { label: document.getElementById("stat-2-label"), value: document.getElementById("stat-2-value") },
    { label: document.getElementById("stat-3-label"), value: document.getElementById("stat-3-value") }
  ];

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const normalizeText = (str) => String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  let activeCleanup = null;

  const setStats = (s1, s2, s3) => {
    [s1, s2, s3].forEach((s, idx) => {
      if (!s || !statEls[idx]) return;
      if (s.label !== undefined) {
        const iconHtml = s.icon ? window.BitAcademyIcons.svg(s.icon, 15) : "";
        statEls[idx].label.innerHTML = `${iconHtml} ${escapeHtml(s.label)}`;
      }
      if (s.value !== undefined) {
        statEls[idx].value.textContent = String(s.value);
      }
    });
  };

  const setFeedback = (text, type = "info") => {
    if (!feedbackEl) return;
    if (!text) {
      feedbackEl.innerHTML = "";
      feedbackEl.className = "arcade-feedback";
      return;
    }
    const iconName = type === "success" ? "check-circle-2" : type === "error" ? "alert-circle" : "sparkles";
    feedbackEl.className = `arcade-feedback is-${type}`;
    feedbackEl.innerHTML = `${window.BitAcademyIcons.svg(iconName, 17)} <span>${escapeHtml(text)}</span>`;
  };

  const loadRanking = async () => {
    if (!rankingListEl || !window.BitAcademyAuth) return;
    try {
      const ranking = await window.BitAcademyAuth.getGameRanking(currentConfig.mode, 10);
      if (!ranking.length) {
        rankingStatusEl.textContent = "Nenhum recorde registrado ainda. Seja o 1º no ranking!";
        rankingListEl.innerHTML = "";
        return;
      }
      rankingStatusEl.textContent = `Top ${ranking.length} jogadores em ${currentConfig.title}`;
      rankingListEl.innerHTML = ranking.map((entry, idx) => `
        <article class="${idx === 0 ? "podium-1" : ""}">
          <span>${idx + 1}º</span>
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${window.BitAcademyIcons.avatar(entry.playerName, 30, "user-avatar-sm")}
            <div style="min-width:0;">
              <strong>${escapeHtml(entry.playerName)}</strong>
              <small>${entry.correct} acerto(s) · combo ${entry.bestStreak}</small>
            </div>
          </div>
          <b>${entry.score}</b>
        </article>
      `).join("");
      window.BitAcademyMotion?.staggerCards(rankingListEl, "article", { stagger: 0.04, y: 10 });
    } catch (err) {
      rankingStatusEl.textContent = "Ranking indisponível no momento.";
    }
  };

  const saveScoreToServer = async ({ score, correct, wrong, bestStreak, duration }) => {
    await window.BitAcademyAuth?.ready;
    const user = window.BitAcademyAuth?.getCurrentUser();
    if (!user) {
      return { saved: false, reason: "Entre na sua conta para gravar seu recorde no ranking oficial!" };
    }
    if (score <= 0) {
      return { saved: false, reason: "Faça pelo menos 1 ponto para entrar no ranking." };
    }
    try {
      const res = await window.BitAcademyAuth.recordGameScore({
        mode: currentConfig.mode,
        score,
        correct,
        wrong,
        bestStreak,
        duration
      });
      await loadRanking();
      if (res.improved) {
        return { saved: true, improved: true, reason: "Novo recorde pessoal gravado no ranking oficial!" };
      }
      return { saved: true, improved: false, reason: "Pontuação processada! Seu recorde anterior continua no topo." };
    } catch (err) {
      return { saved: false, reason: err.message || "Não foi possível salvar no servidor." };
    }
  };

  const renderGameOverScreen = async ({ title, subtitle, score, correct, wrong, bestStreak, duration, onRestart }) => {
    setFeedback("");
    const saveRes = await saveScoreToServer({ score, correct, wrong, bestStreak, duration });
    stageEl.innerHTML = `
      <div class="arcade-result-card">
        <div class="arcade-result-icon">${window.BitAcademyIcons.svg(saveRes.improved ? "trophy" : "award", 36)}</div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p>
        <div class="arcade-result-metrics">
          <div><span>Pontuação Final</span><strong>${score}</strong></div>
          <div><span>Acertos</span><strong>${correct}</strong></div>
          <div><span>Melhor Combo</span><strong>${bestStreak}</strong></div>
          <div><span>Tempo</span><strong>${Math.max(1, Math.round(duration))}s</strong></div>
        </div>
        <p class="arcade-save-note ${saveRes.saved ? "is-ok" : ""}">
          ${window.BitAcademyIcons.svg(saveRes.saved ? "check-circle-2" : "alert-circle", 15)}
          <span>${escapeHtml(saveRes.reason)}</span>
        </p>
        <div class="game-actions" style="justify-content:center;">
          <button type="button" id="arcade-play-again">${window.BitAcademyIcons.svg("rotate-ccw", 17)} Jogar Novamente</button>
          <a class="back-link" href="../materia.html?slug=${encodeURIComponent(currentConfig.subjectSlug)}">${window.BitAcademyIcons.svg("book-open", 16)} Revisar ${escapeHtml(currentConfig.subjectName)}</a>
        </div>
      </div>
    `;
    window.BitAcademyMotion?.panelIn(stageEl.firstElementChild);
    document.getElementById("arcade-play-again")?.addEventListener("click", () => {
      if (typeof onRestart === "function") onRestart();
    });
  };

  // =========================================================================
  // 1. PORTUGUÊS — TERMO ESCOLAR (WORDLE 5 LETRAS)
  // =========================================================================
  function mountPortuguesTermo() {
    const WORDS = [
      { word: "VERBO", display: "VERBO", hint: "Classe gramatical que indica ação, estado ou fenômeno da natureza." },
      { word: "CRASE", display: "CRASE", hint: "Fusão da preposição 'a' com o artigo feminino 'a' (indicada pelo acento grave)." },
      { word: "PROSA", display: "PROSA", hint: "Texto escrito em parágrafos contínuos, sem estrutura de versos." },
      { word: "VERSO", display: "VERSO", hint: "Cada uma das linhas que compõem uma estrofe de um poema." },
      { word: "POEMA", display: "POEMA", hint: "Gênero textual literário estruturado em versos e estrofes." },
      { word: "CONTO", display: "CONTO", hint: "Narrativa curta com poucos personagens e um único conflito central." },
      { word: "FRASE", display: "FRASE", hint: "Enunciado com sentido completo, podendo ou não ter verbo." },
      { word: "TEXTO", display: "TEXTO", hint: "Unidade de sentido construída com coesão e coerência." },
      { word: "SIGLA", display: "SIGLA", hint: "Formação de palavra pelas letras iniciais de um conjunto (ex.: ONU, IBGE)." },
      { word: "VOGAL", display: "VOGAL", hint: "Som pronunciado livremente sem obstrução da passagem de ar (A, E, I, O, U)." },
      { word: "LENDA", display: "LENDA", hint: "Narrativa popular transmitida oralmente que mistura fatos reais e fantasia." },
      { word: "DRAMA", display: "DRAMA", hint: "Gênero literário criado para ser encenado no teatro." },
      { word: "PONTO", display: "PONTO", hint: "Sinal de pontuação usado para encerrar períodos declarativos." },
      { word: "RIMAS", display: "RIMAS", hint: "Semelhança sonora no final de dois ou mais versos." },
      { word: "AUTOR", display: "AUTOR", hint: "Pessoa responsável pela criação de uma obra literária ou textual." },
      { word: "IDEIA", display: "IDEIA", hint: "Conceito central ou pensamento desenvolvido em um parágrafo." },
      { word: "TEMPO", display: "TEMPO", hint: "Elemento da narrativa e flexão verbal (presente, passado, futuro)." },
      { word: "REGRA", display: "REGRA", hint: "Norma gramatical que orienta a ortografia ou a concordância." },
      { word: "SINAL", display: "SINAL", hint: "Marca gráfica como acento, vírgula ou travessão." },
      { word: "LIVRO", display: "LIVRO", hint: "Obra reunida em páginas, fonte clássica de leitura e estudo." }
    ];

    const KEYBOARD_ROWS = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
    ];

    let deck = shuffle(WORDS);
    let deckIdx = 0;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let startedAt = Date.now();

    let secret = deck[0];
    let guesses = [];
    let currentGuess = "";
    let hintUsed = false;
    let roundFinished = false;
    let keyStates = {};

    const evaluateGuess = (guess, target) => {
      const result = Array(5).fill("absent");
      const targetChars = target.split("");
      const guessChars = guess.split("");
      for (let i = 0; i < 5; i++) {
        if (guessChars[i] === targetChars[i]) {
          result[i] = "correct";
          targetChars[i] = null;
          guessChars[i] = null;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (guessChars[i] && targetChars.includes(guessChars[i])) {
          result[i] = "present";
          targetChars[targetChars.indexOf(guessChars[i])] = null;
        }
      }
      return result;
    };

    const priority = { absent: 1, present: 2, correct: 3 };

    const renderBoard = () => {
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Sequência", value: streak, icon: "flame" },
        { label: "Palavra", value: `${deckIdx + 1}/${deck.length}`, icon: "book-open-text" }
      );

      let rowsHtml = "";
      for (let r = 0; r < 6; r++) {
        const submitted = guesses[r];
        const isCurrent = r === guesses.length && !roundFinished;
        rowsHtml += `<div class="termo-row" data-row="${r}">`;
        for (let c = 0; c < 5; c++) {
          let ch = "";
          let cls = "termo-tile";
          if (submitted) {
            ch = submitted.word[c];
            cls += ` is-${submitted.eval[c]}`;
          } else if (isCurrent) {
            ch = currentGuess[c] || "";
            if (ch) cls += " is-filled";
          }
          rowsHtml += `<div class="${cls}">${escapeHtml(ch)}</div>`;
        }
        rowsHtml += `</div>`;
      }

      const kbHtml = KEYBOARD_ROWS.map((row) => `
        <div class="termo-kb-row">
          ${row.map((k) => {
            const st = keyStates[k] ? ` is-${keyStates[k]}` : "";
            const label = k === "ENTER" ? "Enviar" : k === "BACK" ? "⌫" : k;
            const wide = k === "ENTER" || k === "BACK" ? " is-wide" : "";
            return `<button type="button" class="termo-key${st}${wide}" data-key="${k}">${label}</button>`;
          }).join("")}
        </div>
      `).join("");

      stageEl.innerHTML = `
        <div class="termo-toolbar">
          <button type="button" class="secondary small-btn" id="termo-hint-btn" ${hintUsed || roundFinished ? "disabled" : ""}>
            ${window.BitAcademyIcons.svg("lightbulb", 15)} ${hintUsed ? "Dica exibida" : "Ver Dica (-25 pts)"}
          </button>
          <button type="button" class="secondary small-btn" id="termo-finish-btn">
            ${window.BitAcademyIcons.svg("check-circle-2", 15)} Encerrar &amp; Salvar
          </button>
        </div>
        ${hintUsed ? `<div class="arcade-hint-box">${window.BitAcademyIcons.svg("lightbulb", 16)} <span><strong>Dica:</strong> ${escapeHtml(secret.hint)}</span></div>` : ""}
        <div class="termo-grid">${rowsHtml}</div>
        ${roundFinished ? `
          <div class="arcade-round-next">
            <button type="button" id="termo-next-btn">${window.BitAcademyIcons.svg("arrow-right", 16)} Próxima Palavra</button>
          </div>
        ` : `<div class="termo-keyboard">${kbHtml}</div>`}
      `;

      document.getElementById("termo-hint-btn")?.addEventListener("click", () => {
        hintUsed = true;
        renderBoard();
      });

      document.getElementById("termo-finish-btn")?.addEventListener("click", () => {
        finishRun("Partida encerrada!", `Você descobriu ${correct} palavra(s) no Termo Escolar.`);
      });

      document.getElementById("termo-next-btn")?.addEventListener("click", nextWord);

      stageEl.querySelectorAll("[data-key]").forEach((btn) => {
        btn.addEventListener("click", () => handleKey(btn.dataset.key));
      });
    };

    const nextWord = () => {
      deckIdx++;
      if (deckIdx >= deck.length) {
        finishRun("Você zerou o vocabulário!", "Todas as palavras do Termo Escolar foram concluídas!");
        return;
      }
      secret = deck[deckIdx];
      guesses = [];
      currentGuess = "";
      hintUsed = false;
      roundFinished = false;
      keyStates = {};
      setFeedback("");
      renderBoard();
    };

    const finishRun = (title, subtitle) => {
      if (activeCleanup) activeCleanup();
      renderGameOverScreen({
        title,
        subtitle,
        score,
        correct,
        wrong,
        bestStreak,
        duration: (Date.now() - startedAt) / 1000,
        onRestart: mountPortuguesTermo
      });
    };

    const submitGuess = () => {
      if (currentGuess.length < 5) {
        setFeedback("Digite uma palavra completa de 5 letras.", "error");
        const rowEl = stageEl.querySelector(`[data-row="${guesses.length}"]`);
        window.BitAcademyMotion?.shake(rowEl);
        return;
      }
      const evalRes = evaluateGuess(currentGuess, secret.word);
      guesses.push({ word: currentGuess, eval: evalRes });
      for (let i = 0; i < 5; i++) {
        const ch = currentGuess[i];
        const st = evalRes[i];
        if (!keyStates[ch] || priority[st] > priority[keyStates[ch]]) {
          keyStates[ch] = st;
        }
      }
      const won = currentGuess === secret.word;
      currentGuess = "";

      if (won) {
        roundFinished = true;
        correct++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        const triesBonus = (7 - guesses.length) * 25;
        const gained = Math.max(30, 80 + triesBonus + streak * 15 - (hintUsed ? 25 : 0));
        score += gained;
        setFeedback(`Acertou "${secret.display}"! +${gained} pontos · ${secret.hint}`, "success");
      } else if (guesses.length >= 6) {
        roundFinished = true;
        wrong++;
        streak = 0;
        setFeedback(`Fim das tentativas! A palavra era "${secret.display}" — ${secret.hint}`, "error");
      } else {
        setFeedback("");
      }
      renderBoard();
    };

    const handleKey = (key) => {
      if (roundFinished) {
        if (key === "ENTER") nextWord();
        return;
      }
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACK") {
        currentGuess = currentGuess.slice(0, -1);
        renderBoard();
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        currentGuess += key;
        renderBoard();
      }
    };

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") { e.preventDefault(); handleKey("ENTER"); }
      else if (e.key === "Backspace") { e.preventDefault(); handleKey("BACK"); }
      else {
        const k = normalizeText(e.key);
        if (/^[A-Z]$/.test(k)) handleKey(k);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    activeCleanup = () => document.removeEventListener("keydown", onKeyDown);
    setFeedback("Digite pelo teclado ou clique nas letras abaixo para descobrir a palavra de 5 letras.", "info");
    renderBoard();
  }

  // =========================================================================
  // 2. INGLÊS — WORD MATCH BILÍNGUE (MEMÓRIA 3D)
  // =========================================================================
  function mountInglesMatch() {
    const LEVELS = [
      {
        name: "Nível 1 · Escola & Estudo",
        pairs: [
          ["Library", "Biblioteca"], ["Notebook", "Caderno"], ["Knowledge", "Conhecimento"],
          ["Teacher", "Professor"], ["Homework", "Tarefa"], ["Science", "Ciência"]
        ]
      },
      {
        name: "Nível 2 · Verbos Essenciais",
        pairs: [
          ["To learn", "Aprender"], ["To understand", "Entender"], ["To improve", "Melhorar"],
          ["To discover", "Descobrir"], ["To achieve", "Conquistar"], ["To share", "Compartilhar"]
        ]
      },
      {
        name: "Nível 3 · Mundo & Tecnologia",
        pairs: [
          ["Network", "Rede"], ["Weather", "Clima"], ["Journey", "Jornada"],
          ["Challenge", "Desafio"], ["Environment", "Meio Ambiente"], ["Freedom", "Liberdade"],
          ["Algorithm", "Algoritmo"], ["Future", "Futuro"]
        ]
      }
    ];

    let levelIdx = 0;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let moves = 0;
    let startedAt = Date.now();
    let cards = [];
    let flipped = [];
    let locked = false;

    const buildLevel = () => {
      const lvl = LEVELS[levelIdx];
      const raw = [];
      lvl.pairs.forEach(([en, pt], pairId) => {
        raw.push({ id: `${pairId}-en`, pairId, text: en, lang: "EN", matched: false });
        raw.push({ id: `${pairId}-pt`, pairId, text: pt, lang: "PT", matched: false });
      });
      cards = shuffle(raw);
      flipped = [];
      locked = false;
      setFeedback(`${lvl.name}: encontre todos os ${lvl.pairs.length} pares Inglês ↔ Português!`, "info");
      render();
    };

    const render = () => {
      const lvl = LEVELS[levelIdx];
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Combo", value: `${streak}x`, icon: "flame" },
        { label: "Nível", value: `${levelIdx + 1}/${LEVELS.length}`, icon: "layers" }
      );

      const colsClass = cards.length > 12 ? "is-16" : "is-12";
      stageEl.innerHTML = `
        <div class="termo-toolbar">
          <span class="level-pill">${escapeHtml(lvl.name)} · Jogadas: ${moves}</span>
          <button type="button" class="secondary small-btn" id="match-finish-btn">
            ${window.BitAcademyIcons.svg("check-circle-2", 15)} Encerrar &amp; Salvar
          </button>
        </div>
        <div class="memory-grid ${colsClass}">
          ${cards.map((card, idx) => {
            const isFlipped = card.matched || flipped.includes(idx);
            return `
              <button type="button" class="memory-card ${isFlipped ? "is-flipped" : ""} ${card.matched ? "is-matched" : ""}" data-card-idx="${idx}" ${card.matched ? "disabled" : ""}>
                <span class="memory-card-inner">
                  <span class="memory-front">${window.BitAcademyIcons.svg("languages", 22)}</span>
                  <span class="memory-back">
                    <small class="memory-lang is-${card.lang.toLowerCase()}">${card.lang}</small>
                    <strong>${escapeHtml(card.text)}</strong>
                  </span>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      `;

      document.getElementById("match-finish-btn")?.addEventListener("click", () => {
        renderGameOverScreen({
          title: "Partida encerrada!",
          subtitle: `Você formou ${correct} par(es) bilíngues em ${moves} jogadas.`,
          score, correct, wrong, bestStreak,
          duration: (Date.now() - startedAt) / 1000,
          onRestart: mountInglesMatch
        });
      });

      stageEl.querySelectorAll("[data-card-idx]").forEach((btn) => {
        btn.addEventListener("click", () => handleFlip(Number(btn.dataset.cardIdx)));
      });
    };

    const handleFlip = (idx) => {
      if (locked || flipped.includes(idx) || cards[idx].matched) return;
      flipped.push(idx);
      render();

      if (flipped.length === 2) {
        moves++;
        locked = true;
        const [aIdx, bIdx] = flipped;
        const a = cards[aIdx];
        const b = cards[bIdx];

        if (a.pairId === b.pairId && a.lang !== b.lang) {
          a.matched = true;
          b.matched = true;
          correct++;
          streak++;
          bestStreak = Math.max(bestStreak, streak);
          const pts = 50 + streak * 15;
          score += pts;
          setFeedback(`Par encontrado! "${a.text}" = "${b.text}" (+${pts} pts)`, "success");
          flipped = [];
          locked = false;
          render();

          if (cards.every((c) => c.matched)) {
            score += 100;
            if (levelIdx + 1 < LEVELS.length) {
              levelIdx++;
              setFeedback(`Nível concluído! +100 pts de bônus. Preparando ${LEVELS[levelIdx].name}...`, "success");
              setTimeout(buildLevel, 1100);
            } else {
              setTimeout(() => {
                renderGameOverScreen({
                  title: "Mestre Bilíngue!",
                  subtitle: `Você completou todos os ${LEVELS.length} níveis em ${moves} jogadas!`,
                  score, correct, wrong, bestStreak,
                  duration: (Date.now() - startedAt) / 1000,
                  onRestart: mountInglesMatch
                });
              }, 800);
            }
          }
        } else {
          wrong++;
          streak = 0;
          setFeedback("Ainda não é esse par — memorize as posições!", "error");
          setTimeout(() => {
            flipped = [];
            locked = false;
            render();
          }, 850);
        }
      }
    };

    buildLevel();
  }

  // =========================================================================
  // 3. HISTÓRIA — ANTES OU DEPOIS? (LINHA DO TEMPO)
  // =========================================================================
  function mountHistoriaCronologia() {
    const EVENTS = [
      { year: 1453, title: "Queda de Constantinopla", info: "Marco tradicional do fim da Idade Média." },
      { year: 1500, title: "Chegada dos Portugueses ao Brasil", info: "Expedição de Pedro Álvares Cabral chega à Bahia." },
      { year: 1549, title: "Criação do Governo-Geral no Brasil", info: "Tomé de Sousa assume e funda Salvador." },
      { year: 1760, title: "Início da 1ª Revolução Industrial", info: "Mecanização têxtil e máquinas a vapor na Inglaterra." },
      { year: 1776, title: "Independência dos Estados Unidos", info: "Declaração assinada pelas 13 Colônias." },
      { year: 1789, title: "Queda da Bastilha (Revolução Francesa)", info: "Fim do Antigo Regime na França." },
      { year: 1808, title: "Chegada da Família Real ao Brasil", info: "Dom João VI transfere a corte portuguesa para o Rio." },
      { year: 1822, title: "Independência do Brasil", info: "Proclamada às margens do riacho Ipiranga." },
      { year: 1840, title: "Golpe da Maioridade", info: "Dom Pedro II assume o trono aos 14 anos." },
      { year: 1864, title: "Início da Guerra do Paraguai", info: "Maior conflito armado da América do Sul." },
      { year: 1888, title: "Assinatura da Lei Áurea", info: "Abolição oficial da escravidão no Brasil." },
      { year: 1889, title: "Proclamação da República no Brasil", info: "Marechal Deodoro assume o governo provisório." },
      { year: 1914, title: "Início da 1ª Guerra Mundial", info: "Conflito global desencadeado na Europa." },
      { year: 1917, title: "Revolução Russa", info: "Fim do regime czarista e ascensão bolchevique." },
      { year: 1922, title: "Semana de Arte Moderna", info: "Evento modernista no Theatro Municipal de São Paulo." },
      { year: 1929, title: "Quebra da Bolsa de Nova York", info: "Início da Grande Depressão mundial." },
      { year: 1930, title: "Revolução de 1930", info: "Getúlio Vargas chega ao poder e encerra a República Velha." },
      { year: 1939, title: "Início da 2ª Guerra Mundial", info: "Invasão da Polônia deflagra o conflito." },
      { year: 1945, title: "Criação da ONU", info: "Organização das Nações Unidas fundada após a 2ª Guerra." },
      { year: 1960, title: "Inauguração de Brasília", info: "Nova capital federal planejada por Lúcio Costa e Niemeyer." },
      { year: 1969, title: "Chegada do Homem à Lua", info: "Missão Apollo 11 pousa na superfície lunar." },
      { year: 1988, title: "Promulgação da Constituição Cidadã", info: "Atual Constituição Federal do Brasil." },
      { year: 1989, title: "Queda do Muro de Berlim", info: "Símbolo do fim da Guerra Fria." },
      { year: 1994, title: "Implantação do Plano Real", info: "Estabilização econômica e nova moeda brasileira." }
    ];

    let deck = shuffle(EVENTS);
    let anchor = deck.pop();
    let challenger = deck.pop();
    let historyTrail = [anchor];
    let lives = 3;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let startedAt = Date.now();
    let revealing = false;

    const render = () => {
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Sequência", value: streak, icon: "flame" },
        { label: "Vidas", value: "♥".repeat(lives) || "0", icon: "shield-check" }
      );

      stageEl.innerHTML = `
        <div class="timeline-arena">
          <article class="timeline-card is-anchor">
            <span class="level-pill">Referência</span>
            <h3>${escapeHtml(anchor.title)}</h3>
            <strong class="timeline-year">${anchor.year}</strong>
            <small>${escapeHtml(anchor.info)}</small>
          </article>

          <div class="timeline-vs">VS</div>

          <article class="timeline-card is-challenger" id="challenger-card">
            <span class="level-pill">Novo Marco</span>
            <h3>${escapeHtml(challenger.title)}</h3>
            <strong class="timeline-year">${revealing ? challenger.year : "????"}</strong>
            <small>${revealing ? escapeHtml(challenger.info) : "Este evento aconteceu ANTES ou DEPOIS de " + anchor.year + "?"}</small>
          </article>
        </div>

        <div class="timeline-controls">
          <button type="button" class="timeline-btn" data-choice="before" ${revealing ? "disabled" : ""}>
            ${window.BitAcademyIcons.svg("arrow-left", 18)} Aconteceu ANTES de ${anchor.year}
          </button>
          <button type="button" class="timeline-btn" data-choice="after" ${revealing ? "disabled" : ""}>
            Aconteceu DEPOIS de ${anchor.year} ${window.BitAcademyIcons.svg("arrow-right", 18)}
          </button>
        </div>

        <div class="timeline-strip">
          ${historyTrail.slice(-5).map((ev) => `<span><b>${ev.year}</b> ${escapeHtml(ev.title)}</span>`).join("")}
        </div>
      `;

      stageEl.querySelectorAll("[data-choice]").forEach((btn) => {
        btn.addEventListener("click", () => handleChoice(btn.dataset.choice));
      });
    };

    const handleChoice = (choice) => {
      if (revealing) return;
      revealing = true;
      const isCorrect = choice === "before" ? challenger.year < anchor.year : challenger.year > anchor.year;

      if (isCorrect) {
        correct++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        const pts = 60 + streak * 15;
        score += pts;
        setFeedback(`Correto! ${challenger.title} foi em ${challenger.year} (+${pts} pts).`, "success");
      } else {
        wrong++;
        streak = 0;
        lives--;
        setFeedback(`Ops! ${challenger.title} ocorreu em ${challenger.year}.`, "error");
        window.BitAcademyMotion?.shake(document.getElementById("challenger-card"));
      }
      render();

      setTimeout(() => {
        if (lives <= 0 || deck.length === 0) {
          if (activeCleanup) activeCleanup();
          renderGameOverScreen({
            title: lives > 0 ? "Cronologia Completa!" : "Fim das Vidas!",
            subtitle: `Você acertou ${correct} evento(s) históricos na linha do tempo.`,
            score, correct, wrong, bestStreak,
            duration: (Date.now() - startedAt) / 1000,
            onRestart: mountHistoriaCronologia
          });
          return;
        }
        anchor = challenger;
        historyTrail.push(anchor);
        challenger = deck.pop();
        revealing = false;
        render();
      }, 1300);
    };

    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleChoice("before");
      if (e.key === "ArrowRight") handleChoice("after");
    };
    document.addEventListener("keydown", onKey);
    activeCleanup = () => document.removeEventListener("keydown", onKey);

    setFeedback("Dica: você também pode usar as setas ← e → do teclado!", "info");
    render();
  }

  // =========================================================================
  // 4. GEOGRAFIA — GEORADAR (CAPITAIS, ESTADOS & BIOMAS)
  // =========================================================================
  function mountGeografiaRadar() {
    const ITEMS = [
      { tag: "Capital Mundial", q: "Qual é a capital do Canadá?", ans: "Ottawa", opts: ["Toronto", "Vancouver", "Ottawa", "Montreal"], hint: "Não é a maior cidade do país; fica na província de Ontário." },
      { tag: "Capital Mundial", q: "Qual é a capital da Austrália?", ans: "Camberra", opts: ["Sydney", "Melbourne", "Camberra", "Brisbane"], hint: "Foi planejada justamente para encerrar a disputa entre Sydney e Melbourne." },
      { tag: "Brasil", q: "Qual é a capital do estado do Tocantins?", ans: "Palmas", opts: ["Palmas", "Araguaína", "Goiânia", "Cuiabá"], hint: "Cidade planejada inaugurada em 1989." },
      { tag: "Brasil", q: "Qual é a capital de Santa Catarina?", ans: "Florianópolis", opts: ["Joinville", "Blumenau", "Florianópolis", "Curitiba"], hint: "Grande parte do município fica em uma ilha." },
      { tag: "Biomas do Brasil", q: "Qual bioma brasileiro é exclusivo do território nacional e tem clima semiárido?", ans: "Caatinga", opts: ["Cerrado", "Caatinga", "Pampa", "Pantanal"], hint: "Predomina no Nordeste e tem vegetação adaptada à seca." },
      { tag: "Biomas do Brasil", q: "Qual bioma é conhecido como a 'caixa d'água do Brasil' por abrigar nascentes de grandes bacias?", ans: "Cerrado", opts: ["Amazônia", "Cerrado", "Mata Atlântica", "Pampa"], hint: "Savana brasileira com árvores de troncos retorcidos." },
      { tag: "Capital Mundial", q: "Qual é a capital do Japão?", ans: "Tóquio", opts: ["Quioto", "Osaka", "Tóquio", "Hiroshima"], hint: "Região metropolitana mais populosa do planeta." },
      { tag: "Capital Mundial", q: "Qual é a capital do Egito?", ans: "Cairo", opts: ["Alexandria", "Cairo", "Luxor", "Casablanca"], hint: "Fica às margens do Rio Nilo, próxima às pirâmides de Gizé." },
      { tag: "Brasil", q: "Qual é a capital do estado do Maranhão?", ans: "São Luís", opts: ["Teresina", "São Luís", "Fortaleza", "Belém"], hint: "Única capital brasileira fundada por franceses." },
      { tag: "Geografia Física", q: "Qual é a maior cordilheira continental em extensão do mundo?", ans: "Cordilheira dos Andes", opts: ["Himalaia", "Alpes", "Cordilheira dos Andes", "Montanhas Rochosas"], hint: "Percorre toda a costa oeste da América do Sul." },
      { tag: "Capital Mundial", q: "Qual é a capital da Suíça (sede do governo)?", ans: "Berna", opts: ["Zurique", "Genebra", "Berna", "Basileia"], hint: "Seu centro histórico medieval é Patrimônio da UNESCO." },
      { tag: "Brasil", q: "Qual estado brasileiro faz fronteira com o maior número de outros estados?", ans: "Bahia", opts: ["Minas Gerais", "Bahia", "Goiás", "Mato Grosso"], hint: "Localizado no Nordeste, faz divisa com 8 estados." },
      { tag: "Capital Mundial", q: "Qual é a capital da Turquia?", ans: "Ancara", opts: ["Istambul", "Ancara", "Izmir", "Antália"], hint: "Não é Istambul; fica na região central da Anatólia." },
      { tag: "Geografia Física", q: "Qual oceano banha a costa leste do Brasil?", ans: "Oceano Atlântico", opts: ["Oceano Pacífico", "Oceano Índico", "Oceano Atlântico", "Oceano Ártico"], hint: "Separa as Américas da Europa e da África." }
    ];

    let deck = shuffle(ITEMS);
    let idx = 0;
    let lives = 3;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let hintUsed = false;
    let eliminated = [];
    let locked = false;
    let startedAt = Date.now();

    const render = () => {
      const item = deck[idx];
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Sequência", value: streak, icon: "flame" },
        { label: "Vidas", value: "♥".repeat(lives) || "0", icon: "shield-check" }
      );

      stageEl.innerHTML = `
        <div class="radar-card">
          <div class="termo-toolbar">
            <span class="level-pill">${escapeHtml(item.tag)} · ${idx + 1}/${deck.length}</span>
            <button type="button" class="secondary small-btn" id="radar-hint-btn" ${hintUsed || locked ? "disabled" : ""}>
              ${window.BitAcademyIcons.svg("compass", 15)} ${hintUsed ? "Radar ativado" : "Radar Dica (50/50)"}
            </button>
          </div>
          <h3 class="radar-question">${escapeHtml(item.q)}</h3>
          ${hintUsed ? `<div class="arcade-hint-box">${window.BitAcademyIcons.svg("lightbulb", 16)} <span>${escapeHtml(item.hint)}</span></div>` : ""}
          <div class="radar-options">
            ${item.opts.map((opt) => {
              const isElim = eliminated.includes(opt);
              return `<button type="button" class="radar-opt" data-opt="${escapeHtml(opt)}" ${isElim || locked ? "disabled" : ""}>${escapeHtml(opt)}</button>`;
            }).join("")}
          </div>
        </div>
      `;

      document.getElementById("radar-hint-btn")?.addEventListener("click", () => {
        if (hintUsed || locked) return;
        hintUsed = true;
        const wrongs = shuffle(item.opts.filter((o) => o !== item.ans));
        eliminated = wrongs.slice(0, 2);
        render();
      });

      stageEl.querySelectorAll("[data-opt]").forEach((btn) => {
        btn.addEventListener("click", () => choose(btn.dataset.opt, btn));
      });
    };

    const choose = (opt, btnEl) => {
      if (locked) return;
      locked = true;
      const item = deck[idx];
      const ok = opt === item.ans;

      if (ok) {
        correct++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        const pts = (hintUsed ? 45 : 90) + streak * 10;
        score += pts;
        btnEl.classList.add("is-correct");
        setFeedback(`Na mosca! ${item.ans} (+${pts} pts).`, "success");
      } else {
        wrong++;
        streak = 0;
        lives--;
        btnEl.classList.add("is-wrong");
        stageEl.querySelectorAll("[data-opt]").forEach((b) => {
          if (b.dataset.opt === item.ans) b.classList.add("is-correct");
        });
        setFeedback(`Resposta correta: ${item.ans}.`, "error");
        window.BitAcademyMotion?.shake(stageEl.querySelector(".radar-card"));
      }

      setTimeout(() => {
        idx++;
        if (lives <= 0 || idx >= deck.length) {
          renderGameOverScreen({
            title: lives > 0 ? "Expedição Concluída!" : "Radar Offline!",
            subtitle: `Você acertou ${correct} de ${correct + wrong} coordenadas geográficas.`,
            score, correct, wrong, bestStreak,
            duration: (Date.now() - startedAt) / 1000,
            onRestart: mountGeografiaRadar
          });
          return;
        }
        hintUsed = false;
        eliminated = [];
        locked = false;
        render();
      }, 1050);
    };

    render();
  }

  // =========================================================================
  // 5. CIÊNCIAS — LAB RELÂMPAGO (CLASSIFICADOR CONTRA O TEMPO)
  // =========================================================================
  function mountCienciasLab() {
    const ROUNDS = shuffle([
      { topic: "Transformações da Matéria", item: "Gelo derretendo no copo", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 0 },
      { topic: "Transformações da Matéria", item: "Prego enferrujando na chuva", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 1 },
      { topic: "Transformações da Matéria", item: "Queima de papel na fogueira", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 1 },
      { topic: "Transformações da Matéria", item: "Água fervendo e virando vapor", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 0 },
      { topic: "Transformações da Matéria", item: "Fotossíntese nas folhas", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 1 },
      { topic: "Transformações da Matéria", item: "Vidro se quebrando em pedaços", bins: ["Fenômeno Físico", "Fenômeno Químico"], ans: 0 },
      { topic: "Corpo Humano", item: "Alvéolos Pulmonares", bins: ["Digestório", "Respiratório", "Circulatório"], ans: 1 },
      { topic: "Corpo Humano", item: "Ventrículos e Átrios", bins: ["Digestório", "Respiratório", "Circulatório"], ans: 2 },
      { topic: "Corpo Humano", item: "Esôfago e Estômago", bins: ["Digestório", "Respiratório", "Circulatório"], ans: 0 },
      { topic: "Corpo Humano", item: "Artéria Aorta", bins: ["Digestório", "Respiratório", "Circulatório"], ans: 2 },
      { topic: "Corpo Humano", item: "Traqueia e Brônquios", bins: ["Digestório", "Respiratório", "Circulatório"], ans: 1 },
      { topic: "Tabela Periódica", item: "Ferro (Fe)", bins: ["Metal", "Ametal", "Gás Nobre"], ans: 0 },
      { topic: "Tabela Periódica", item: "Hélio (He)", bins: ["Metal", "Ametal", "Gás Nobre"], ans: 2 },
      { topic: "Tabela Periódica", item: "Oxigênio (O)", bins: ["Metal", "Ametal", "Gás Nobre"], ans: 1 },
      { topic: "Tabela Periódica", item: "Ouro (Au)", bins: ["Metal", "Ametal", "Gás Nobre"], ans: 0 },
      { topic: "Tabela Periódica", item: "Neônio (Ne)", bins: ["Metal", "Ametal", "Gás Nobre"], ans: 2 },
      { topic: "Reino Animal", item: "Polvo", bins: ["Vertebrado", "Invertebrado"], ans: 1 },
      { topic: "Reino Animal", item: "Golfinho", bins: ["Vertebrado", "Invertebrado"], ans: 0 },
      { topic: "Reino Animal", item: "Morcego", bins: ["Vertebrado", "Invertebrado"], ans: 0 },
      { topic: "Reino Animal", item: "Borboleta", bins: ["Vertebrado", "Invertebrado"], ans: 1 }
    ]);

    const ITEM_TIME_MS = 8500;
    let idx = 0;
    let lives = 3;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let startedAt = Date.now();
    let itemStart = Date.now();
    let timerHandle = null;
    let locked = false;

    const stopTimer = () => {
      if (timerHandle) {
        clearInterval(timerHandle);
        timerHandle = null;
      }
    };

    const finish = (title) => {
      stopTimer();
      if (activeCleanup) activeCleanup();
      renderGameOverScreen({
        title,
        subtitle: `Você classificou ${correct} item(ns) científicos corretamente!`,
        score, correct, wrong, bestStreak,
        duration: (Date.now() - startedAt) / 1000,
        onRestart: mountCienciasLab
      });
    };

    const render = () => {
      const r = ROUNDS[idx];
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Combo", value: `${streak}x`, icon: "flame" },
        { label: "Vidas", value: "♥".repeat(lives) || "0", icon: "shield-check" }
      );

      stageEl.innerHTML = `
        <div class="lab-card" id="lab-card">
          <div class="termo-toolbar">
            <span class="level-pill">${escapeHtml(r.topic)} · ${idx + 1}/${ROUNDS.length}</span>
            <span class="level-pill">Teclas 1–${r.bins.length}</span>
          </div>
          <div class="lab-timer-bar"><div class="lab-timer-fill" id="lab-timer-fill" style="width:100%"></div></div>
          <div class="lab-specimen">
            <small>Classifique rapidamente:</small>
            <strong>${escapeHtml(r.item)}</strong>
          </div>
          <div class="lab-bins">
            ${r.bins.map((bin, bIdx) => `
              <button type="button" class="lab-bin-btn" data-bin="${bIdx}">
                <span class="lab-bin-key">${bIdx + 1}</span>
                <span>${escapeHtml(bin)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;

      stageEl.querySelectorAll("[data-bin]").forEach((btn) => {
        btn.addEventListener("click", () => classify(Number(btn.dataset.bin)));
      });

      itemStart = Date.now();
      stopTimer();
      timerHandle = setInterval(() => {
        if (locked) return;
        const elapsed = Date.now() - itemStart;
        const pct = Math.max(0, 100 - (elapsed / ITEM_TIME_MS) * 100);
        const fill = document.getElementById("lab-timer-fill");
        if (fill) {
          fill.style.width = `${pct}%`;
          if (pct < 30) fill.classList.add("is-urgent");
        }
        if (elapsed >= ITEM_TIME_MS) {
          classify(-1);
        }
      }, 60);
    };

    const classify = (binIdx) => {
      if (locked) return;
      locked = true;
      stopTimer();
      const r = ROUNDS[idx];
      const ok = binIdx === r.ans;
      const elapsed = Date.now() - itemStart;
      const speedBonus = Math.max(0, Math.round(((ITEM_TIME_MS - elapsed) / ITEM_TIME_MS) * 40));

      if (ok) {
        correct++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        const pts = 50 + speedBonus + streak * 10;
        score += pts;
        setFeedback(`Classificação exata! "${r.item}" → ${r.bins[r.ans]} (+${pts} pts)`, "success");
      } else {
        wrong++;
        streak = 0;
        lives--;
        const reason = binIdx === -1 ? "Tempo esgotado!" : "Categoria incorreta!";
        setFeedback(`${reason} "${r.item}" pertence a ${r.bins[r.ans]}.`, "error");
        window.BitAcademyMotion?.shake(document.getElementById("lab-card"));
      }

      setTimeout(() => {
        idx++;
        if (lives <= 0 || idx >= ROUNDS.length) {
          finish(lives > 0 ? "Experimento Concluído!" : "Laboratório Encerrado!");
          return;
        }
        locked = false;
        render();
      }, 950);
    };

    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 3 && !locked && ROUNDS[idx] && n <= ROUNDS[idx].bins.length) {
        classify(n - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    activeCleanup = () => {
      stopTimer();
      document.removeEventListener("keydown", onKey);
    };

    setFeedback("Use o mouse ou as teclas 1, 2 e 3 para classificar em velocidade máxima!", "info");
    render();
  }

  // =========================================================================
  // 6. ARTES — ESTÚDIO CROMÁTICO (MISTURADOR RGB + MOVIMENTOS)
  // =========================================================================
  function mountArtesEstudio() {
    const MIX_TARGETS = [
      { name: "Ciano Elétrico", r: 34, g: 211, b: 238, hint: "Muito verde e azul, quase nada de vermelho." },
      { name: "Coral Vibrante", r: 244, g: 114, b: 96, hint: "Vermelho alto com toque moderado de verde e azul." },
      { name: "Violeta Real", r: 139, g: 92, b: 246, hint: "Azul no topo, vermelho médio e verde baixo." },
      { name: "Amarelo Ouro", r: 250, g: 204, b: 21, hint: "Na luz RGB, vermelho + verde = amarelo!" },
      { name: "Verde Esmeralda", r: 34, g: 197, b: 94, hint: "Verde dominante, pouco azul e quase zero vermelho." }
    ];

    const ART_ROUNDS = [
      { q: "Qual é a cor complementar (oposta no círculo cromático) do Azul?", ans: "Laranja", opts: ["Verde", "Laranja", "Roxo", "Ciano"], swatch: "#2563eb" },
      { q: "Qual movimento artístico é famoso pelas pinceladas soltas captando a luz natural (Monet)?", ans: "Impressionismo", opts: ["Cubismo", "Impressionismo", "Surrealismo", "Barroco"], swatch: "#38bdf8" },
      { q: "Qual movimento, liderado por Picasso, fragmenta objetos em formas geométricas?", ans: "Cubismo", opts: ["Renascimento", "Cubismo", "Romantismo", "Pop Art"], swatch: "#f59e0b" },
      { q: "Qual é a cor complementar do Vermelho no círculo cromático tradicional?", ans: "Verde", opts: ["Amarelo", "Roxo", "Verde", "Azul"], swatch: "#ef4444" }
    ];

    const sequence = [];
    const mixedShuffled = shuffle(MIX_TARGETS).slice(0, 4);
    const artShuffled = shuffle(ART_ROUNDS).slice(0, 4);
    for (let i = 0; i < 4; i++) {
      sequence.push({ type: "mix", data: mixedShuffled[i] });
      sequence.push({ type: "art", data: artShuffled[i] });
    }

    let idx = 0;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let startedAt = Date.now();
    let locked = false;

    const render = () => {
      const step = sequence[idx];
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Sequência", value: streak, icon: "flame" },
        { label: "Etapa", value: `${idx + 1}/${sequence.length}`, icon: "palette" }
      );

      if (step.type === "mix") {
        const t = step.data;
        let curR = 128, curG = 128, curB = 128;
        stageEl.innerHTML = `
          <div class="color-studio">
            <span class="level-pill">Mistura de Luz RGB · Alvo: ${escapeHtml(t.name)}</span>
            <p class="studio-hint">${escapeHtml(t.hint)}</p>
            <div class="color-swatches">
              <div class="swatch-box">
                <div class="swatch-preview" style="background:rgb(${t.r},${t.g},${t.b})"></div>
                <span>Cor-Alvo</span>
              </div>
              <div class="swatch-box">
                <div class="swatch-preview" id="user-swatch" style="background:rgb(128,128,128)"></div>
                <span>Sua Mistura</span>
              </div>
            </div>
            <div class="rgb-sliders">
              <label class="rgb-row is-r"><span>R (Vermelho)</span><input type="range" id="sl-r" min="0" max="255" value="128"><b id="val-r">128</b></label>
              <label class="rgb-row is-g"><span>G (Verde)</span><input type="range" id="sl-g" min="0" max="255" value="128"><b id="val-g">128</b></label>
              <label class="rgb-row is-b"><span>B (Azul)</span><input type="range" id="sl-b" min="0" max="255" value="128"><b id="val-b">128</b></label>
            </div>
            <button type="button" id="validate-mix-btn">${window.BitAcademyIcons.svg("sparkles", 17)} Validar Mistura</button>
          </div>
        `;

        const updateSwatch = () => {
          curR = Number(document.getElementById("sl-r").value);
          curG = Number(document.getElementById("sl-g").value);
          curB = Number(document.getElementById("sl-b").value);
          document.getElementById("val-r").textContent = curR;
          document.getElementById("val-g").textContent = curG;
          document.getElementById("val-b").textContent = curB;
          document.getElementById("user-swatch").style.background = `rgb(${curR},${curG},${curB})`;
        };

        ["sl-r", "sl-g", "sl-b"].forEach((id) => document.getElementById(id)?.addEventListener("input", updateSwatch));
        document.getElementById("validate-mix-btn")?.addEventListener("click", () => {
          if (locked) return;
          locked = true;
          const dist = Math.sqrt((curR - t.r) ** 2 + (curG - t.g) ** 2 + (curB - t.b) ** 2);
          const maxDist = Math.sqrt(255 ** 2 * 3);
          const accuracy = Math.max(0, Math.round((1 - dist / maxDist) * 100));
          const pts = Math.round(accuracy * 1.4);
          if (accuracy >= 75) {
            correct++;
            streak++;
            bestStreak = Math.max(bestStreak, streak);
            score += pts;
            setFeedback(`Precisão de ${accuracy}%! Mistura excelente (+${pts} pts).`, "success");
          } else {
            wrong++;
            streak = 0;
            score += Math.round(pts * 0.4);
            setFeedback(`Precisão de ${accuracy}% (alvo era RGB ${t.r}, ${t.g}, ${t.b}).`, "error");
          }
          nextStep();
        });
      } else {
        const a = step.data;
        stageEl.innerHTML = `
          <div class="radar-card">
            <div class="termo-toolbar">
              <span class="level-pill">Teoria das Cores &amp; Movimentos</span>
              <span class="mini-swatch" style="background:${a.swatch}"></span>
            </div>
            <h3 class="radar-question">${escapeHtml(a.q)}</h3>
            <div class="radar-options">
              ${a.opts.map((opt) => `<button type="button" class="radar-opt" data-art-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join("")}
            </div>
          </div>
        `;
        stageEl.querySelectorAll("[data-art-opt]").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (locked) return;
            locked = true;
            const ok = btn.dataset.artOpt === a.ans;
            if (ok) {
              correct++;
              streak++;
              bestStreak = Math.max(bestStreak, streak);
              const pts = 90 + streak * 10;
              score += pts;
              btn.classList.add("is-correct");
              setFeedback(`Perfeito! ${a.ans} (+${pts} pts).`, "success");
            } else {
              wrong++;
              streak = 0;
              btn.classList.add("is-wrong");
              setFeedback(`Resposta correta: ${a.ans}.`, "error");
            }
            nextStep();
          });
        });
      }
    };

    const nextStep = () => {
      setTimeout(() => {
        idx++;
        if (idx >= sequence.length) {
          renderGameOverScreen({
            title: "Exposição Finalizada!",
            subtitle: `Você concluiu as ${sequence.length} etapas do Estúdio Cromático.`,
            score, correct, wrong, bestStreak,
            duration: (Date.now() - startedAt) / 1000,
            onRestart: mountArtesEstudio
          });
          return;
        }
        locked = false;
        render();
      }, 1250);
    };

    setFeedback("Ajuste os canais RGB para chegar o mais perto possível da Cor-Alvo!", "info");
    render();
  }

  // =========================================================================
  // 7. FILOSOFIA — ORÁCULO FILOSÓFICO (DEDUÇÃO POR PISTAS)
  // =========================================================================
  function mountFilosofiaOraculo() {
    const THINKERS = [
      {
        name: "Sócrates",
        clues: [
          "\"Só sei que nada sei.\" Defendia o diálogo (maiêutica) para chegar à verdade.",
          "Filósofo grego da Antiguidade Clássica que não deixou obras escritas próprias.",
          "Foi mestre de Platão e condenado a beber cicuta em Atenas."
        ]
      },
      {
        name: "Platão",
        clues: [
          "Criou a famosa Alegoria da Caverna para distinguir o mundo sensível do mundo das ideias.",
          "Fundou a Academia de Atenas, considerada a primeira instituição de ensino superior do Ocidente.",
          "Autor de 'A República', obra central sobre justiça e política."
        ]
      },
      {
        name: "Aristóteles",
        clues: [
          "Definiu o ser humano como um 'animal político' e propôs a ética da virtude pelo equilíbrio (justa medida).",
          "Fundou o Liceu em Atenas e sistematizou a lógica formal e a biologia.",
          "Foi discípulo de Platão e tutor de Alexandre, o Grande."
        ]
      },
      {
        name: "René Descartes",
        clues: [
          "\"Penso, logo existo\" (Cogito, ergo sum).",
          "Pai do Racionalismo moderno e da dúvida metódica.",
          "Autor de 'Discurso do Método' e criador do plano cartesiano na matemática."
        ]
      },
      {
        name: "Immanuel Kant",
        clues: [
          "Propôs o Imperativo Categórico: aja apenas segundo uma máxima que possa virar lei universal.",
          "Grande expoente do Iluminismo alemão, uniu racionalismo e empirismo.",
          "Autor de 'Crítica da Razão Pura' e defensor do lema 'Sapere aude' (Ouse saber)."
        ]
      },
      {
        name: "Nicolau Maquiavel",
        clues: [
          "Separou a política da moral religiosa tradicional, analisando como o poder funciona na prática.",
          "Pensador italiano do Renascimento, trabalhou na diplomacia de Florença.",
          "Autor do clássico 'O Príncipe'."
        ]
      },
      {
        name: "Jean-Jacques Rousseau",
        clues: [
          "Defendeu que o ser humano nasce bom, mas a sociedade o corrompe (teoria do bom selvagem).",
          "Filósofo contratualista que influenciou diretamente a Revolução Francesa.",
          "Autor de 'Do Contrato Social' e defensor da soberania popular."
        ]
      },
      {
        name: "Simone de Beauvoir",
        clues: [
          "\"Não se nasce mulher: torna-se mulher.\"",
          "Filósofa existencialista francesa que debateu liberdade, alteridade e igualdade de gênero.",
          "Autora da obra marcante 'O Segundo Sexo' (1949)."
        ]
      },
      {
        name: "Friedrich Nietzsche",
        clues: [
          "Criticou a moral tradicional ocidental e propôs conceitos como 'vontade de potência' e 'eterno retorno'.",
          "Filósofo alemão do século XIX conhecido pelo estilo aforístico e provocador.",
          "Autor de 'Assim Falou Zaratustra'."
        ]
      },
      {
        name: "Hannah Arendt",
        clues: [
          "Cunhou o conceito de 'banalidade do mal' ao analisar regimes totalitários.",
          "Teórica política alemã radicada nos EUA no século XX.",
          "Autora de 'As Origens do Totalitarismo' e 'A Condição Humana'."
        ]
      }
    ];

    const ALL_NAMES = THINKERS.map((t) => t.name);
    const deck = shuffle(THINKERS).slice(0, 8);
    let idx = 0;
    let cluesShown = 1;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let streak = 0;
    let bestStreak = 0;
    let locked = false;
    let startedAt = Date.now();
    let currentOptions = [];

    const prepareRound = () => {
      cluesShown = 1;
      locked = false;
      const target = deck[idx];
      const distractors = shuffle(ALL_NAMES.filter((n) => n !== target.name)).slice(0, 3);
      currentOptions = shuffle([target.name, ...distractors]);
      render();
    };

    const pointsForClues = (n) => (n === 1 ? 120 : n === 2 ? 80 : 45);

    const render = () => {
      const target = deck[idx];
      const potentialPts = pointsForClues(cluesShown);
      setStats(
        { label: "Pontuação", value: score, icon: "trophy" },
        { label: "Sequência", value: streak, icon: "flame" },
        { label: "Enigma", value: `${idx + 1}/${deck.length}`, icon: "brain" }
      );

      stageEl.innerHTML = `
        <div class="oracle-card" id="oracle-card">
          <div class="termo-toolbar">
            <span class="level-pill">Valendo ${potentialPts} pts</span>
            <button type="button" class="secondary small-btn" id="oracle-clue-btn" ${cluesShown >= 3 || locked ? "disabled" : ""}>
              ${window.BitAcademyIcons.svg("lightbulb", 15)} ${cluesShown >= 3 ? "Todas as pistas abertas" : `Revelar Pista ${cluesShown + 1}`}
            </button>
          </div>
          <div class="oracle-clues">
            ${target.clues.slice(0, cluesShown).map((clue, cIdx) => `
              <div class="oracle-clue-item">
                <span>Pista ${cIdx + 1}</span>
                <p>${escapeHtml(clue)}</p>
              </div>
            `).join("")}
          </div>
          <div class="radar-options">
            ${currentOptions.map((opt) => `<button type="button" class="radar-opt" data-thinker="${escapeHtml(opt)}" ${locked ? "disabled" : ""}>${escapeHtml(opt)}</button>`).join("")}
          </div>
        </div>
      `;

      document.getElementById("oracle-clue-btn")?.addEventListener("click", () => {
        if (cluesShown < 3 && !locked) {
          cluesShown++;
          render();
        }
      });

      stageEl.querySelectorAll("[data-thinker]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (locked) return;
          locked = true;
          const ok = btn.dataset.thinker === target.name;
          if (ok) {
            correct++;
            streak++;
            bestStreak = Math.max(bestStreak, streak);
            const pts = potentialPts + streak * 10;
            score += pts;
            btn.classList.add("is-correct");
            setFeedback(`Brilhante! Era ${target.name} (+${pts} pts).`, "success");
          } else {
            wrong++;
            streak = 0;
            btn.classList.add("is-wrong");
            stageEl.querySelectorAll("[data-thinker]").forEach((b) => {
              if (b.dataset.thinker === target.name) b.classList.add("is-correct");
            });
            setFeedback(`O pensador correto era ${target.name}.`, "error");
            window.BitAcademyMotion?.shake(document.getElementById("oracle-card"));
          }

          setTimeout(() => {
            idx++;
            if (idx >= deck.length) {
              renderGameOverScreen({
                title: "Sabedoria Alcançada!",
                subtitle: `Você desvendou ${correct} de ${deck.length} pensadores no Oráculo Filosófico.`,
                score, correct, wrong, bestStreak,
                duration: (Date.now() - startedAt) / 1000,
                onRestart: mountFilosofiaOraculo
              });
              return;
            }
            prepareRound();
          }, 1250);
        });
      });
    };

    setFeedback("Tente acertar na 1ª pista para ganhar 120 pontos!", "info");
    prepareRound();
  }

  // =========================================================================
  // BOOTSTRAP DA PÁGINA DE ARCADE
  // =========================================================================
  const init = async () => {
    document.title = `${currentConfig.title} — BitAcademy`;
    document.documentElement.style.setProperty("--game-accent", currentConfig.accent);

    document.getElementById("arcade-eyebrow").innerHTML = `${window.BitAcademyIcons.svg(currentConfig.icon, 14)} ${escapeHtml(currentConfig.subjectName)} · Arena de Jogos`;
    document.getElementById("arcade-title").textContent = currentConfig.title;
    document.getElementById("arcade-subtitle").textContent = currentConfig.subtitle;
    document.getElementById("arcade-badge-label").innerHTML = `${window.BitAcademyIcons.svg("gamepad-2", 14)} ${escapeHtml(currentConfig.badgeLabel)}`;
    document.getElementById("arcade-badge-value").textContent = currentConfig.badgeValue;
    rankingTitleEl.textContent = `Top 10 · ${currentConfig.title}`;

    const subjectLink = document.getElementById("subject-back-link");
    if (subjectLink) {
      subjectLink.href = `../materia.html?slug=${encodeURIComponent(currentConfig.subjectSlug)}`;
      subjectLink.innerHTML = `${window.BitAcademyIcons.svg("book-open", 16)} Estudar ${escapeHtml(currentConfig.subjectName)}`;
    }

    if (switcherListEl) {
      switcherListEl.innerHTML = ALL_SWITCHER_GAMES.map((g) => `
        <a href="${g.href}" class="switcher-pill ${g.mode === currentConfig.mode ? "is-active" : ""}">
          <span>${window.BitAcademyIcons.svg(g.icon, 16)}</span>
          <div>
            <strong>${escapeHtml(g.title)}</strong>
            <small>${escapeHtml(g.subjectName)}</small>
          </div>
        </a>
      `).join("");
    }

    const MOUNTERS = {
      "portugues-termo": mountPortuguesTermo,
      "ingles-match": mountInglesMatch,
      "historia-cronologia": mountHistoriaCronologia,
      "geografia-radar": mountGeografiaRadar,
      "ciencias-lab": mountCienciasLab,
      "artes-estudio": mountArtesEstudio,
      "filosofia-oraculo": mountFilosofiaOraculo
    };

    (MOUNTERS[currentConfig.mode] || mountPortuguesTermo)();
    await window.BitAcademyAuth?.ready;
    loadRanking();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
