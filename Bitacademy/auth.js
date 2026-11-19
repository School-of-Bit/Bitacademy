window.BitAcademyAuth = (() => {
  let currentUser = null;
  let profileData = null;

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const getRelativePrefix = () => {
    const path = window.location.pathname;
    return path.includes("/Quiz/") || path.includes("/Jogos/") ? "../" : "";
  };
  const escapeHtml = (value) => String(value ?? "")
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

  const register = async ({ name, email, password }) => {
    const data = await api("auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(name || "").trim(),
        email: normalize(email),
        password
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

  const recordQuizResult = async ({ materia, answers }) => {
    const data = await api("quizzes?action=result", {
      method: "POST",
      body: JSON.stringify({ materia, answers })
    });
    return data.result;
  };

  const getQuizRanking = async (materia, limit = 10) => {
    const params = new URLSearchParams({ materia, limit: String(limit) });
    const data = await api(`quizzes?action=ranking&${params}`);
    return data.ranking || [];
  };

  const getProgress = async () => {
    if (!currentUser) return [];
    if (!profileData) {
      profileData = await api("profile");
    }
    return profileData.quizResults || [];
  };

  const startGame = async () => {
    return api("games?action=start", {
      method: "POST",
      body: JSON.stringify({ mode: "math-infinite" })
    });
  };

  const submitGameAnswer = async ({ sessionId, answer, revision }) => {
    return api("games?action=answer", {
      method: "POST",
      body: JSON.stringify({ sessionId, answer, revision })
    });
  };

  const finishGame = async (sessionId) => {
    return api("games?action=finish", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const abortGame = async (sessionId) => {
    return api("games?action=abort", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const getGameRanking = async (mode, limit = 10) => {
    const params = new URLSearchParams({ mode, limit: String(limit) });
    const data = await api(`games?action=ranking&${params}`);
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
      const areaByRole = {
        Professor: { href: "professor.html", label: "Área do Professor" },
        Administrador: { href: "admin.html", label: "Painel Admin" }
      };
      const roleArea = areaByRole[user.type];
      const currentPage = window.location.pathname.split("/").pop().toLowerCase();
      const areaLink = roleArea && currentPage !== roleArea.href
        ? `<a class="auth-role-link" href="${prefix}${roleArea.href}">${roleArea.label}</a>`
        : "";
      container.innerHTML = `
        <a class="auth-user-pill" href="${prefix}perfil.html">
          <span>Olá, ${firstName}</span>
          <span class="auth-role-badge">${escapeHtml(user.type)}</span>
        </a>
        ${areaLink}
        <button type="button" data-auth-logout>Sair</button>
      `;
    });
  };

  const renderProfile = async (activeTab = "resumo") => {
    const container = document.querySelector("[data-profile]");
    if (!container) return;

    await ready;
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.type === "Administrador") {
      container.innerHTML = `
        <section class="profile-hero">
          <div>
            <p class="eyebrow">Perfil Administrador</p>
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.email)}</p>
          </div>
          <a class="primary-link" href="admin.html">Abrir painel administrativo</a>
        </section>
        <section class="profile-card-section">
          <p class="eyebrow">Gestão da plataforma</p>
          <h2>Administração BitAcademy</h2>
          <p>Gerencie contas de usuários, professores, catálogo de disciplinas, anos letivos, turmas, matrículas e recursos interativos.</p>
          <div class="intro-actions" style="margin-top: 16px;">
            <a class="primary-link" href="admin.html">Ir para Administração</a>
            <a class="secondary-link" href="Bitacademy.html#disciplinas">Ver catálogo público</a>
          </div>
        </section>
      `;
      return;
    }

    if (user.type === "Professor") {
      const subjects = Array.isArray(user.subjects) ? user.subjects : [];
      container.innerHTML = `
        <section class="profile-hero">
          <div>
            <p class="eyebrow">Perfil Professor</p>
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.email)}</p>
          </div>
          <a class="primary-link" href="professor.html">Abrir Área do Professor</a>
        </section>
        <section class="profile-card-section">
          <p class="eyebrow">Gestão acadêmica</p>
          <h2>${subjects.length} ${subjects.length === 1 ? "disciplina vinculada" : "disciplinas vinculadas"}</h2>
          <p>${subjects.length ? subjects.map((subject) => escapeHtml(subject.name)).join(" · ") : "Aguarde o administrador vincular disciplinas à sua conta."}</p>
          <div class="intro-actions" style="margin-top: 16px;">
            <a class="primary-link" href="professor.html">Gerenciar materiais, atividades e boletim</a>
          </div>
        </section>
      `;
      return;
    }

    try {
      profileData = await api("profile");
    } catch (error) {
      container.innerHTML = `<section class="profile-card-section"><p>${escapeHtml(error.message)}</p></section>`;
      return;
    }

    const results = profileData.quizResults || [];
    const gameScores = profileData.gameScores || [];
    let availableActivities = [];
    let activitiesError = "";
    try {
      const activityData = await api("academic?action=student-activities");
      availableActivities = activityData.activities || [];
    } catch (error) { activitiesError = error.message; }
    let gradeReports = [];
    let gradeReportError = "";
    try {
      const gradeData = await api("gradebook?action=report");
      gradeReports = gradeData.reports || [];
    } catch (error) { gradeReportError = error.message; }
    const bestPercent = results.length ? Math.max(...results.map((result) => result.percent)) : 0;
    const bestGameScore = gameScores.length ? Math.max(...gameScores.map((result) => result.score)) : 0;
    const average = results.length
      ? Math.round(results.reduce((sum, result) => sum + result.percent, 0) / results.length)
      : 0;

    const statusBadgeForReport = (report) => {
      if (report.finalScore === null) {
        return `<span class="grade-status-badge in_progress">Em curso</span>`;
      }
      if (report.result === "passed") {
        return `<span class="grade-status-badge passed">Aprovado</span>`;
      }
      if (report.result === "recovery_pending") {
        return `<span class="grade-status-badge recovery_pending">Recuperação final pendente</span>`;
      }
      return `<span class="grade-status-badge not_passed">Não aprovado</span>`;
    };

    container.innerHTML = `
      <section class="profile-hero">
        <div>
          <p class="eyebrow">Perfil ${escapeHtml(user.type)}</p>
          <h2>${escapeHtml(user.name)}</h2>
          <p>${escapeHtml(user.email)}</p>
        </div>
        <div class="intro-actions">
          <a class="primary-link" href="Bitacademy.html#disciplinas">Continuar estudando</a>
          <a class="secondary-link" href="Jogos/matematica-infinita.html">Jogar Matemática Infinita</a>
        </div>
      </section>

      <nav class="profile-tabs" role="tablist" aria-label="Seções do perfil do estudante">
        <button type="button" class="active" data-profile-tab="resumo">Visão Geral &amp; Recordes</button>
        <button type="button" data-profile-tab="boletim">Boletim Escolar (${gradeReports.length})</button>
        <button type="button" data-profile-tab="atividades">Atividades (${availableActivities.length})</button>
      </nav>

      <section class="profile-tab-panel" data-profile-panel="resumo">
        <div class="profile-dashboard">
          <div class="profile-summary">
            <article><span>Disciplinas com recorde</span><strong>${results.length}</strong></article>
            <article><span>Média nos quizzes</span><strong>${average}%</strong></article>
            <article><span>Melhor desempenho</span><strong>${bestPercent}%</strong></article>
            <article><span>Recorde Matemática Infinita</span><strong>${bestGameScore}</strong></article>
          </div>
          <div class="profile-next-step">
            <div>
              <p class="eyebrow">Próximo passo</p>
              <h2>${results.length ? "Supere seus recordes" : "Faça seu primeiro quiz"}</h2>
              <p>${results.length ? "Seus melhores resultados por disciplina ficam registrados aqui e contam para o ranking oficial." : "Ao finalizar qualquer quiz conectado à sua conta, sua maior pontuação aparece automaticamente aqui."}</p>
            </div>
            <a class="primary-link" href="Bitacademy.html#quizzes">Ir para Arena de Prática</a>
          </div>
        </div>

        <div class="profile-card-section" style="margin-top: 24px;">
          <p class="eyebrow">Histórico gamificado</p>
          <h2>Melhores resultados por disciplina</h2>
          ${results.length ? `<div class="result-list" style="margin-top: 14px;">${results.map((result) => `
            <article>
              <div>
                <strong>${escapeHtml(result.titulo)}</strong>
                <span>Registrado em ${new Date(result.date).toLocaleDateString("pt-BR")}</span>
              </div>
              <b>${result.score}/${result.total} (${result.percent}%)</b>
            </article>
          `).join("")}</div>` : '<p>Você ainda não concluiu nenhum quiz. Escolha uma disciplina e comece quando quiser.</p>'}
        </div>
      </section>

      <section class="profile-tab-panel profile-card-section" data-profile-panel="boletim" hidden>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
          <div>
            <p class="eyebrow">Vida escolar</p>
            <h2>Boletim Acadêmico</h2>
            <p style="margin: 4px 0 0;">Acompanhe suas médias por período, notas de componentes avaliativos e situação anual em cada disciplina.</p>
          </div>
          ${gradeReports.length ? `<button type="button" class="btn-subtle no-print" data-print-gradebook>🖨️ Imprimir / Salvar Boletim PDF</button>` : ""}
        </div>
        <div class="gradebook-reports">
          ${gradeReportError ? `<p>${escapeHtml(gradeReportError)}</p>` : gradeReports.length ? gradeReports.map((report) => {
            const displayScore = report.finalScore !== null ? report.finalScore : report.annualAverage;
            const meterWidth = displayScore !== null ? Math.min(100, Math.max(0, displayScore * 10)) : 0;
            return `
              <article class="gradebook-report-card">
                <div class="gradebook-report-heading">
                  <div>
                    <strong>${escapeHtml(report.subject)}</strong>
                    <span>${escapeHtml(report.className)} · Ano letivo ${escapeHtml(report.year)} · Média mínima ${escapeHtml(report.passingScore)}/10</span>
                  </div>
                  <div class="grade-status-group">
                    <b class="grade-score-pill">${report.finalScore === null ? `Média parcial: ${report.annualAverage === null ? "—" : `${report.annualAverage.toFixed(2)}/10`}` : `Final: ${report.finalScore.toFixed(2)}/10`}</b>
                    ${statusBadgeForReport(report)}
                  </div>
                </div>
                <div class="grade-meter" aria-hidden="true"><div class="grade-meter-fill" style="width: ${meterWidth}%"></div></div>
                ${report.finalRecovery !== null ? `<p style="margin-top: 10px;">Nota de recuperação final: <strong>${report.finalRecovery.toFixed(2)}/10</strong> · Política: ${escapeHtml(report.finalRecoveryPolicy === "higher" ? "maior nota" : "média")}</p>` : ""}
                <div class="gradebook-period-list">
                  ${report.periods.map((period) => `
                    <section>
                      <div class="gradebook-period-heading">
                        <strong>${escapeHtml(period.sequence)}. ${escapeHtml(period.name)}</strong>
                        <span>Peso ${escapeHtml(period.weight)} · ${period.average === null ? "Sem média fechada" : `Média: ${period.average.toFixed(2)}/10`}</span>
                      </div>
                      <div class="gradebook-component-list">
                        ${period.components.map((component) => `
                          <section>
                            <div class="gradebook-period-heading">
                              <strong>${escapeHtml(component.name)}</strong>
                              <span>Peso ${escapeHtml(component.weight)}% · ${component.average === null ? "Sem média" : `${component.average.toFixed(2)}/10`}${component.pendingCount > 0 ? ` (parcial · ${component.pendingCount} pendente${component.pendingCount > 1 ? "s" : ""})` : ""}</span>
                            </div>
                            <div class="gradebook-assessment-list">
                              ${component.assessments.map((assessment) => `
                                <div>
                                  <span>${escapeHtml(assessment.title)} · peso interno ${escapeHtml(assessment.weight)}</span>
                                  <b>${assessment.gradeStatus === "excused" ? "Dispensado" : assessment.score === null ? "Aguardando nota" : `${assessment.score.toFixed(2)}/10`}</b>
                                  ${assessment.feedback ? `<small>💬 Feedback: ${escapeHtml(assessment.feedback)}</small>` : ""}
                                </div>
                              `).join("")}
                            </div>
                          </section>
                        `).join("")}
                        ${period.recovery !== null ? `<div class="gradebook-assessment-list"><div><span>Recuperação do período</span><b>${period.recovery.toFixed(2)}/10</b></div></div>` : ""}
                      </div>
                    </section>
                  `).join("")}
                </div>
              </article>
            `;
          }).join("") : '<p>Seu boletim aparecerá aqui quando sua matrícula e suas disciplinas forem configuradas pela escola.</p>'}
        </div>
      </section>

      <section class="profile-tab-panel profile-card-section" data-profile-panel="atividades" hidden>
        <p class="eyebrow">Tarefas &amp; Trabalhos</p>
        <h2>Atividades &amp; Entregas</h2>
        <p style="margin-bottom: 20px;">Confira as orientações publicadas pelos seus professores, envie seus trabalhos e acompanhe correções e notas integradas ao boletim.</p>
        ${activitiesError ? `<p class="form-feedback error">${escapeHtml(activitiesError)}</p>` : availableActivities.length ? `
          <div class="activity-student-grid">
            ${availableActivities.map((activity) => {
              const isGraded = activity.submission_status === "graded";
              const isSubmitted = activity.submission_status === "submitted";
              const isPending = !isGraded && !isSubmitted;

              let statusBadge = "";
              if (isGraded) {
                statusBadge = `<span class="submission-badge graded">✓ Avaliada</span>`;
              } else if (isSubmitted) {
                statusBadge = `<span class="submission-badge submitted">⏳ Entregue</span>`;
              } else {
                statusBadge = `<span class="submission-badge pending">⚠️ Pendente</span>`;
              }

              const formattedDue = activity.due_at ? new Date(activity.due_at).toLocaleDateString("pt-BR") : "Sem prazo fixo";
              const isOverdue = activity.due_at && new Date(activity.due_at) < new Date() && isPending;

              return `
                <article class="activity-student-card ${isOverdue ? 'overdue' : ''}">
                  <header class="activity-card-header">
                    <div>
                      <div class="activity-pill-tags">
                        <span class="pill-tag">${escapeHtml(activity.subject_name)}</span>
                        <span class="pill-tag subtle">Prof. ${escapeHtml(activity.teacher_name)}</span>
                        ${activity.assessment_id ? `<span class="pill-tag gradebook-badge">📊 Boletim Oficial</span>` : ""}
                        ${activity.activity_type === "automatic" ? `<span class="pill-tag auto-badge">⚡ Automática</span>` : ""}
                      </div>
                      <h3 class="activity-card-title">${escapeHtml(activity.title)}</h3>
                    </div>
                    <div class="activity-card-header-status">
                      ${statusBadge}
                      <span class="activity-due-text ${isOverdue ? 'text-danger' : ''}">${isOverdue ? '⚠️ Expirou em: ' : 'Prazo: '}${formattedDue}</span>
                    </div>
                  </header>

                  <div class="activity-card-description">
                    <p>${escapeHtml(activity.description)}</p>
                  </div>

                  <div class="activity-submission-zone">
                    ${isGraded ? `
                      <div class="submission-graded-box">
                        <div class="submission-score-row">
                          <div>
                            <span class="submission-score-label">Nota atribuída pelo professor:</span>
                            <div class="submission-score-value">
                              <strong>${Number(activity.submission_score).toFixed(2)}</strong> <span class="max-score">/ ${activity.assessment_id ? '10.00' : `${activity.max_score} pts`}</span>
                            </div>
                          </div>
                          ${activity.graded_at ? `<span class="submission-graded-date">Avaliado em ${new Date(activity.graded_at).toLocaleDateString("pt-BR")}</span>` : ""}
                        </div>
                        ${activity.submission_feedback ? `
                          <div class="submission-feedback-quote">
                            <span class="feedback-icon">💬</span>
                            <div>
                              <strong>Comentário &amp; Orientações:</strong>
                              <p>${escapeHtml(activity.submission_feedback)}</p>
                            </div>
                          </div>
                        ` : ""}
                        <div class="submission-records">
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link entregue:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} ↗</a></p>` : ""}
                          ${activity.submission_content ? `<div class="submission-record-content"><strong>Conteúdo entregue:</strong><pre class="submission-content-box">${escapeHtml(activity.submission_content)}</pre></div>` : ""}
                        </div>
                      </div>
                    ` : isSubmitted ? `
                      <div class="submission-submitted-box">
                        <div class="submission-submitted-header">
                          <p><strong>Trabalho entregue com sucesso!</strong> Aguardando avaliação do professor.</p>
                          ${activity.submitted_at ? `<span class="submitted-timestamp">Envio: ${new Date(activity.submitted_at).toLocaleString("pt-BR")}</span>` : ""}
                        </div>
                        <div class="submission-records">
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link enviado:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} ↗</a></p>` : ""}
                          ${activity.submission_content ? `<div class="submission-record-content"><strong>Texto/Resposta:</strong><pre class="submission-content-box">${escapeHtml(activity.submission_content)}</pre></div>` : ""}
                        </div>
                        ${activity.period_status === "closed" ? `
                          <p style="margin-top: 10px; font-size: 0.85rem; color: var(--cor-subtexto);">🔒 O período avaliativo já foi encerrado.</p>
                        ` : `
                          <div style="margin-top: 14px;">
                            <button type="button" class="btn-subtle" data-toggle-submission="${activity.id}">✏️ Atualizar ou reenviar trabalho</button>
                          </div>
                          <div data-submission-form-container="${activity.id}" style="display: none; margin-top: 14px;">
                            <form class="activity-submit-form" data-activity-submit-form data-activity-id="${activity.id}">
                              <label>
                                <span>Atualizar texto ou anotações</span>
                                <textarea name="content" rows="3" placeholder="Escreva sua resposta ou considerações...">${escapeHtml(activity.submission_content || "")}</textarea>
                              </label>
                              <label>
                                <span>Atualizar link do trabalho (Google Drive, GitHub, Notion, etc.)</span>
                                <input type="url" name="link" value="${escapeHtml(activity.submission_link || "")}" placeholder="https://..." />
                              </label>
                              <div class="form-feedback" data-submission-msg></div>
                              <div class="form-actions-inline">
                                <button type="submit" class="primary-button small">Salvar Nova Versão</button>
                              </div>
                            </form>
                          </div>
                        `}
                      </div>
                    ` : activity.period_status === "closed" ? `
                      <div class="submission-pending-box">
                        <p class="submission-pending-prompt" style="margin: 0; color: var(--cor-subtexto);">🔒 O período avaliativo desta atividade foi encerrado sem entrega registrada.</p>
                      </div>
                    ` : `
                      <div class="submission-pending-box">
                        ${activity.activity_type === "automatic" ? `
                          <div style="margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                            <strong style="color: #fbbf24; display: block; margin-bottom: 4px;">⚡ Atividade com Correção Automática via Quiz</strong>
                            <p style="margin: 0 0 8px; font-size: 0.88rem; color: #e2e8f0;">Ao concluir o Quiz oficial de <strong>${escapeHtml(activity.subject_name)}</strong>, sua nota (0 a 10) é calculada e lançada automaticamente nesta atividade e no boletim!</p>
                            <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="primary-link" style="display: inline-block; padding: 6px 14px; font-size: 0.84rem;">Realizar Quiz de ${escapeHtml(activity.subject_name)} →</a>
                          </div>
                        ` : ""}
                        <p class="submission-pending-prompt">Envie sua resposta ou link do trabalho para avaliação:</p>
                        <form class="activity-submit-form" data-activity-submit-form data-activity-id="${activity.id}">
                          <label>
                            <span>Texto da resposta / Resolução</span>
                            <textarea name="content" rows="3" placeholder="Escreva aqui sua resposta, reflexão ou anotações..."></textarea>
                          </label>
                          <label>
                            <span>Link do trabalho externo (Google Docs/Drive, GitHub, PDF, etc.)</span>
                            <input type="url" name="link" placeholder="https://..." />
                          </label>
                          <div class="form-feedback" data-submission-msg></div>
                          <div class="form-actions-inline">
                            <button type="submit" class="primary-button small">Enviar Atividade</button>
                          </div>
                        </form>
                      </div>
                    `}
                  </div>

                  <footer class="activity-card-footer">
                    <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="card-link-muted">Ver material da disciplina →</a>
                    <span class="activity-points-pill">${escapeHtml(activity.max_score)} pts máx</span>
                  </footer>
                </article>
              `;
            }).join("")}
          </div>
        ` : '<p>Nenhuma atividade foi disponibilizada pelos professores até o momento.</p>'}
      </section>
    `;

    const profileTabs = container.querySelectorAll("[data-profile-tab]");
    const profilePanels = container.querySelectorAll("[data-profile-panel]");

    const switchTab = (target) => {
      profileTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.profileTab === target));
      profilePanels.forEach((panel) => {
        panel.hidden = panel.dataset.profilePanel !== target;
      });
    };

    switchTab(activeTab);

    profileTabs.forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.profileTab));
    });

    container.querySelector("[data-print-gradebook]")?.addEventListener("click", () => {
      window.print();
    });

    container.querySelectorAll("[data-activity-submit-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const activityId = form.dataset.activityId;
        const content = form.content ? form.content.value.trim() : "";
        const link = form.link ? form.link.value.trim() : "";
        const submitBtn = form.querySelector("button[type='submit']");
        const msgEl = form.querySelector("[data-submission-msg]");

        if (!content && !link) {
          if (msgEl) {
            msgEl.textContent = "Por favor, preencha ao menos uma resposta em texto ou informe um link.";
            msgEl.className = "form-feedback error";
          }
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";
          }
          if (msgEl) {
            msgEl.textContent = "";
            msgEl.className = "form-feedback";
          }

          await api("academic?action=submit-activity", {
            method: "POST",
            body: JSON.stringify({ activityId, content, link })
          });

          await renderProfile("atividades");
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Tentar novamente";
          }
          if (msgEl) {
            msgEl.textContent = err.message || "Erro ao enviar atividade.";
            msgEl.className = "form-feedback error";
          }
        }
      });
    });

    container.querySelectorAll("[data-toggle-submission]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggleSubmission;
        const target = container.querySelector(`[data-submission-form-container="${id}"]`);
        if (target) {
          const isHidden = target.style.display === "none";
          target.style.display = isHidden ? "block" : "none";
          btn.textContent = isHidden ? "✕ Cancelar edição" : "✏️ Atualizar ou reenviar trabalho";
        }
      });
    });
  };

  const bindLoginPage = () => {
    const tabs = document.querySelectorAll("[data-auth-tab]");
    const panels = document.querySelectorAll("[data-auth-panel]");
    const message = document.querySelector("[data-auth-message]");
    const recoveryNotice = document.querySelector("[data-recovery-notice]");

    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authTab === target));
      panels.forEach((panel) => panel.hidden = panel.dataset.authPanel !== target);
      if (message) message.textContent = "";
      if (recoveryNotice) recoveryNotice.hidden = true;
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.authTab)));
    document.querySelector("[data-forgot-password]")?.addEventListener("click", () => {
      if (recoveryNotice) recoveryNotice.hidden = !recoveryNotice.hidden;
      if (message) message.textContent = "";
    });
    document.querySelectorAll("[data-password-toggle]").forEach((button) => button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Ocultar" : "Mostrar";
      button.setAttribute("aria-label", `${show ? "Ocultar" : "Mostrar"} senha`);
    }));

    document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        const user = await login({ email: form.email.value, password: form.senha.value });
        window.location.href = user.type === "Administrador" ? "admin.html" : user.type === "Professor" ? "professor.html" : "perfil.html";
      } catch (error) {
        if (message) message.textContent = error.message;
      }
    });

    document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const password = form.senha.value;
      const confirmation = form.confirmaSenha.value;
      const strongPassword = password.length >= 8 && new TextEncoder().encode(password).length <= 72
        && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9À-ÿ]/.test(password);
      if (!strongPassword) {
        if (message) message.textContent = "A senha precisa ter 8 a 72 bytes e incluir maiúscula, minúscula, número e símbolo.";
        form.senha.focus();
        return;
      }
      if (password !== confirmation) {
        if (message) message.textContent = "As senhas não coincidem.";
        form.confirmaSenha.focus();
        return;
      }
      try {
        await register({
          name: form.nome.value,
          email: form.email.value,
          password
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

  const loadSubjectCatalog = async () => {
    const grid = document.querySelector("[data-subject-catalog]");
    if (!grid) return;
    const status = document.querySelector("[data-subject-catalog-status]");
    try {
      const data = await api("academic?action=subjects");
      const subjects = data.subjects || [];
      grid.innerHTML = subjects.length ? subjects.map((subject) => `
        <article class="subject-card" data-accent="${escapeHtml(subject.slug)}">
          <span class="subject-icon">${escapeHtml(subject.icon || "📘")}</span>
          <strong>${escapeHtml(subject.name)}</strong>
          <span>${escapeHtml(subject.description || "Conteúdos e materiais para estudar esta disciplina.")}</span>
          <a href="materia.html?slug=${encodeURIComponent(subject.slug)}">Estudar →</a>
        </article>
      `).join("") : '<p>Nenhuma disciplina disponível no momento.</p>';
      const count = document.querySelector("[data-overview-subjects], .home-overview article:first-child strong");
      if (count) count.textContent = subjects.length;
      if (status) status.textContent = `${subjects.length} disciplinas sincronizadas do catálogo.`;
    } catch (error) {
      if (status) status.textContent = "Exibindo as disciplinas disponíveis no portal.";
      console.warn("Não foi possível carregar o catálogo de disciplinas:", error.message);
    }
  };

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-auth-logout]")) logout();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    await ready;
    bindLoginPage();
    bindHomeTabs();
    renderAuthStatus();
    loadSubjectCatalog();
    await renderProfile();
  });

  return {
    ready,
    getCurrentUser,
    renderAuthStatus,
    getGameRanking,
    getProgress,
    getQuizRanking,
    startGame,
    submitGameAnswer,
    finishGame,
    abortGame,
    login,
    logout,
    recordQuizResult,
    register,
    getUserGameScores
  };
})();
