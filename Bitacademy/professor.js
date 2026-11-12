(() => {
  const panel = document.querySelector("[data-teacher-panel]");
  if (!panel) return;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const api = async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível concluir a operação.");
    }

    return data;
  };

  const formatDate = (value) => {
    if (!value) return "Sem prazo";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  const showMessage = (element, message, type = "error") => {
    if (!element) return;
    element.textContent = message;
    element.className = `teacher-message ${type}`;
  };

  const render = async () => {
    await window.BitAcademyAuth.ready;
    const user = window.BitAcademyAuth.getCurrentUser();

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.type !== "Professor") {
      panel.innerHTML = `
        <section class="teacher-empty">
          <span class="teacher-icon">🔒</span>
          <h2>Área restrita</h2>
          <p>Esta página está disponível somente para contas de professor.</p>
          <a class="teacher-button" href="perfil.html">Voltar ao perfil</a>
        </section>
      `;
      return;
    }

    const teacherName = document.querySelector("[data-teacher-user]");
    if (teacherName) teacherName.textContent = user.name;

    const subjects = Array.isArray(user.subjects) ? user.subjects : [];

    const subjectCards = subjects.length
      ? subjects.map((subject) => `
          <article class="subject-card">
            <div class="subject-card-icon">📚</div>
            <div class="subject-card-content">
              <span class="teacher-label">Disciplina vinculada</span>
              <h3>${escapeHtml(subject.name)}</h3>
              <p>Gerencie materiais de estudo, rascunhos e atividades avaliativas desta disciplina.</p>
              <div class="subject-actions">
                <button type="button" class="teacher-button" data-subject-action="${escapeHtml(subject.slug)}">Gerenciar disciplina</button>
                <a class="teacher-button secondary" href="materia.html?slug=${encodeURIComponent(subject.slug)}">Ver página pública ↗</a>
              </div>
            </div>
          </article>
        `).join("")
      : `
        <section class="teacher-empty" style="grid-column: 1 / -1;">
          <span class="teacher-icon">📚</span>
          <h2>Nenhuma disciplina vinculada</h2>
          <p>Sua conta de professor ainda não possui uma disciplina associada. Solicite o vínculo ao administrador.</p>
        </section>
      `;

    panel.innerHTML = `
      <section class="teacher-welcome">
        <div>
          <span class="teacher-label">Bem-vindo(a), professor(a)</span>
          <h2>${escapeHtml(user.name)}</h2>
          <p>Escolha uma disciplina abaixo para publicar materiais ou acesse o diário de turmas para lançar notas no boletim.</p>
          <div class="teacher-welcome-actions">
            <button type="button" class="teacher-button" data-open-gradebook>📊 Abrir Boletim e Diário de Notas</button>
          </div>
        </div>
        <div class="teacher-welcome-icon">👨‍🏫</div>
      </section>

      <section class="teacher-overview">
        <div class="teacher-stat">
          <span>Disciplinas vinculadas</span>
          <strong>${subjects.length}</strong>
        </div>
        <div class="teacher-stat">
          <span>Perfil de acesso</span>
          <strong>Professor</strong>
        </div>
        <div class="teacher-stat">
          <span>Status da conta</span>
          <strong>Ativo</strong>
        </div>
      </section>

      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Gestão acadêmica</span>
            <h2>Minhas disciplinas</h2>
          </div>
          <p>Os recursos de materiais, rascunhos e atividades ficam organizados dentro de cada disciplina.</p>
        </div>
        <div class="subject-grid">
          ${subjectCards}
        </div>
      </section>
    `;

    panel.querySelectorAll("[data-subject-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const subject = subjects.find((item) => item.slug === button.dataset.subjectAction);
        if (!subject) return;
        showSubject(subject);
      });
    });
    panel.querySelector("[data-open-gradebook]").addEventListener("click", renderGradebookCourses);
  };

  const renderGradebookCourses = async () => {
    panel.innerHTML = `
      <button type="button" class="teacher-back" data-gradebook-home>← Voltar ao painel do professor</button>
      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Diário de classe</span>
            <h2>Minhas turmas e ofertas</h2>
          </div>
          <p>Selecione uma turma e disciplina para configurar pesos, criar avaliações e lançar notas no boletim.</p>
        </div>
        <div data-gradebook-courses class="subject-grid">
          <p class="teacher-loading">Carregando turmas...</p>
        </div>
      </section>
    `;
    panel.querySelector("[data-gradebook-home]").addEventListener("click", render);
    const list = panel.querySelector("[data-gradebook-courses]");
    try {
      const data = await api("/api/gradebook?action=courses");
      list.innerHTML = data.courses.length ? data.courses.map((course) => `
        <article class="subject-card">
          <div class="subject-card-icon">📝</div>
          <div class="subject-card-content">
            <span class="teacher-label">Ano letivo ${escapeHtml(course.academic_year_name)}</span>
            <h3>${escapeHtml(course.subject_name)}</h3>
            <p>${escapeHtml(course.class_name)} · ${course.student_count} ${course.student_count === 1 ? "estudante matriculado" : "estudantes matriculados"}</p>
            <div class="subject-actions">
              <button type="button" class="teacher-button" data-gradebook-course="${escapeHtml(course.id)}">Abrir diário de notas</button>
            </div>
          </div>
        </article>
      `).join("") : `<div class="teacher-empty compact" style="grid-column: 1 / -1;"><h3>Nenhuma turma atribuída</h3><p>Peça ao administrador para vincular uma turma à sua disciplina no painel administrativo.</p></div>`;
      list.querySelectorAll("[data-gradebook-course]").forEach((button) => button.addEventListener("click", () => renderGradebookCourse(button.dataset.gradebookCourse)));
    } catch (error) {
      list.innerHTML = `<p class="teacher-message error">${escapeHtml(error.message)}</p>`;
    }
  };

  const renderGradebookCourse = async (offeringId) => {
    panel.innerHTML = `<button type="button" class="teacher-back" data-gradebook-courses-back>← Voltar às turmas</button><div data-gradebook-detail class="teacher-loading">Carregando diário...</div>`;
    panel.querySelector("[data-gradebook-courses-back]").addEventListener("click", renderGradebookCourses);
    const content = panel.querySelector("[data-gradebook-detail]");
    try {
      const data = await api(`/api/gradebook?action=course&offering=${encodeURIComponent(offeringId)}`);
      const { course, periods, components, assessments, students, grades } = data;
      const gradeFor = (assessmentId, enrollmentId) => grades.find((item) => item.assessment_id === assessmentId && item.enrollment_id === enrollmentId);
      const componentOptions = components.map((component) => `<option value="${escapeHtml(component.id)}" data-period="${escapeHtml(component.grading_period_id)}">${escapeHtml(component.name)} · ${escapeHtml(component.weight_percent)}%</option>`).join("");

      const componentPanels = periods.map((period) => {
        const rows = components.filter((component) => component.grading_period_id === period.id);
        const total = rows.reduce((sum, component) => sum + Number(component.weight_percent), 0);
        const isComplete = Math.abs(total - 100) < 0.01;
        const locked = rows.some((component) => component.status === "locked");
        return `
          <article class="component-period">
            <div class="teacher-list-heading">
              <div>
                <h3>${escapeHtml(period.sequence)}. ${escapeHtml(period.name)}</h3>
                <p>Soma dos pesos: <strong>${total.toFixed(2)}% / 100%</strong> ${isComplete ? "✓ Pronto para publicação" : "(deve somar 100%)"}</p>
              </div>
              <span class="teacher-badge ${locked ? "published" : "draft"}">${locked ? "🔒 Composição congelada" : "Em configuração"}</span>
            </div>
            <div class="weight-meter" aria-hidden="true">
              <div class="weight-meter-fill ${isComplete ? "complete" : ""}" style="width: ${Math.min(100, Math.max(0, total))}%"></div>
            </div>
            ${rows.length ? rows.map((component) => `
              <form class="component-edit-row" data-update-component data-component="${escapeHtml(component.id)}">
                <label>Componente<input name="name" maxlength="100" value="${escapeHtml(component.name)}" ${component.status === "locked" ? "disabled" : ""}></label>
                <label>Peso (%)<input name="weightPercent" type="number" min="0.01" max="100" step="0.01" value="${escapeHtml(component.weight_percent)}" ${component.status === "locked" ? "disabled" : ""}></label>
                <button type="submit" class="teacher-button" ${component.status === "locked" ? "disabled" : ""}>Salvar</button>
                <button type="button" class="teacher-button secondary" data-delete-component="${escapeHtml(component.id)}" ${component.status === "locked" ? "disabled" : ""}>Remover</button>
                <small class="teacher-message" data-component-message></small>
              </form>
            `).join("") : `<p class="teacher-empty compact">Nenhum componente configurado neste período.</p>`}
            ${locked ? `<p class="teacher-message info" style="margin-top: 8px;">Os pesos foram congelados após a primeira publicação de nota neste período.</p>` : ""}
          </article>
        `;
      }).join("");

      content.className = "gradebook-detail";
      content.innerHTML = `
        <section class="teacher-welcome">
          <div>
            <span class="teacher-label">${escapeHtml(course.academic_year_name)} · ${escapeHtml(course.class_name)}</span>
            <h2>${escapeHtml(course.subject_name)}</h2>
            <p>${students.length} ${students.length === 1 ? "estudante matriculado" : "estudantes matriculados"} · Escala de 0 a 10</p>
          </div>
          <div class="teacher-welcome-icon">📊</div>
        </section>

        <section class="teacher-section">
          <div class="teacher-section-heading">
            <div>
              <span class="teacher-label">Composição da nota</span>
              <h2>Componentes avaliativos</h2>
            </div>
            <p>Crie categorias como Trabalhos, Provas ou Participação. Os pesos devem totalizar 100% em cada período.</p>
          </div>
          <form class="teacher-form component-create-form" data-create-component>
            <label>Período<select name="gradingPeriodId" required><option value="">Selecione</option>${periods.filter((period) => period.status === "open").map((period) => `<option value="${escapeHtml(period.id)}">${escapeHtml(period.sequence)}. ${escapeHtml(period.name)}</option>`).join("")}</select></label>
            <label>Nome do componente<input name="name" maxlength="100" required placeholder="Ex.: Trabalhos"></label>
            <label>Peso no período (%)<input name="weightPercent" type="number" min="0.01" max="100" step="0.01" required placeholder="Ex.: 40"></label>
            <button class="teacher-button" type="submit">Adicionar componente</button>
            <span class="teacher-message" data-component-create-message aria-live="polite"></span>
          </form>
          <div class="component-period-list">${componentPanels}</div>
        </section>

        <section class="teacher-section">
          <div class="teacher-section-heading">
            <div>
              <span class="teacher-label">Nova avaliação</span>
              <h2>Criar avaliação ou recuperação</h2>
            </div>
            <p>O peso da avaliação é relativo aos outros itens do mesmo componente.</p>
          </div>
          <form class="teacher-form" data-gradebook-new-assessment>
            <input type="hidden" name="courseOfferingId" value="${escapeHtml(offeringId)}">
            <label>Título da avaliação<input name="title" maxlength="160" placeholder="Ex.: Prova Bimestral 1" required></label>
            <div class="teacher-form-row">
              <label>Tipo<select name="assessmentType" data-assessment-type><option value="regular">Avaliação regular</option><option value="period_recovery">Recuperação de período</option><option value="final_recovery">Recuperação final anual</option></select></label>
              <label data-assessment-period-field>Período<select name="gradingPeriodId" data-assessment-period><option value="">Selecione um período</option>${periods.map((period) => `<option value="${escapeHtml(period.id)}">${escapeHtml(period.sequence)}. ${escapeHtml(period.name)} · peso anual ${escapeHtml(period.weight)}</option>`).join("")}</select></label>
            </div>
            <label data-assessment-component-field>Componente<select name="componentId" data-assessment-component><option value="">Selecione um componente</option>${componentOptions}</select></label>
            <div class="teacher-form-row">
              <label>Peso interno<input name="weight" type="number" min="0.001" max="1000" step="0.001" value="1" required></label>
              <label>Prazo opcional<input name="dueAt" type="datetime-local"></label>
            </div>
            <label>Descrição opcional<textarea name="description" rows="2" placeholder="Conteúdos abordados ou instruções..."></textarea></label>
            <div class="teacher-form-actions"><button class="teacher-button" type="submit">Criar avaliação</button></div>
            <div class="teacher-message" data-gradebook-message aria-live="polite"></div>
          </form>
        </section>

        <section class="teacher-section">
          <div class="teacher-section-heading">
            <div>
              <span class="teacher-label">Diário de lançamento</span>
              <h2>Avaliações cadastradas</h2>
            </div>
            <p>Salve as notas individualmente ou todas de uma vez. As notas ficam visíveis aos estudantes após clicar em Publicar notas.</p>
          </div>
          ${assessments.length ? assessments.map((assessment) => `
            <article class="teacher-list-item grade-assessment" data-assessment-card="${escapeHtml(assessment.id)}">
              <div class="teacher-list-heading">
                <div>
                  <div class="teacher-badges">
                    <span class="teacher-badge">${assessment.assessment_type === "regular" ? escapeHtml(assessment.component_name || "Regular") : assessment.assessment_type === "period_recovery" ? "Recuperação do período" : "Recuperação final"}</span>
                    <span class="teacher-badge">Peso interno ${escapeHtml(assessment.weight)}</span>
                    <span class="teacher-badge ${assessment.status === "published" ? "published" : "draft"}">${assessment.status === "published" ? "Publicada" : "Rascunho"}</span>
                  </div>
                  <h3>${escapeHtml(assessment.title)}</h3>
                  <p>${escapeHtml(assessment.description || "")} ${assessment.due_at ? `· Prazo: ${escapeHtml(formatDate(assessment.due_at))}` : ""}</p>
                </div>
                <div class="grade-assessment-actions">
                  ${students.length ? `<button class="teacher-button secondary" type="button" data-save-all-grades="${escapeHtml(assessment.id)}" ${assessment.status === "closed" ? "disabled" : ""}>Salvar todas as notas</button>` : ""}
                  <button class="teacher-button" type="button" data-publish-assessment="${escapeHtml(assessment.id)}" ${assessment.status === "closed" ? "disabled" : ""}>Publicar notas</button>
                </div>
              </div>
              <div class="teacher-message" data-assessment-card-message="${escapeHtml(assessment.id)}" aria-live="polite"></div>
              ${students.length ? `<div class="grade-student-list">${students.map((student) => {
                const grade = gradeFor(assessment.id, student.enrollment_id);
                const gradeStatus = grade?.grade_status || (grade?.score !== null && grade?.score !== undefined ? "scored" : "pending");
                const disabled = assessment.status === "closed";
                return `
                  <form class="grade-student-row" data-save-grade data-assessment="${escapeHtml(assessment.id)}" data-enrollment="${escapeHtml(student.enrollment_id)}">
                    <strong>${escapeHtml(student.student_name)}</strong>
                    <label>Situação<select name="gradeStatus" data-grade-status ${disabled ? "disabled" : ""}><option value="pending" ${gradeStatus === "pending" ? "selected" : ""}>Pendente</option><option value="scored" ${gradeStatus === "scored" ? "selected" : ""}>Corrigida</option><option value="excused" ${gradeStatus === "excused" ? "selected" : ""}>Dispensada</option></select></label>
                    <label>Nota (0-10)<input name="score" data-grade-score type="number" min="0" max="10" step="0.01" value="${grade?.score ?? ""}" placeholder="0 a 10" ${disabled || gradeStatus !== "scored" ? "disabled" : ""}></label>
                    <label>Comentário / Feedback<input name="feedback" maxlength="2000" value="${escapeHtml(grade?.feedback || "")}" placeholder="Opcional" ${disabled ? "disabled" : ""}></label>
                    <div class="grade-row-actions">
                      <button class="teacher-button" type="submit" ${disabled ? "disabled" : ""}>Salvar</button>
                      <span class="teacher-message" data-row-message aria-live="polite"></span>
                    </div>
                  </form>
                `;
              }).join("")}</div>` : `<p class="teacher-empty compact">Nenhum aluno matriculado nesta turma.</p>`}
            </article>
          `).join("") : `<div class="teacher-empty compact"><h3>Nenhuma avaliação criada</h3><p>Crie a primeira avaliação no formulário acima.</p></div>`}
        </section>
      `;

      const assessmentForm = content.querySelector("[data-gradebook-new-assessment]");
      const typeSelect = assessmentForm.querySelector("[data-assessment-type]");
      const periodSelect = assessmentForm.querySelector("[data-assessment-period]");
      const componentSelect = assessmentForm.querySelector("[data-assessment-component]");

      const syncAssessmentFields = () => {
        const regular = typeSelect.value === "regular";
        const finalRecovery = typeSelect.value === "final_recovery";
        periodSelect.disabled = finalRecovery;
        periodSelect.required = !finalRecovery;
        assessmentForm.querySelector("[data-assessment-period-field]").hidden = finalRecovery;
        componentSelect.disabled = !regular;
        componentSelect.required = regular;
        assessmentForm.querySelector("[data-assessment-component-field]").hidden = !regular;
        if (!regular) componentSelect.value = "";
        if (finalRecovery) periodSelect.value = "";
      };

      const filterComponents = () => {
        Array.from(componentSelect.options).forEach((option) => {
          if (!option.value) return;
          option.hidden = option.dataset.period !== periodSelect.value;
        });
        if (componentSelect.selectedOptions[0]?.dataset.period !== periodSelect.value) componentSelect.value = "";
      };

      typeSelect.addEventListener("change", syncAssessmentFields);
      periodSelect.addEventListener("change", filterComponents);
      syncAssessmentFields();
      filterComponents();

      content.querySelector("[data-create-component]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const body = Object.fromEntries(new FormData(form));
        body.courseOfferingId = offeringId;
        try {
          await api("/api/gradebook?action=create-component", { method: "POST", body: JSON.stringify(body) });
          await renderGradebookCourse(offeringId);
        } catch (error) {
          showMessage(form.querySelector("[data-component-create-message]"), error.message, "error");
        }
      });

      content.querySelectorAll("[data-update-component]").forEach((form) => form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const row = event.currentTarget;
        const body = Object.fromEntries(new FormData(row));
        body.componentId = row.dataset.component;
        try {
          await api("/api/gradebook?action=update-component", { method: "POST", body: JSON.stringify(body) });
          await renderGradebookCourse(offeringId);
        } catch (error) {
          showMessage(row.querySelector("[data-component-message]"), error.message, "error");
        }
      }));

      content.querySelectorAll("[data-delete-component]").forEach((button) => button.addEventListener("click", async () => {
        const row = button.closest("[data-update-component]");
        try {
          await api("/api/gradebook?action=delete-component", { method: "POST", body: JSON.stringify({ componentId: button.dataset.deleteComponent }) });
          await renderGradebookCourse(offeringId);
        } catch (error) {
          showMessage(row?.querySelector("[data-component-message]"), error.message, "error");
        }
      }));

      assessmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const body = Object.fromEntries(new FormData(form));
        if (body.dueAt) body.dueAt = new Date(body.dueAt).toISOString();
        const type = body.assessmentType;
        if (type === "final_recovery") body.gradingPeriodId = "";
        if (type !== "regular") body.componentId = "";
        try {
          await api("/api/gradebook?action=create-assessment", { method: "POST", body: JSON.stringify(body) });
          await renderGradebookCourse(offeringId);
        } catch (error) {
          showMessage(form.querySelector("[data-gradebook-message]"), error.message, "error");
        }
      });

      content.querySelectorAll("[data-save-grade]").forEach((form) => form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const row = event.currentTarget;
        const values = Object.fromEntries(new FormData(row));
        try {
          await api("/api/gradebook?action=save-grade", {
            method: "POST",
            body: JSON.stringify({ assessmentId: row.dataset.assessment, enrollmentId: row.dataset.enrollment, ...values })
          });
          showMessage(row.querySelector("[data-row-message]"), "✓ Salva", "success");
        } catch (error) {
          showMessage(row.querySelector("[data-row-message]"), error.message, "error");
        }
      }));

      content.querySelectorAll("[data-save-all-grades]").forEach((button) => button.addEventListener("click", async () => {
        const assessmentId = button.dataset.saveAllGrades;
        const card = content.querySelector(`[data-assessment-card="${assessmentId}"]`);
        const cardMsg = content.querySelector(`[data-assessment-card-message="${assessmentId}"]`);
        const forms = Array.from(card.querySelectorAll("[data-save-grade]"));
        button.disabled = true;
        showMessage(cardMsg, "Salvando notas da turma...", "info");
        let savedCount = 0;
        try {
          for (const row of forms) {
            const values = Object.fromEntries(new FormData(row));
            if (values.gradeStatus === "scored" && (values.score === "" || values.score === undefined)) {
              continue;
            }
            await api("/api/gradebook?action=save-grade", {
              method: "POST",
              body: JSON.stringify({ assessmentId: row.dataset.assessment, enrollmentId: row.dataset.enrollment, ...values })
            });
            showMessage(row.querySelector("[data-row-message]"), "✓ Salva", "success");
            savedCount++;
          }
          showMessage(cardMsg, `${savedCount} ${savedCount === 1 ? "registro salvo" : "registros salvos"} com sucesso.`, "success");
        } catch (error) {
          showMessage(cardMsg, error.message, "error");
        } finally {
          button.disabled = false;
        }
      }));

      content.querySelectorAll("[data-grade-status]").forEach((select) => select.addEventListener("change", () => {
        const score = select.form.querySelector("[data-grade-score]");
        score.disabled = select.value !== "scored";
        if (select.value !== "scored") score.value = "";
      }));

      content.querySelectorAll("[data-publish-assessment]").forEach((button) => button.addEventListener("click", async () => {
        const assessmentId = button.dataset.publishAssessment;
        const cardMsg = content.querySelector(`[data-assessment-card-message="${assessmentId}"]`);
        try {
          await api("/api/gradebook?action=publish-assessment", { method: "POST", body: JSON.stringify({ assessmentId }) });
          await renderGradebookCourse(offeringId);
        } catch (error) {
          showMessage(cardMsg, error.message, "error");
        }
      }));
    } catch (error) {
      content.innerHTML = `<section class="teacher-empty"><h2>Não foi possível abrir o diário</h2><p>${escapeHtml(error.message)}</p></section>`;
    }
  };

  const showSubject = async (subject) => {
    panel.innerHTML = `
      <button type="button" class="teacher-back" data-teacher-back>← Voltar para minhas disciplinas</button>
      <section class="teacher-welcome">
        <div>
          <span class="teacher-label">Gestão da Disciplina</span>
          <h2>${escapeHtml(subject.name)}</h2>
          <p>Publique materiais de estudo, salve rascunhos e cadastre atividades para os estudantes.</p>
        </div>
        <div class="teacher-welcome-icon">📖</div>
      </section>
      <section class="teacher-tabs" aria-label="Seções da disciplina">
        <button class="active" type="button" data-tab="overview">Visão geral</button>
        <button type="button" data-tab="materials">Materiais de estudo</button>
        <button type="button" data-tab="activities">Atividades propostas</button>
      </section>
      <div data-subject-content>
        <div class="teacher-loading">Carregando disciplina...</div>
      </div>
    `;

    panel.querySelector("[data-teacher-back]").addEventListener("click", render);
    panel.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(subject, tab.dataset.tab));
    });

    await switchTab(subject, "overview");
  };

  const switchTab = async (subject, tab) => {
    const content = panel.querySelector("[data-subject-content]");
    if (!content) return;

    panel.querySelectorAll("[data-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    content.innerHTML = `<div class="teacher-loading">Carregando...</div>`;

    try {
      if (tab === "materials") {
        await renderMaterials(subject, content);
      } else if (tab === "activities") {
        await renderActivities(subject, content);
      } else {
        await renderOverview(subject, content);
      }
    } catch (error) {
      content.innerHTML = `
        <section class="teacher-empty">
          <span class="teacher-icon">⚠️</span>
          <h2>Não foi possível carregar</h2>
          <p>${escapeHtml(error.message)}</p>
          <button type="button" class="teacher-button" data-retry>Tentar novamente</button>
        </section>
      `;
      content.querySelector("[data-retry]").addEventListener("click", () => switchTab(subject, tab));
    }
  };

  const renderOverview = async (subject, content) => {
    const [materialsData, activitiesData] = await Promise.all([
      api(`/api/academic?resource=materials&action=list&subject=${encodeURIComponent(subject.slug)}`),
      api(`/api/academic?resource=activities&action=list&subject=${encodeURIComponent(subject.slug)}`)
    ]);

    const materials = materialsData.materials || [];
    const activities = activitiesData.activities || [];

    content.innerHTML = `
      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Resumo</span>
            <h2>Visão geral da disciplina</h2>
          </div>
          <p>Acompanhe os conteúdos e tarefas criados para os alunos de ${escapeHtml(subject.name)}.</p>
        </div>
        <div class="teacher-overview">
          <div class="teacher-stat"><span>Materiais cadastrados</span><strong>${materials.length}</strong></div>
          <div class="teacher-stat"><span>Atividades propostas</span><strong>${activities.length}</strong></div>
          <div class="teacher-stat"><span>Página pública</span><strong><a href="materia.html?slug=${encodeURIComponent(subject.slug)}" style="color: var(--cor-ciano); text-decoration: none;">Abrir ↗</a></strong></div>
        </div>
        <div class="teacher-feature-grid">
          <article>
            <span>📄</span>
            <h3>Materiais de Estudo</h3>
            <p>Publique textos, resumos e links complementares. Use o modo rascunho enquanto prepara o conteúdo.</p>
          </article>
          <article>
            <span>📝</span>
            <h3>Atividades</h3>
            <p>Cadastre listas, trabalhos e orientações com prazo e pontuação máxima visíveis no perfil dos alunos.</p>
          </article>
          <article>
            <span>📊</span>
            <h3>Boletim &amp; Notas</h3>
            <p>Configure componentes avaliativos e lance notas por período no Diário de Classe.</p>
          </article>
        </div>
      </section>
    `;
  };

  const renderMaterials = async (subject, content) => {
    const data = await api(`/api/academic?resource=materials&action=list&subject=${encodeURIComponent(subject.slug)}`);
    const materials = data.materials || [];

    content.innerHTML = `
      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Conteúdo didático</span>
            <h2>Materiais de estudo</h2>
          </div>
          <p>Salve materiais como rascunho enquanto prepara o conteúdo ou publique para disponibilizá-los aos estudantes.</p>
        </div>

        <form class="teacher-form" data-material-form>
          <div class="teacher-form-heading">
            <h3>Novo material</h3>
            <p>Publique um texto de estudo e, opcionalmente, adicione um link externo complementar.</p>
          </div>
          <label>Título<input name="title" maxlength="200" required placeholder="Ex.: Introdução à matéria"></label>
          <label>Conteúdo<textarea name="content" rows="6" maxlength="30000" required placeholder="Escreva o conteúdo do material..."></textarea></label>
          <div class="teacher-form-row">
            <label>Link complementar opcional<input name="link" type="url" placeholder="https://..."></label>
            <label>Visibilidade<select name="status"><option value="draft">Salvar como rascunho</option><option value="published">Publicar para estudantes</option></select></label>
          </div>
          <div class="teacher-form-actions"><button class="teacher-button" type="submit">Salvar material</button></div>
          <div class="teacher-message" data-material-message aria-live="polite"></div>
        </form>

        <div class="teacher-list-heading">
          <h3>Meus materiais cadastrados</h3>
          <span>${materials.length} ${materials.length === 1 ? "material" : "materiais"}</span>
        </div>
        <div class="teacher-list">
          ${materials.length ? materials.map((material) => `
            <form class="teacher-form teacher-list-item material-edit-form" data-material-id="${escapeHtml(material.id)}">
              <div class="material-summary-header">
                <div>
                  <div class="teacher-badges">
                    <span class="teacher-badge ${material.status === "published" ? "published" : "draft"}">${material.status === "published" ? "Publicado" : "Rascunho"}</span>
                    <span class="teacher-badge">Atualizado em ${escapeHtml(formatDate(material.updated_at || material.created_at))}</span>
                  </div>
                  <h3>${escapeHtml(material.title)}</h3>
                </div>
                <button type="button" class="teacher-button secondary" data-toggle-material-edit>Editar material</button>
              </div>
              <div class="material-edit-body" hidden>
                <label>Título<input name="title" maxlength="200" required value="${escapeHtml(material.title)}"></label>
                <label>Conteúdo<textarea name="content" rows="5" maxlength="30000" required>${escapeHtml(material.content)}</textarea></label>
                <div class="teacher-form-row">
                  <label>Link opcional<input name="link" type="url" maxlength="2048" value="${escapeHtml(material.link || "")}" placeholder="https://..."></label>
                  <label>Visibilidade<select name="status"><option value="draft" ${material.status === "draft" ? "selected" : ""}>Rascunho</option><option value="published" ${material.status === "published" ? "selected" : ""}>Publicado</option></select></label>
                </div>
                <div class="teacher-message" data-edit-message aria-live="polite"></div>
                <div class="teacher-form-actions">
                  <button class="teacher-button" type="submit">Salvar alterações</button>
                </div>
              </div>
            </form>
          `).join("") : `
            <div class="teacher-empty compact"><span class="teacher-icon">📄</span><h3>Nenhum material cadastrado</h3><p>Use o formulário acima para adicionar o primeiro material desta disciplina.</p></div>
          `}
        </div>
      </section>
    `;

    content.querySelectorAll("[data-toggle-material-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const form = btn.closest("[data-material-id]");
        const body = form.querySelector(".material-edit-body");
        const isHidden = body.hidden;
        body.hidden = !isHidden;
        btn.textContent = isHidden ? "Fechar edição" : "Editar material";
      });
    });

    content.querySelector("[data-material-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button[type=submit]");
      const message = form.querySelector("[data-material-message]");
      const formData = new FormData(form);

      button.disabled = true;
      showMessage(message, "Salvando material...", "info");

      try {
        await api("/api/academic?resource=materials&action=create", {
          method: "POST",
          body: JSON.stringify({
            subjectSlug: subject.slug,
            title: formData.get("title"),
            content: formData.get("content"),
            link: formData.get("link"),
            status: formData.get("status")
          })
        });
        showMessage(message, formData.get("status") === "published" ? "Material publicado para os estudantes." : "Rascunho salvo.", "success");
        form.reset();
        setTimeout(() => switchTab(subject, "materials"), 500);
      } catch (error) {
        showMessage(message, error.message, "error");
        button.disabled = false;
      }
    });

    content.querySelectorAll("[data-material-id]").forEach((form) => form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const editForm = event.currentTarget;
      const formData = new FormData(editForm);
      const submit = editForm.querySelector("button[type=submit]");
      submit.disabled = true;
      try {
        await api("/api/academic?resource=materials&action=update", {
          method: "POST",
          body: JSON.stringify({
            id: editForm.dataset.materialId,
            subjectSlug: subject.slug,
            title: formData.get("title"),
            content: formData.get("content"),
            link: formData.get("link"),
            status: formData.get("status")
          })
        });
        await switchTab(subject, "materials");
      } catch (error) {
        showMessage(editForm.querySelector("[data-edit-message]"), error.message, "error");
        submit.disabled = false;
      }
    }));
  };

  const renderActivities = async (subject, content) => {
    const data = await api(`/api/academic?resource=activities&action=list&subject=${encodeURIComponent(subject.slug)}`);
    const activities = data.activities || [];

    content.innerHTML = `
      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Tarefas e propostas</span>
            <h2>Atividades</h2>
          </div>
          <p>Cadastre atividades e orientações que ficarão visíveis na aba de atividades do perfil dos estudantes.</p>
        </div>

        <form class="teacher-form" data-activity-form>
          <div class="teacher-form-heading">
            <h3>Nova atividade</h3>
            <p>Defina as informações básicas da atividade, prazo e pontuação máxima.</p>
          </div>
          <label>Título<input name="title" maxlength="200" required placeholder="Ex.: Trabalho sobre funções"></label>
          <label>Descrição<textarea name="description" rows="5" required placeholder="Explique o que os alunos deverão fazer..."></textarea></label>
          <div class="teacher-form-row">
            <label>Tipo
              <select name="activityType">
                <option value="manual">Correção manual</option>
                <option value="automatic">Correção automática</option>
              </select>
            </label>
            <label>Nota máxima<input name="maxScore" type="number" min="0.01" max="100" step="0.01" value="10" required></label>
          </div>
          <label>Prazo opcional<input name="dueAt" type="datetime-local"></label>
          <div class="teacher-form-actions"><button class="teacher-button" type="submit">Criar atividade</button></div>
          <div class="teacher-message" data-activity-message aria-live="polite"></div>
        </form>

        <div class="teacher-list-heading">
          <h3>Atividades criadas</h3>
          <span>${activities.length} ${activities.length === 1 ? "atividade" : "atividades"}</span>
        </div>
        <div class="teacher-list">
          ${activities.length ? activities.map((activity) => `
            <article class="teacher-list-item">
              <div>
                <div class="teacher-badges">
                  <span class="teacher-badge">${activity.activity_type === "automatic" ? "Automática" : "Manual"}</span>
                  <span class="teacher-badge">${escapeHtml(activity.max_score)} pts</span>
                </div>
                <h3>${escapeHtml(activity.title)}</h3>
                <p>${escapeHtml(activity.description)}</p>
                <small>${activity.due_at ? `📅 Prazo: ${escapeHtml(formatDate(activity.due_at))}` : "Sem prazo definido"}</small>
              </div>
            </article>
          `).join("") : `
            <div class="teacher-empty compact"><span class="teacher-icon">📝</span><h3>Nenhuma atividade criada</h3><p>Use o formulário acima para criar a primeira atividade.</p></div>
          `}
        </div>
      </section>
    `;

    content.querySelector("[data-activity-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button[type=submit]");
      const message = form.querySelector("[data-activity-message]");
      const formData = new FormData(form);
      const dueAt = formData.get("dueAt");

      button.disabled = true;
      showMessage(message, "Criando atividade...", "info");

      try {
        await api("/api/academic?resource=activities&action=create", {
          method: "POST",
          body: JSON.stringify({
            subjectSlug: subject.slug,
            title: formData.get("title"),
            description: formData.get("description"),
            activityType: formData.get("activityType"),
            maxScore: formData.get("maxScore"),
            dueAt: dueAt ? new Date(dueAt).toISOString() : null
          })
        });
        showMessage(message, "Atividade criada com sucesso!", "success");
        form.reset();
        form.querySelector("[name=maxScore]").value = "10";
        setTimeout(() => switchTab(subject, "activities"), 500);
      } catch (error) {
        showMessage(message, error.message, "error");
        button.disabled = false;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", render);
})();
