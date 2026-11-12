(() => {
  const list = document.querySelector("[data-teachers]");
  const message = document.querySelector("[data-message]");
  const usersList = document.querySelector("[data-users]");
  const usersMessage = document.querySelector("[data-users-message]");
  const subjectList = document.querySelector("[data-subjects]");
  const subjectMessage = document.querySelector("[data-subject-message]");
  const resourceList = document.querySelector("[data-resource-list]");
  const resourceMessage = document.querySelector("[data-resource-message]");
  const teacherCreateMessage = document.querySelector("[data-teacher-create-message]");
  let allUsers = [];
  let subjects = [];
  let resources = [];
  let currentUserId = null;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const api = async (action, options) => {
    const response = await fetch(`/api/admin${action ? `?action=${encodeURIComponent(action)}` : ""}`, {
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) }
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
    return data;
  };

  const show = (text, type = "") => {
    if (!message) return;
    message.textContent = text;
    message.className = `message ${type}`;
  };

  const bindAdminTabs = () => {
    const tabs = document.querySelectorAll("[data-admin-tab]");
    const panels = document.querySelectorAll("[data-admin-panel]");
    if (!tabs.length || !panels.length) return;

    const activateTab = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.adminTab === target));
      panels.forEach((panel) => {
        panel.hidden = target !== "todos" && panel.dataset.adminPanel !== target;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.adminTab));
    });

    const hash = window.location.hash.replace("#", "").trim();
    if (["professores", "usuarios", "disciplinas", "boletim", "recursos"].includes(hash)) {
      activateTab(hash);
    }
  };

  const renderUsers = () => {
    const query = document.querySelector("[data-user-search]").value.trim().toLowerCase();
    const filtered = allUsers.filter((user) => `${user.name} ${user.email} ${user.account_type}`.toLowerCase().includes(query));
    usersList.innerHTML = filtered.length ? filtered.map((user) => {
      const isAdmin = user.account_type === "Administrador";
      const canChangePassword = !isAdmin || user.id === currentUserId;
      return `
        <tr data-user="${escapeHtml(user.id)}">
          <td><input data-user-name aria-label="Nome" value="${escapeHtml(user.name)}" maxlength="150" ${isAdmin ? "disabled" : ""}></td>
          <td><input data-user-email aria-label="E-mail" type="email" value="${escapeHtml(user.email)}" maxlength="255" ${isAdmin ? "disabled" : ""}></td>
          <td>
            <select data-user-type aria-label="Perfil" ${isAdmin ? "disabled" : ""}>
              <option ${user.account_type === "Aluno" ? "selected" : ""}>Aluno</option>
              <option ${user.account_type === "Professor" ? "selected" : ""}>Professor</option>
              ${isAdmin ? "<option selected>Administrador</option>" : ""}
            </select>
          </td>
          <td>${new Date(user.created_at).toLocaleDateString("pt-BR")}</td>
          <td>
            <div class="password-reset-cell">
              <input data-user-password aria-label="Nova senha" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="Nova senha..." ${canChangePassword ? "" : "disabled"}>
              <button type="button" data-reset-password ${canChangePassword ? "" : "disabled"}>Definir</button>
            </div>
            ${isAdmin ? "<small>Conta administradora</small>" : ""}
          </td>
          <td><button type="button" data-save-user ${isAdmin ? "disabled" : ""}>Salvar</button></td>
        </tr>
      `;
    }).join("") : '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
  };

  const renderSubjects = () => {
    const query = document.querySelector("[data-subject-search]").value.trim().toLowerCase();
    const filtered = subjects.filter((subject) => `${subject.name} ${subject.slug}`.toLowerCase().includes(query));
    document.querySelector("[data-subject-list-count]").textContent = `${filtered.length} de ${subjects.length} disciplinas`;
    subjectList.innerHTML = filtered.length ? filtered.map((subject) => `
      <form class="subject-form subject-edit-form" data-subject="${escapeHtml(subject.id)}">
        <div class="subject-title-row">
          <h3>${escapeHtml(subject.icon || "📘")} ${escapeHtml(subject.name)} <small>${escapeHtml(subject.slug)}</small></h3>
          <a href="materia.html?slug=${encodeURIComponent(subject.slug)}" target="_blank" rel="noopener noreferrer">Pré-visualizar página ↗</a>
        </div>
        <div class="subject-fields">
          <label>Nome<input name="name" value="${escapeHtml(subject.name)}" maxlength="100" required></label>
          <label>Ícone<input name="icon" value="${escapeHtml(subject.icon || "")}" maxlength="10"></label>
          <label>Descrição<input name="description" value="${escapeHtml(subject.description || "")}"></label>
          <button type="submit">Salvar disciplina</button>
        </div>
      </form>
    `).join("") : "<p>Nenhuma disciplina encontrada.</p>";
  };

  const renderResourceOptions = () => {
    document.querySelector("[data-resource-subject]").innerHTML = '<option value="">Selecione uma disciplina</option>' + subjects.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join("");
  };

  const renderTeacherSubjectOptions = () => {
    document.querySelector("[data-teacher-subject]").innerHTML = '<option value="">Selecione uma disciplina</option>' + subjects.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join("");
  };

  const renderResources = () => {
    const resourceCountEl = document.querySelector("[data-resource-count]");
    if (resourceCountEl) resourceCountEl.textContent = resources.length;
    resourceList.innerHTML = resources.length ? resources.map((r) => `
      <form class="subject-form resource-edit-form" data-resource="${escapeHtml(r.id)}">
        <div class="subject-title-row">
          <h3>${r.resource_type === "game" ? "🎮" : "📝"} ${escapeHtml(r.title)}</h3>
          <a href="${escapeHtml(r.html_path)}" target="_blank" rel="noopener noreferrer">Abrir recurso ↗</a>
        </div>
        <div class="subject-fields">
          <label>Disciplina<select name="subjectId" required>${subjects.map((s) => `<option value="${escapeHtml(s.id)}" ${s.id === r.subject_id ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}</select></label>
          <label>Tipo<select name="resourceType"><option value="quiz" ${r.resource_type === "quiz" ? "selected" : ""}>Quiz</option><option value="game" ${r.resource_type === "game" ? "selected" : ""}>Jogo</option></select></label>
          <label>Título<input name="title" value="${escapeHtml(r.title)}" maxlength="120" required></label>
          <label>Caminho HTML<input name="htmlPath" value="${escapeHtml(r.html_path)}" maxlength="255" pattern="([A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+\\.html" required></label>
        </div>
        <label>Descrição<textarea name="description" maxlength="300" rows="2">${escapeHtml(r.description || "")}</textarea></label>
        <div class="resource-actions">
          <button type="submit">Salvar alterações</button>
          <button type="button" class="danger-button" data-delete-resource="${escapeHtml(r.id)}">Remover</button>
        </div>
      </form>
    `).join("") : "<p>Nenhum quiz ou jogo cadastrado.</p>";
  };

  const loadResources = async () => {
    resourceMessage.textContent = "Carregando recursos...";
    try {
      const data = await api("resources");
      resources = data.resources || [];
      renderResources();
      resourceMessage.textContent = `${resources.length} recursos interativos cadastrados.`;
    } catch (error) {
      resourceMessage.textContent = error.message;
    }
  };

  const loadGradebook = async () => {
    const gbMessage = document.querySelector("[data-gradebook-message]");
    try {
      const response = await fetch("/api/gradebook?action=setup", { credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a configuração do boletim.");
      const fill = (selector, items, value, label) => {
        document.querySelectorAll(selector).forEach((select) => {
          select.innerHTML = `<option value="">Selecione</option>${items.map((item) => `<option value="${escapeHtml(item[value])}">${escapeHtml(label(item))}</option>`).join("")}`;
        });
      };
      fill("[data-gb-years]", data.years, "id", (item) => `${item.name} (${item.status})`);
      fill("[data-gb-classes]", data.classes, "id", (item) => `${item.name} · ${item.academic_year_name}`);
      fill("[data-gb-students]", data.students, "id", (item) => `${item.name} · ${item.email}`);
      fill("[data-gb-teachers]", data.teachers, "id", (item) => `${item.name} · ${item.email}`);
      fill("[data-gb-subjects]", data.subjects, "id", (item) => item.name);

      document.querySelector("[data-gradebook-years]").innerHTML = data.years.length ? data.years.map((year) => `
        <article class="teacher-card">
          <h3>Ano Letivo ${escapeHtml(year.name)} · <small>${escapeHtml(year.status)}</small></h3>
          <p>${escapeHtml(year.starts_on)} a ${escapeHtml(year.ends_on)} · Média de aprovação: ${escapeHtml(year.passing_score)}/10</p>
          <div class="year-status-row">
            <label>Estado do ano letivo
              <select data-year-status-select="${escapeHtml(year.id)}">
                <option value="draft" ${year.status === "draft" ? "selected" : ""}>Rascunho</option>
                <option value="active" ${year.status === "active" ? "selected" : ""}>Ativo</option>
                <option value="closed" ${year.status === "closed" ? "selected" : ""}>Encerrado</option>
              </select>
            </label>
            <button type="button" data-save-year-status="${escapeHtml(year.id)}">Salvar estado</button>
          </div>
          <div>
            ${(year.periods || []).map((period) => `
              <div class="subject-row">
                <span>${escapeHtml(period.sequence)}. ${escapeHtml(period.name)} · peso ${escapeHtml(period.weight)} · <strong>${period.status === "open" ? "Aberto" : "Encerrado"}</strong></span>
                <button type="button" data-toggle-period="${escapeHtml(period.id)}" data-period-next="${period.status === "open" ? "closed" : "open"}">${period.status === "open" ? "Encerrar período" : "Reabrir período"}</button>
              </div>
            `).join("") || "<p>Nenhum período configurado neste ano.</p>"}
          </div>
        </article>
      `).join("") : "<p>Nenhum ano letivo configurado.</p>";

      document.querySelector("[data-gradebook-classes]").innerHTML = data.classes.length ? data.classes.map((item) => `
        <article class="teacher-card">
          <h3>${escapeHtml(item.name)}</h3>
          <p>Ano letivo ${escapeHtml(item.academic_year_name)} · ${escapeHtml(item.grade_level || "Série não informada")} · <strong>${item.student_count}</strong> ${item.student_count === 1 ? "aluno" : "alunos"}</p>
        </article>
      `).join("") : "<p>Nenhuma turma cadastrada.</p>";
      gbMessage.textContent = "Configuração do boletim sincronizada.";
      gbMessage.className = "message success";
    } catch (error) {
      gbMessage.textContent = error.message;
      gbMessage.className = "message error";
    }
  };

  const loadUsers = async () => {
    usersMessage.textContent = "Carregando usuários...";
    try {
      const data = await api("users");
      allUsers = data.users || [];
      const userCountEl = document.querySelector("[data-user-count]");
      if (userCountEl) userCountEl.textContent = allUsers.length;
      renderUsers();
      usersMessage.textContent = `${allUsers.length} contas carregadas (limite de 500).`;
      usersMessage.className = "message";
    } catch (error) {
      usersMessage.textContent = error.message;
      usersMessage.className = "message error";
    }
  };

  const load = async () => {
    show("Carregando dados administrativos...");
    try {
      const data = await api("dashboard");
      subjects = data.subjects || [];
      renderSubjects();
      renderResourceOptions();
      renderTeacherSubjectOptions();
      const teachers = data.teachers || [];
      document.querySelector("[data-teacher-count]").textContent = teachers.length;
      document.querySelector("[data-subject-count]").textContent = subjects.length;
      list.innerHTML = teachers.length ? teachers.map((teacher) => {
        const assigned = teacher.subjects || [];
        const options = subjects.filter((subject) => !assigned.some((item) => item.id === subject.id));
        return `
          <article class="teacher-card" data-teacher="${escapeHtml(teacher.id)}">
            <h3>${escapeHtml(teacher.name)}</h3>
            <p>${escapeHtml(teacher.email)}</p>
            <div>
              ${assigned.length ? assigned.map((subject) => `
                <div class="subject-row">
                  <span>${escapeHtml(subject.name)}</span>
                  <button type="button" data-remove="${escapeHtml(subject.id)}">Desvincular</button>
                </div>
              `).join("") : "<p>Sem disciplinas vinculadas.</p>"}
            </div>
            <form class="assign-form">
              <select aria-label="Disciplina para atribuir" required ${options.length ? "" : "disabled"}>
                <option value="">${options.length ? "Escolha uma disciplina..." : "Todas as disciplinas atribuídas"}</option>
                ${options.map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.name)}</option>`).join("")}
              </select>
              <button type="submit" ${options.length ? "" : "disabled"}>Vincular</button>
            </form>
          </article>
        `;
      }).join("") : '<article class="teacher-card">Nenhum professor cadastrado.</article>';
      show("Dados sincronizados.", "success");
    } catch (error) {
      if (error.message === "Não autenticado.") {
        location.href = "login.html";
        return;
      }
      show(error.message, "error");
    }
  };

  document.addEventListener("submit", async (event) => {
    if (event.target.matches("[data-gradebook-form]")) {
      event.preventDefault();
      const form = event.target;
      const body = Object.fromEntries(new FormData(form));
      const gbMessage = document.querySelector("[data-gradebook-message]");
      try {
        const response = await fetch(`/api/gradebook?action=${encodeURIComponent(form.dataset.gradebookForm)}`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");
        gbMessage.textContent = "Alterações salvas com sucesso.";
        gbMessage.className = "message success";
        form.reset();
        await loadGradebook();
      } catch (error) {
        gbMessage.textContent = error.message;
        gbMessage.className = "message error";
      }
      return;
    }
    if (event.target.matches("[data-create-teacher]")) {
      event.preventDefault();
      const form = event.target;
      try {
        await api("create-teacher", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        form.reset();
        teacherCreateMessage.textContent = "Conta criada e disciplina vinculada. Entregue a senha inicial ao professor por um canal seguro.";
        teacherCreateMessage.className = "message success";
        await Promise.all([load(), loadUsers()]);
      } catch (error) {
        teacherCreateMessage.textContent = error.message;
        teacherCreateMessage.className = "message error";
      }
      return;
    }
    if (event.target.matches("[data-create-subject]")) {
      event.preventDefault();
      const form = event.target;
      try {
        await api("create-subject", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        form.reset();
        subjectMessage.textContent = "Disciplina adicionada ao catálogo.";
        subjectMessage.className = "message success";
        await load();
      } catch (error) {
        subjectMessage.textContent = error.message;
        subjectMessage.className = "message error";
      }
      return;
    }
    if (event.target.matches(".subject-edit-form")) {
      event.preventDefault();
      const form = event.target;
      const body = Object.fromEntries(new FormData(form));
      body.id = form.dataset.subject;
      try {
        await api("update-subject", { method: "POST", body: JSON.stringify(body) });
        subjectMessage.textContent = "Disciplina atualizada com sucesso.";
        subjectMessage.className = "message success";
        await load();
      } catch (error) {
        subjectMessage.textContent = error.message;
        subjectMessage.className = "message error";
      }
      return;
    }
    if (event.target.matches(".assign-form")) {
      event.preventDefault();
      const card = event.target.closest("[data-teacher]");
      try {
        await api("assign-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: event.target.querySelector("select").value }) });
        await load();
      } catch (error) {
        show(error.message, "error");
      }
    }
    if (event.target.matches("[data-resource-create], .resource-edit-form")) {
      event.preventDefault();
      const form = event.target;
      const body = Object.fromEntries(new FormData(form));
      const editing = form.matches(".resource-edit-form");
      if (editing) body.id = form.dataset.resource;
      try {
        await api(editing ? "update-resource" : "create-resource", { method: "POST", body: JSON.stringify(body) });
        if (!editing) form.reset();
        resourceMessage.textContent = editing ? "Recurso atualizado." : "Recurso adicionado.";
        resourceMessage.className = "message success";
        await loadResources();
      } catch (error) {
        resourceMessage.textContent = error.message;
        resourceMessage.className = "message error";
      }
      return;
    }
  });

  document.addEventListener("click", async (event) => {
    const yearButton = event.target.closest("[data-save-year-status]");
    const periodButton = event.target.closest("[data-toggle-period]");
    if (yearButton || periodButton) {
      const gbMessage = document.querySelector("[data-gradebook-message]");
      const body = yearButton
        ? { academicYearId: yearButton.dataset.saveYearStatus, status: document.querySelector(`[data-year-status-select="${yearButton.dataset.saveYearStatus}"]`).value }
        : { periodId: periodButton.dataset.togglePeriod, status: periodButton.dataset.periodNext };
      const action = yearButton ? "update-year-status" : "update-period-status";
      try {
        const response = await fetch(`/api/gradebook?action=${action}`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o estado.");
        gbMessage.textContent = "Estado atualizado com sucesso.";
        gbMessage.className = "message success";
        await loadGradebook();
      } catch (error) {
        gbMessage.textContent = error.message;
        gbMessage.className = "message error";
      }
      return;
    }

    const deleteResource = event.target.closest("[data-delete-resource]");
    if (deleteResource) {
      if (deleteResource.dataset.confirming !== "true") {
        deleteResource.dataset.confirming = "true";
        deleteResource.textContent = "Confirmar remoção?";
        setTimeout(() => {
          if (deleteResource.isConnected) {
            deleteResource.dataset.confirming = "";
            deleteResource.textContent = "Remover";
          }
        }, 4000);
        return;
      }
      try {
        await api("delete-resource", { method: "POST", body: JSON.stringify({ id: deleteResource.dataset.deleteResource }) });
        resourceMessage.textContent = "Recurso removido.";
        resourceMessage.className = "message success";
        await loadResources();
      } catch (error) {
        resourceMessage.textContent = error.message;
        resourceMessage.className = "message error";
      }
      return;
    }

    const row = event.target.closest("[data-user]");
    if (event.target.matches("[data-save-user]")) {
      const body = {
        userId: row.dataset.user,
        name: row.querySelector("[data-user-name]").value,
        email: row.querySelector("[data-user-email]").value,
        type: row.querySelector("[data-user-type]").value
      };
      try {
        await api("update-user", { method: "POST", body: JSON.stringify(body) });
        usersMessage.textContent = "Usuário atualizado com sucesso.";
        usersMessage.className = "message success";
        await loadUsers();
        await load();
      } catch (error) {
        usersMessage.textContent = error.message;
        usersMessage.className = "message error";
      }
      return;
    }

    if (event.target.matches("[data-reset-password]")) {
      const password = row.querySelector("[data-user-password]").value;
      try {
        await api("reset-password", { method: "POST", body: JSON.stringify({ userId: row.dataset.user, password }) });
        row.querySelector("[data-user-password]").value = "";
        if (row.dataset.user === currentUserId) {
          location.href = "login.html";
          return;
        }
        usersMessage.textContent = "Senha alterada. Combine a entrega da nova senha por um canal seguro.";
        usersMessage.className = "message success";
      } catch (error) {
        usersMessage.textContent = error.message;
        usersMessage.className = "message error";
      }
      return;
    }

    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const card = button.closest("[data-teacher]");
    try {
      const result = await api("remove-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: button.dataset.remove }) });
      await load();
      if (result.unpublishedMaterials) {
        const count = result.unpublishedMaterials;
        show(count === 1 ? "1 material publicado voltou para rascunho após a remoção do vínculo." : `${count} materiais publicados voltaram para rascunho após a remoção do vínculo.`, "success");
      }
    } catch (error) {
      show(error.message, "error");
    }
  });

  document.querySelector("[data-refresh]").addEventListener("click", load);
  document.querySelector("[data-load-users]").addEventListener("click", loadUsers);
  document.querySelector("[data-load-resources]").addEventListener("click", loadResources);
  document.querySelector("[data-load-gradebook]").addEventListener("click", loadGradebook);
  document.querySelector("[data-user-search]").addEventListener("input", renderUsers);
  document.querySelector("[data-subject-search]").addEventListener("input", renderSubjects);

  document.addEventListener("DOMContentLoaded", async () => {
    bindAdminTabs();
    await window.BitAcademyAuth.ready;
    const user = window.BitAcademyAuth.getCurrentUser();
    if (!user) {
      location.href = "login.html";
      return;
    }
    currentUserId = user.id;
    if (user.type !== "Administrador") {
      show("Acesso restrito a administradores.", "error");
      list.innerHTML = "";
      return;
    }
    await load();
    await Promise.all([loadUsers(), loadResources(), loadGradebook()]);
  });
})();
