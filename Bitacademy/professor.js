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
              <span class="subject-label">Disciplina</span>
              <h3>${escapeHtml(subject.name)}</h3>
              <p>Gerencie os conteúdos e atividades desta disciplina.</p>
              <div class="subject-actions">
                <button type="button" class="teacher-button" data-subject-action="${escapeHtml(subject.slug)}">Acessar disciplina</button>
              </div>
            </div>
          </article>
        `).join("")
      : `
        <section class="teacher-empty">
          <span class="teacher-icon">📚</span>
          <h2>Nenhuma disciplina vinculada</h2>
          <p>Sua conta de professor ainda não possui uma disciplina associada.</p>
        </section>
      `;

    panel.innerHTML = `
      <section class="teacher-welcome">
        <div>
          <span class="teacher-label">Bem-vindo(a), professor</span>
          <h2>${escapeHtml(user.name)}</h2>
          <p>Escolha uma disciplina para começar a administrar sua área.</p>
          <button type="button" class="teacher-button" data-open-gradebook>Boletim e notas</button>
        </div>
        <div class="teacher-welcome-icon">👨‍🏫</div>
      </section>

      <section class="teacher-overview">
        <div class="teacher-stat">
          <span>Disciplinas</span>
          <strong>${subjects.length}</strong>
        </div>
        <div class="teacher-stat">
          <span>Perfil</span>
          <strong>Professor</strong>
        </div>
        <div class="teacher-stat">
          <span>Status</span>
          <strong>Ativo</strong>
        </div>
      </section>

      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Gestão acadêmica</span>
            <h2>Minhas disciplinas</h2>
          </div>
          <p>Os recursos de materiais, atividades e alunos ficam organizados dentro de cada disciplina.</p>
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
    panel.innerHTML = `<button type="button" class="teacher-back" data-gradebook-home>← Voltar</button><section class="teacher-section"><div class="teacher-section-heading"><div><span class="teacher-label">Avaliações</span><h2>Minhas turmas</h2></div><p>Selecione uma turma e disciplina para lançar notas no boletim.</p></div><div data-gradebook-courses class="subject-grid"><p class="teacher-loading">Carregando turmas...</p></div></section>`;
    panel.querySelector("[data-gradebook-home]").addEventListener("click", render);
    const list = panel.querySelector("[data-gradebook-courses]");
    try {
      const data = await api("/api/gradebook?action=courses");
      list.innerHTML = data.courses.length ? data.courses.map((course) => `
        <article class="subject-card"><div class="subject-card-icon">📝</div><div class="subject-card-content"><span class="subject-label">${escapeHtml(course.academic_year_name)}</span><h3>${escapeHtml(course.subject_name)}</h3><p>${escapeHtml(course.class_name)} · ${course.student_count} estudantes</p><div class="subject-actions"><button type="button" class="teacher-button" data-gradebook-course="${escapeHtml(course.id)}">Abrir diário</button></div></div></article>
      `).join("") : `<div class="teacher-empty compact"><h3>Nenhuma turma atribuída</h3><p>Peça ao administrador para vincular uma turma à sua disciplina.</p></div>`;
      list.querySelectorAll("[data-gradebook-course]").forEach((button) => button.addEventListener("click", () => renderGradebookCourse(button.dataset.gradebookCourse)));
    } catch (error) { list.innerHTML = `<p class="teacher-message error">${escapeHtml(error.message)}</p>`; }
  };

  const renderGradebookCourse = async (offeringId) => {
    panel.innerHTML = `<button type="button" class="teacher-back" data-gradebook-courses-back>← Voltar às turmas</button><div data-gradebook-detail class="teacher-loading">Carregando diário...</div>`;
    panel.querySelector("[data-gradebook-courses-back]").addEventListener("click", renderGradebookCourses);
    const content = panel.querySelector("[data-gradebook-detail]");
    try {
      const data = await api(`/api/gradebook?action=course&offering=${encodeURIComponent(offeringId)}`);
      const { course, periods, assessments, students, grades } = data;
      const gradeFor = (assessmentId, enrollmentId) => grades.find((item) => item.assessment_id === assessmentId && item.enrollment_id === enrollmentId);
      content.className = "gradebook-detail";
      content.innerHTML = `
        <section class="teacher-welcome"><div><span class="teacher-label">${escapeHtml(course.academic_year_name)} · ${escapeHtml(course.class_name)}</span><h2>${escapeHtml(course.subject_name)}</h2><p>${students.length} estudantes · Escala de 0 a 10</p></div><div class="teacher-welcome-icon">📊</div></section>
        <section class="teacher-section"><div class="teacher-section-heading"><div><span class="teacher-label">Nova avaliação</span><h2>Criar avaliação ou recuperação</h2></div><p>Pesos relativos às demais avaliações do período.</p></div>
          <form class="teacher-form" data-gradebook-new-assessment><input type="hidden" name="courseOfferingId" value="${escapeHtml(offeringId)}"><label>Título<input name="title" maxlength="160" required></label><label>Tipo<select name="assessmentType"><option value="regular">Avaliação regular</option><option value="period_recovery">Recuperação de período</option><option value="final_recovery">Recuperação final anual</option></select></label><label>Período<select name="gradingPeriodId"><option value="">Selecione um período</option>${periods.map((period) => `<option value="${escapeHtml(period.id)}">${escapeHtml(period.sequence)}. ${escapeHtml(period.name)} · peso ${escapeHtml(period.weight)}</option>`).join("")}</select></label><div class="teacher-form-row"><label>Peso<input name="weight" type="number" min="0.001" max="1000" step="0.001" value="1" required></label><label>Prazo opcional<input name="dueAt" type="datetime-local"></label></div><label>Descrição opcional<textarea name="description" rows="2"></textarea></label><div class="teacher-form-actions"><button class="teacher-button" type="submit">Criar avaliação</button></div><div class="teacher-message" data-gradebook-message aria-live="polite"></div></form></section>
        <section class="teacher-section"><div class="teacher-section-heading"><div><span class="teacher-label">Diário</span><h2>Avaliações cadastradas</h2></div><p>As notas ficam visíveis aos estudantes somente depois da publicação.</p></div>
          ${assessments.length ? assessments.map((assessment) => `
            <article class="teacher-list-item grade-assessment"><div class="teacher-list-heading"><div><div class="teacher-badges"><span class="teacher-badge">${assessment.assessment_type === "regular" ? "Regular" : assessment.assessment_type === "period_recovery" ? "Recuperação do período" : "Recuperação final"}</span><span class="teacher-badge">Peso ${escapeHtml(assessment.weight)}</span><span class="teacher-badge">${escapeHtml(assessment.status)}</span></div><h3>${escapeHtml(assessment.title)}</h3><p>${escapeHtml(assessment.description || "")} ${assessment.due_at ? `Prazo: ${escapeHtml(formatDate(assessment.due_at))}` : ""}</p></div><button class="teacher-button" type="button" data-publish-assessment="${escapeHtml(assessment.id)}" ${assessment.status === "closed" ? "disabled" : ""}>Publicar notas</button></div>
              ${students.length ? `<div class="grade-student-list">${students.map((student) => { const grade = gradeFor(assessment.id, student.enrollment_id); return `<form class="grade-student-row" data-save-grade data-assessment="${escapeHtml(assessment.id)}" data-enrollment="${escapeHtml(student.enrollment_id)}"><strong>${escapeHtml(student.student_name)}</strong><label>Nota<input name="score" type="number" min="0" max="10" step="0.01" value="${grade?.score ?? ""}" placeholder="Sem nota" ${assessment.status === "closed" ? "disabled" : ""}></label><label>Comentário<input name="feedback" maxlength="2000" value="${escapeHtml(grade?.feedback || "")}" ${assessment.status === "closed" ? "disabled" : ""}></label><div class="grade-row-actions"><button class="teacher-button" type="submit" ${assessment.status === "closed" ? "disabled" : ""}>Salvar</button><span class="teacher-message" data-row-message aria-live="polite"></span></div></form>`; }).join("")}</div>` : `<p class="teacher-empty compact">Nenhum aluno matriculado nesta turma.</p>`}
            </article>`).join("") : `<div class="teacher-empty compact"><h3>Nenhuma avaliação criada</h3><p>Crie a primeira avaliação acima.</p></div>`}
        </section>`;
      content.querySelector("[data-gradebook-new-assessment]").addEventListener("submit", async (event) => {
        event.preventDefault(); const form = event.currentTarget; const body = Object.fromEntries(new FormData(form));
        if (body.dueAt) body.dueAt = new Date(body.dueAt).toISOString();
        const type = body.assessmentType;
        if (type === "final_recovery") body.gradingPeriodId = "";
        try { await api("/api/gradebook?action=create-assessment", { method: "POST", body: JSON.stringify(body) }); await renderGradebookCourse(offeringId); }
        catch (error) { showMessage(form.querySelector("[data-gradebook-message]"), error.message, "error"); }
      });
      content.querySelectorAll("[data-save-grade]").forEach((form) => form.addEventListener("submit", async (event) => {
        event.preventDefault(); const row = event.currentTarget; const values = Object.fromEntries(new FormData(row));
        try { await api("/api/gradebook?action=save-grade", { method: "POST", body: JSON.stringify({ assessmentId: row.dataset.assessment, enrollmentId: row.dataset.enrollment, ...values }) }); showMessage(row.querySelector("[data-row-message]"), "Nota salva.", "success"); }
        catch (error) { showMessage(row.querySelector("[data-row-message]"), error.message, "error"); }
      }));
      content.querySelectorAll("[data-publish-assessment]").forEach((button) => button.addEventListener("click", async () => {
        try { await api("/api/gradebook?action=publish-assessment", { method: "POST", body: JSON.stringify({ assessmentId: button.dataset.publishAssessment }) }); await renderGradebookCourse(offeringId); }
        catch (error) { alert(error.message); }
      }));
    } catch (error) { content.innerHTML = `<section class="teacher-empty"><h2>Não foi possível abrir o diário</h2><p>${escapeHtml(error.message)}</p></section>`; }
  };

  const showSubject = async (subject) => {
    panel.innerHTML = `
      <button type="button" class="teacher-back" data-teacher-back>← Voltar para disciplinas</button>
      <section class="teacher-welcome">
        <div>
          <span class="teacher-label">Disciplina</span>
          <h2>${escapeHtml(subject.name)}</h2>
          <p>Gerencie materiais, atividades e acompanhe os recursos da disciplina.</p>
        </div>
        <div class="teacher-welcome-icon">📖</div>
      </section>
      <section class="teacher-tabs" aria-label="Seções da disciplina">
        <button class="active" type="button" data-tab="overview">Visão geral</button>
        <button type="button" data-tab="materials">Materiais</button>
        <button type="button" data-tab="activities">Atividades</button>
        <button type="button" disabled>Alunos</button>
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
            <h2>Visão geral</h2>
          </div>
          <p>Um resumo rápido do conteúdo publicado nesta disciplina.</p>
        </div>
        <div class="teacher-overview">
          <div class="teacher-stat"><span>Materiais publicados</span><strong>${materials.length}</strong></div>
          <div class="teacher-stat"><span>Atividades criadas</span><strong>${activities.length}</strong></div>
          <div class="teacher-stat"><span>Próximas etapas</span><strong>Alunos</strong></div>
        </div>
        <div class="teacher-feature-grid">
          <article>
            <span>📄</span>
            <h3>Materiais</h3>
            <p>Publique textos, links e conteúdos complementares para os alunos.</p>
          </article>
          <article>
            <span>📝</span>
            <h3>Atividades</h3>
            <p>Crie tarefas automáticas ou manuais que poderão gerar notas.</p>
          </article>
          <article>
            <span>👥</span>
            <h3>Alunos</h3>
            <p>Acompanhamento dos estudantes será integrado na próxima etapa.</p>
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
            <span class="teacher-label">Conteúdo</span>
            <h2>Materiais</h2>
          </div>
          <p>Salve materiais como rascunho enquanto prepara o conteúdo ou publique para disponibilizá-los aos estudantes.</p>
        </div>

        <form class="teacher-form" data-material-form>
          <div class="teacher-form-heading">
            <h3>Novo material</h3>
            <p>Você pode publicar um texto e, opcionalmente, adicionar um link externo.</p>
          </div>
          <label>Título<input name="title" maxlength="200" required placeholder="Ex.: Introdução à matéria"></label>
          <label>Conteúdo<textarea name="content" rows="6" maxlength="30000" required placeholder="Escreva o conteúdo do material..."></textarea></label>
          <label>Link opcional<input name="link" type="url" placeholder="https://..."></label>
          <label>Visibilidade<select name="status"><option value="draft">Salvar como rascunho</option><option value="published">Publicar para estudantes</option></select></label>
          <div class="teacher-form-actions"><button class="teacher-button" type="submit">Salvar material</button></div>
          <div class="teacher-message" data-material-message aria-live="polite"></div>
        </form>

        <div class="teacher-list-heading">
          <h3>Meus materiais</h3>
          <span>${materials.length} ${materials.length === 1 ? "material" : "materiais"}</span>
        </div>
        <div class="teacher-list">
          ${materials.length ? materials.map((material) => `
            <form class="teacher-form teacher-list-item material-edit-form" data-material-id="${escapeHtml(material.id)}">
              <div class="teacher-badges"><span class="teacher-badge">${material.status === "published" ? "Publicado" : "Rascunho"}</span><span class="teacher-badge">${escapeHtml(formatDate(material.updated_at || material.created_at))}</span></div>
              <label>Título<input name="title" maxlength="200" required value="${escapeHtml(material.title)}"></label>
              <label>Conteúdo<textarea name="content" rows="5" maxlength="30000" required>${escapeHtml(material.content)}</textarea></label>
              <label>Link opcional<input name="link" type="url" maxlength="2048" value="${escapeHtml(material.link || "")}" placeholder="https://..."></label>
              <label>Visibilidade<select name="status"><option value="draft" ${material.status === "draft" ? "selected" : ""}>Rascunho</option><option value="published" ${material.status === "published" ? "selected" : ""}>Publicado</option></select></label>
              <div class="teacher-message" data-edit-message aria-live="polite"></div>
              <div class="teacher-form-actions"><button class="teacher-button" type="submit">Salvar alterações</button></div>
            </form>
          `).join("") : `
            <div class="teacher-empty compact"><span class="teacher-icon">📄</span><h3>Nenhum material cadastrado</h3><p>Use o formulário acima para adicionar o primeiro.</p></div>
          `}
        </div>
      </section>
    `;

    content.querySelector("[data-material-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button[type=submit]");
      const message = form.querySelector("[data-material-message]");
      const formData = new FormData(form);

      button.disabled = true;
      showMessage(message, "Publicando material...", "info");

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
            <span class="teacher-label">Avaliação</span>
            <h2>Atividades</h2>
          </div>
          <p>Crie atividades automáticas ou manuais. A criação de questões automáticas será adicionada na próxima etapa.</p>
        </div>

        <form class="teacher-form" data-activity-form>
          <div class="teacher-form-heading">
            <h3>Nova atividade</h3>
            <p>Defina as informações básicas da atividade e sua pontuação máxima.</p>
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
                <small>${activity.due_at ? `Prazo: ${escapeHtml(formatDate(activity.due_at))}` : "Sem prazo definido"}</small>
              </div>
            </article>
          `).join("") : `
            <div class="teacher-empty compact"><span class="teacher-icon">📝</span><h3>Nenhuma atividade criada</h3><p>Use o formulário acima para criar a primeira.</p></div>
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
