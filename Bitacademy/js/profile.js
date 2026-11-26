// Perfil e boletim: dependências recebidas do núcleo de autenticação.
window.createBitAcademyProfile = ({ api, ready, getCurrentUser, escapeHtml, setProfileData }) => {
  const renderProfile = async (activeTab = "resumo") => {
    let profileData;
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
          <div class="profile-user-identity">
            ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
            <div>
              <p class="eyebrow">Perfil Administrador</p>
              <h2>${escapeHtml(user.name)}</h2>
              <p>${escapeHtml(user.email)}</p>
            </div>
          </div>
          <a class="primary-link" href="admin.html"><i data-lucide="shield-check" data-lucide-size="17"></i> Abrir painel administrativo</a>
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
          <div class="profile-user-identity">
            ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
            <div>
              <p class="eyebrow">Perfil Professor</p>
              <h2>${escapeHtml(user.name)}</h2>
              <p>${escapeHtml(user.email)}</p>
            </div>
          </div>
          <a class="primary-link" href="professor.html"><i data-lucide="graduation-cap" data-lucide-size="17"></i> Abrir Área do Professor</a>
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
      setProfileData(profileData);
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
        <div class="profile-user-identity">
          ${window.BitAcademyIcons.avatar(user.name || user.email, 68, "profile-avatar-lg")}
          <div>
            <p class="eyebrow">Perfil ${escapeHtml(user.type)}</p>
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.email)}</p>
          </div>
        </div>
        <div class="intro-actions">
          <a class="primary-link" href="Bitacademy.html#disciplinas"><i data-lucide="book-open" data-lucide-size="17"></i> Continuar estudando</a>
          <a class="secondary-link" href="Bitacademy.html#quizzes"><i data-lucide="gamepad-2" data-lucide-size="17"></i> Arena de Jogos</a>
        </div>
      </section>

      <nav class="profile-tabs" role="tablist" aria-label="Seções do perfil do estudante">
        <button type="button" class="active" data-profile-tab="resumo"><i data-lucide="award" data-lucide-size="17"></i> Visão Geral &amp; Recordes</button>
        <button type="button" data-profile-tab="boletim"><i data-lucide="file-spreadsheet" data-lucide-size="17"></i> Boletim Escolar (${gradeReports.length})</button>
        <button type="button" data-profile-tab="atividades"><i data-lucide="clipboard-list" data-lucide-size="17"></i> Atividades (${availableActivities.length})</button>
      </nav>

      <section class="profile-tab-panel" data-profile-panel="resumo">
        <div class="profile-dashboard">
          <div class="profile-summary">
            <article><span><i data-lucide="book-marked" data-lucide-size="16"></i> Disciplinas com recorde</span><strong>${results.length}</strong></article>
            <article><span><i data-lucide="target" data-lucide-size="16"></i> Média nos quizzes</span><strong>${average}%</strong></article>
            <article><span><i data-lucide="trophy" data-lucide-size="16"></i> Melhor desempenho</span><strong>${bestPercent}%</strong></article>
            <article><span><i data-lucide="zap" data-lucide-size="16"></i> Maior recorde nos jogos</span><strong>${bestGameScore}</strong></article>
          </div>
          <div class="profile-next-step">
            <div>
              <p class="eyebrow">Próximo passo</p>
              <h2>${results.length ? "Supere seus recordes" : "Faça seu primeiro quiz"}</h2>
              <p>${results.length ? "Seus melhores resultados nos quizzes e jogos ficam registrados aqui e contam para o ranking oficial." : "Ao finalizar um quiz ou Matemática Infinita conectado à sua conta, seu recorde aparece aqui."}</p>
            </div>
            <a class="primary-link" href="Bitacademy.html#quizzes"><i data-lucide="gamepad-2" data-lucide-size="18"></i> Ir para Arena de Prática</a>
          </div>
        </div>

        <div class="profile-card-section" style="margin-top: 24px;">
          <p class="eyebrow">Arena de Jogos</p>
          <h2>Recordes nos jogos educativos</h2>
          ${gameScores.length ? `<div class="result-list" style="margin-top: 14px;">${gameScores.map((g) => `
            <article>
              <div>
                <strong>${escapeHtml(g.title)}</strong>
                <span>${g.correct} acerto(s) · melhor combo ${g.bestStreak} · ${new Date(g.date).toLocaleDateString("pt-BR")}</span>
              </div>
              <b>${g.score} pts</b>
            </article>
          `).join("")}</div>` : '<p>Você ainda não registrou recordes nos jogos. Acesse a Arena de Prática para jogar e entrar no ranking oficial!</p>'}
        </div>

        <div class="profile-card-section" style="margin-top: 24px;">
          <p class="eyebrow">Histórico gamificado</p>
          <h2>Melhores resultados por disciplina (Quizzes)</h2>
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
          ${gradeReports.length ? `<button type="button" class="btn-subtle no-print" data-print-gradebook><i data-lucide="printer" data-lucide-size="16"></i> Imprimir / Salvar Boletim PDF</button>` : ""}
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
                                  ${assessment.feedback ? `<small><i data-lucide="message-square" data-lucide-size="14"></i> Feedback: ${escapeHtml(assessment.feedback)}</small>` : ""}
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

              let statusBadge = "";
              if (isGraded) {
                statusBadge = `<span class="submission-badge graded"><i data-lucide="check-circle-2" data-lucide-size="15"></i> Avaliada</span>`;
              } else if (isSubmitted) {
                statusBadge = `<span class="submission-badge submitted"><i data-lucide="clock" data-lucide-size="15"></i> Entregue</span>`;
              } else {
                statusBadge = `<span class="submission-badge pending"><i data-lucide="alert-circle" data-lucide-size="15"></i> Pendente</span>`;
              }

              const formattedDue = activity.due_at ? new Date(activity.due_at).toLocaleString("pt-BR") : "Sem prazo fixo";
              const isOverdue = Boolean(activity.due_at && new Date(activity.due_at) <= new Date());

              return `
                <article class="activity-student-card ${isOverdue ? 'overdue' : ''}">
                  <header class="activity-card-header">
                    <div>
                      <div class="activity-pill-tags">
                        <span class="pill-tag">${escapeHtml(activity.subject_name)}</span>
                        <span class="pill-tag subtle">Prof. ${escapeHtml(activity.teacher_name)}</span>
                        ${activity.assessment_id ? `<span class="pill-tag gradebook-badge"><i data-lucide="bar-chart-3" data-lucide-size="14"></i> Boletim Oficial</span>` : ""}
                        ${activity.activity_type === "automatic" ? `<span class="pill-tag auto-badge"><i data-lucide="zap" data-lucide-size="14"></i> Automática</span>` : ""}
                      </div>
                      <h3 class="activity-card-title">${escapeHtml(activity.title)}</h3>
                    </div>
                    <div class="activity-card-header-status">
                      ${statusBadge}
                      <span class="activity-due-text ${isOverdue ? 'text-danger' : ''}"><i data-lucide="calendar" data-lucide-size="13"></i> ${isOverdue ? 'Expirou em: ' : 'Prazo: '}${formattedDue}</span>
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
                            <span class="feedback-icon"><i data-lucide="message-square" data-lucide-size="18"></i></span>
                            <div>
                              <strong>Comentário &amp; Orientações:</strong>
                              <p>${escapeHtml(activity.submission_feedback)}</p>
                            </div>
                          </div>
                        ` : ""}
                        <div class="submission-records">
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link entregue:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} <i data-lucide="external-link" data-lucide-size="13"></i></a></p>` : ""}
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
                          ${activity.submission_link ? `<p class="submission-record-link"><strong>Link enviado:</strong> <a href="${escapeHtml(activity.submission_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(activity.submission_link)} <i data-lucide="external-link" data-lucide-size="13"></i></a></p>` : ""}
                          ${activity.submission_content ? `<div class="submission-record-content"><strong>Texto/Resposta:</strong><pre class="submission-content-box">${escapeHtml(activity.submission_content)}</pre></div>` : ""}
                        </div>
                        ${(activity.period_status === "closed" || isOverdue) ? `
                          <p style="margin-top: 10px; font-size: 0.85rem; color: var(--cor-subtexto);"><i data-lucide="lock" data-lucide-size="14"></i> O prazo ou período avaliativo já foi encerrado.</p>
                        ` : `
                          <div style="margin-top: 14px;">
                            <button type="button" class="btn-subtle" data-toggle-submission="${activity.id}"><i data-lucide="pencil" data-lucide-size="14"></i> Atualizar ou reenviar trabalho</button>
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
                                <button type="submit" class="primary-button small"><i data-lucide="send" data-lucide-size="14"></i> Salvar Nova Versão</button>
                              </div>
                            </form>
                          </div>
                        `}
                      </div>
                    ` : (activity.period_status === "closed" || isOverdue) ? `
                      <div class="submission-pending-box">
                        <p class="submission-pending-prompt" style="margin: 0; color: var(--cor-subtexto);"><i data-lucide="lock" data-lucide-size="14"></i> O prazo ou período avaliativo desta atividade foi encerrado sem entrega registrada.</p>
                      </div>
                    ` : `
                      <div class="submission-pending-box">
                        ${activity.activity_type === "automatic" ? `
                          <div style="margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                            <strong style="color: #fbbf24; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><i data-lucide="zap" data-lucide-size="16"></i> Atividade com Correção Automática via Quiz</strong>
                            <p style="margin: 0 0 8px; font-size: 0.88rem; color: #e2e8f0;">Ao concluir o Quiz oficial de <strong>${escapeHtml(activity.subject_name)}</strong>, sua nota (0 a 10) é calculada e lançada automaticamente nesta atividade e no boletim!</p>
                            <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="primary-link" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.84rem;">Realizar Quiz de ${escapeHtml(activity.subject_name)} <i data-lucide="arrow-right" data-lucide-size="14"></i></a>
                          </div>
                        ` : ""}
                        ${activity.activity_type !== "automatic" ? `<p class="submission-pending-prompt">Envie sua resposta ou link do trabalho para avaliação:</p>
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
                            <button type="submit" class="primary-button small"><i data-lucide="send" data-lucide-size="14"></i> Enviar Atividade</button>
                          </div>
                        </form>` : ""}
                      </div>
                    `}
                  </div>

                  <footer class="activity-card-footer">
                    <a href="materia.html?slug=${encodeURIComponent(activity.subject_slug)}" class="card-link-muted">Ver material da disciplina <i data-lucide="arrow-right" data-lucide-size="14"></i></a>
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

    const animateProfileTab = (target) => {
      const M = window.BitAcademyMotion;
      if (!M) return;
      const activePanel = container.querySelector(`[data-profile-panel="${target}"]`);
      if (!activePanel) return;
      M.panelIn(activePanel);
      if (target === "resumo") {
        M.staggerCards(activePanel, ".profile-summary article", { stagger: 0.06, y: 14 });
        M.staggerCards(activePanel, ".result-list article", { stagger: 0.05, y: 14 });
        const summaryNums = activePanel.querySelectorAll(".profile-summary strong");
        if (summaryNums[0]) M.countUp(summaryNums[0], results.length);
        if (summaryNums[1]) M.countUp(summaryNums[1], average, { suffix: "%" });
        if (summaryNums[2]) M.countUp(summaryNums[2], bestPercent, { suffix: "%" });
        if (summaryNums[3]) M.countUp(summaryNums[3], bestGameScore);
      } else if (target === "boletim") {
        M.staggerCards(activePanel, ".gradebook-report-card", { stagger: 0.07, y: 18 });
        M.animateMeters(activePanel);
      } else if (target === "atividades") {
        M.staggerCards(activePanel, ".activity-student-card", { stagger: 0.065, y: 18 });
      }
    };

    const switchTab = (target) => {
      profileTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.profileTab === target));
      profilePanels.forEach((panel) => {
        panel.hidden = panel.dataset.profilePanel !== target;
      });
      animateProfileTab(target);
    };

    window.BitAcademyMotion?.panelIn(container.querySelector(".profile-hero"));
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
          window.BitAcademyMotion?.shake(form);
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
          window.BitAcademyMotion?.shake(form);
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
          if (isHidden) window.BitAcademyMotion?.drawerIn(target);
          btn.innerHTML = isHidden
            ? '<i data-lucide="x" data-lucide-size="14"></i> Cancelar edição'
            : '<i data-lucide="pencil" data-lucide-size="14"></i> Atualizar ou reenviar trabalho';
        }
      });
    });
  };


  return renderProfile;
};
