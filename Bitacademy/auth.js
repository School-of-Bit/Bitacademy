window.BitAcademyAuth = (() => {
  let currentUser = null;
  let profileData = null;

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const getRelativePrefix = () => {
    const path = window.location.pathname;
    return path.includes("/Quiz/") || path.includes("/Jogos/") ? "../" : "";
  };
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const api = async (path, options = {}) => {
    const response = await fetch(`${getRelativePrefix()}api/${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });

    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Ocorreu um erro na comunicação com o servidor.");
    return data;
  };

  const loadCurrentUser = async () => {
    try {
      const data = await api("auth/me");
      currentUser = data.user || null;
    } catch {
      currentUser = null;
    }
    return currentUser;
  };

  const ready = loadCurrentUser();

  const getCurrentUser = () => currentUser;

  const register = async ({ name, email, password, type, materia }) => {
    const data = await api("auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(name || "").trim(),
        email: normalize(email),
        password,
        type,
        materia
      })
    });
    currentUser = data.user;
    return currentUser;
  };

  const login = async ({ email, password }) => {
    const data = await api("auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalize(email), password })
    });
    currentUser = data.user;
    return currentUser;
  };

  const logout = async () => {
    try { await api("auth/logout", { method: "POST" }); } catch {}
    currentUser = null;
    window.location.href = `${getRelativePrefix()}login.html`;
  };

  const recordQuizResult = async ({ materia, titulo, score, total }) => {
    const data = await api("quizzes/result", {
      method: "POST",
      body: JSON.stringify({ materia, titulo, score, total })
    });
    return data.result;
  };

  const getQuizRanking = async (materia, limit = 10) => {
    const params = new URLSearchParams({ materia, limit: String(limit) });
    const data = await api(`quizzes/ranking?${params}`);
    return data.ranking || [];
  };

  const getProgress = async () => {
    if (!currentUser) return [];
    if (!profileData) {
      profileData = await api("profile");
    }
    return profileData.quizResults || [];
  };

  const recordGameScore = async ({ mode, title, score, correct, wrong, bestStreak, duration }) => {
    const data = await api("games/score", {
      method: "POST",
      body: JSON.stringify({ mode, title, score, correct, wrong, bestStreak, duration })
    });
    return data.result;
  };

  const getGameRanking = async (mode, limit = 10) => {
    const params = new URLSearchParams({ mode, limit: String(limit) });
    const data = await api(`games/ranking?${params}`);
    return data.ranking || [];
  };

  const getUserGameScores = async () => {
    if (!currentUser) return [];
    if (!profileData) profileData = await api("profile");
    return profileData.gameScores || [];
  };

  const renderAuthStatus = () => {
    document.querySelectorAll("[data-auth-status]").forEach((container) => {
      const user = getCurrentUser();
      const prefix = getRelativePrefix();
      if (!user) {
        container.innerHTML = `<a href="${prefix}login.html">Entrar</a>`;
        return;
      }
      const firstName = escapeHtml(user.name.split(" ")[0]);
      container.innerHTML = `
        <a href="${prefix}perfil.html">Olá, ${firstName}</a>
        <button type="button" data-auth-logout>Sair</button>
      `;
    });
  };

  const renderProfile = async () => {
    const container = document.querySelector("[data-profile]");
    if (!container) return;

    await ready;
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      profileData = await api("profile");
    } catch (error) {
      container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
      return;
    }

    const results = profileData.quizResults || [];
    const gameScores = profileData.gameScores || [];
    const bestPercent = results.length ? Math.max(...results.map((result) => result.percent)) : 0;
    const bestGameScore = gameScores.length ? Math.max(...gameScores.map((result) => result.score)) : 0;
    const average = results.length
      ? Math.round(results.reduce((sum, result) => sum + result.percent, 0) / results.length)
      : 0;

    container.innerHTML = `
      <section class="profile-hero">
        <div>
          <p class="eyebrow">Perfil ${escapeHtml(user.type)}</p>
          <h2>${escapeHtml(user.name)}</h2>
          <p>${escapeHtml(user.email)}</p>
        </div>
        <a class="primary-link" href="Bitacademy.html#disciplinas">Continuar estudando</a>
      </section>
      <section class="profile-dashboard">
        <div class="profile-summary">
          <article><span>Quizzes feitos</span><strong>${results.length}</strong></article>
          <article><span>Média geral</span><strong>${average}%</strong></article>
          <article><span>Melhor resultado</span><strong>${bestPercent}%</strong></article>
          <article><span>Recorde infinito</span><strong>${bestGameScore}</strong></article>
        </div>
        <div class="profile-next-step">
          <p class="eyebrow">Próximo passo</p>
          <h2>${results.length ? "Revise uma nova disciplina" : "Faça seu primeiro quiz"}</h2>
          <p>${results.length ? "Escolha outra matéria para ampliar seu histórico de desempenho." : "Ao finalizar um quiz logado, o resultado aparece automaticamente aqui."}</p>
          <a class="secondary-link" href="Jogos/matematica-infinita.html">Jogar modo infinito</a>
        </div>
      </section>
      <section>
        <h2>Histórico de quizzes</h2>
        ${results.length ? `<div class="result-list">${results.map((result) => `
          <article><div><strong>${escapeHtml(result.titulo)}</strong><span>${new Date(result.date).toLocaleDateString("pt-BR")}</span></div><b>${result.score}/${result.total} (${result.percent}%)</b></article>
        `).join("")}</div>` : '<p>Você ainda não concluiu nenhum quiz. Escolha uma disciplina e comece quando quiser.</p>'}
      </section>
    `;
  };

  const bindLoginPage = () => {
    const tabs = document.querySelectorAll("[data-auth-tab]");
    const panels = document.querySelectorAll("[data-auth-panel]");
    const message = document.querySelector("[data-auth-message]");

    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authTab === target));
      panels.forEach((panel) => panel.hidden = panel.dataset.authPanel !== target);
      if (message) message.textContent = "";
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.authTab)));

    document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        await login({ email: form.email.value, password: form.senha.value });
        window.location.href = "perfil.html";
      } catch (error) {
        if (message) message.textContent = error.message;
      }
    });

    document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        await register({
          name: form.nome.value,
          email: form.email.value,
          password: form.senha.value,
          type: form.tipo.value,
          materia: form.materia?.value || null
        });
        window.location.href = "perfil.html";
      } catch (error) {
        if (message) message.textContent = error.message;
      }
    });
  };

  const bindHomeTabs = () => {
    const tabs = document.querySelectorAll("[data-home-tab]");
    const panels = document.querySelectorAll("[data-home-panel]");
    if (!tabs.length || !panels.length) return;
    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.homeTab === target));
      panels.forEach((panel) => {
        const active = panel.dataset.homePanel === target;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
      });
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.homeTab)));
  };

  const bindSubjectExperience = () => {
    const page = document.body;
    if (!page.classList.contains("subject-page")) return;
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    const main = document.querySelector("main");
    const intro = document.getElementById("introducao");
    if (!header || !nav || !main || !intro) return;

    const title = page.dataset.subjectTitle || "Disciplina";
    const icon = page.dataset.subjectIcon || "📘";
    const area = page.dataset.subjectArea || "Trilha de estudo";
    const accent = page.dataset.subjectAccent || "#6366f1";
    const quizHref = page.dataset.subjectQuiz || "#";
    const topicLinks = Array.from(nav.querySelectorAll("a[href^='#']")).slice(0, 3);
    const firstTopicHref = topicLinks[0]?.getAttribute("href") || "#introducao";

    page.style.setProperty("--subject-accent", accent);
    header.classList.add("subject-hero");
    nav.classList.add("subject-nav");
    main.classList.add("subject-main");
    nav.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("|")) node.textContent = " ";
    });

    if (!header.querySelector(".subject-visual")) {
      header.insertAdjacentHTML("beforeend", `
        <div class="subject-visual" aria-hidden="true">
          <div class="visual-card main"><span>${icon}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(area)}</small></div>
          <div class="visual-card mini top">${topicLinks[0] ? escapeHtml(topicLinks[0].textContent) : "Conceitos"}</div>
          <div class="visual-card mini middle">${topicLinks[1] ? escapeHtml(topicLinks[1].textContent) : "Exemplos"}</div>
          <div class="visual-card mini bottom">${topicLinks[2] ? escapeHtml(topicLinks[2].textContent) : "Prática"}</div>
        </div>
      `);
    }

    if (!document.querySelector(".subject-path")) {
      intro.insertAdjacentHTML("afterend", `
        <section class="subject-path" aria-label="Trilha sugerida">
          <article><span>1</span><div><strong>Entenda a base</strong><p>Leia a introdução para saber por que esta matéria importa.</p></div><a href="#introducao">Abrir</a></article>
          <article><span>2</span><div><strong>Explore os tópicos</strong><p>Avance pelos assuntos principais em uma ordem mais clara.</p></div><a href="${firstTopicHref}">Ver tópicos</a></article>
          <article><span>3</span><div><strong>Pratique</strong><p>Finalize com quiz ou jogo para testar sua retenção.</p></div><a href="${quizHref}">Praticar</a></article>
        </section>
      `);
    }

    Array.from(main.querySelectorAll("section")).forEach((section) => {
      const special = section.classList.contains("subject-path") || section.classList.contains("math-game-callout");
      if (section.id !== "introducao" && !special) section.classList.add("subject-topic");
    });
  };

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-auth-logout]")) logout();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    await ready;
    bindLoginPage();
    bindHomeTabs();
    bindSubjectExperience();
    renderAuthStatus();
    await renderProfile();
  });

  return {
    ready,
    getCurrentUser,
    getGameRanking,
    getProgress,
    getQuizRanking,
    recordGameScore,
    login,
    logout,
    recordQuizResult,
    register,
    getUserGameScores
  };
})();
