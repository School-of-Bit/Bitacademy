(() => {
  const list = document.querySelector("[data-teachers]");
  const message = document.querySelector("[data-message]");
  const usersList = document.querySelector("[data-users]");
  const usersMessage = document.querySelector("[data-users-message]");
  const subjectList = document.querySelector("[data-subjects]");
  const subjectMessage = document.querySelector("[data-subject-message]");
  let allUsers = [];
  let subjects = [];
  let currentUserId = null;
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const api = async (action, options) => {
    const response = await fetch(`/api/admin${action ? `?action=${encodeURIComponent(action)}` : ""}`, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
    let data = {}; try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
    return data;
  };
  const show = (text, type = "") => { message.textContent = text; message.className = `message ${type}`; };
  const renderUsers = () => {
    const query = document.querySelector("[data-user-search]").value.trim().toLowerCase();
    const filtered = allUsers.filter((user) => `${user.name} ${user.email} ${user.account_type}`.toLowerCase().includes(query));
    usersList.innerHTML = filtered.length ? filtered.map((user) => {
      const isAdmin = user.account_type === "Administrador";
      const canChangePassword = !isAdmin || user.id === currentUserId;
      return `<tr data-user="${escapeHtml(user.id)}"><td><input data-user-name aria-label="Nome" value="${escapeHtml(user.name)}" maxlength="150" ${isAdmin ? "disabled" : ""}></td><td><input data-user-email aria-label="E-mail" type="email" value="${escapeHtml(user.email)}" maxlength="255" ${isAdmin ? "disabled" : ""}></td><td><select data-user-type aria-label="Perfil" ${isAdmin ? "disabled" : ""}><option ${user.account_type === "Aluno" ? "selected" : ""}>Aluno</option><option ${user.account_type === "Professor" ? "selected" : ""}>Professor</option></select></td><td>${new Date(user.created_at).toLocaleDateString("pt-BR")}</td><td><input data-user-password aria-label="Nova senha" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="Mínimo 8 caracteres" ${canChangePassword ? "" : "disabled"}><button type="button" data-reset-password ${canChangePassword ? "" : "disabled"}>Definir senha</button>${isAdmin ? '<small>Conta administradora</small>' : ""}</td><td><button type="button" data-save-user ${isAdmin ? "disabled" : ""}>Salvar</button></td></tr>`;
    }).join("") : '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
  };
  const renderSubjects = () => {
    subjectList.innerHTML = subjects.length ? subjects.map((subject) => `<form class="subject-form subject-edit-form" data-subject="${escapeHtml(subject.id)}"><h3>${escapeHtml(subject.name)} <small>${escapeHtml(subject.slug)}</small></h3><div class="subject-fields"><label>Nome<input name="name" value="${escapeHtml(subject.name)}" maxlength="100" required></label><label>Ícone<input name="icon" value="${escapeHtml(subject.icon || "")}" maxlength="10"></label><label>Descrição<input name="description" value="${escapeHtml(subject.description || "")}"></label><button type="submit">Salvar disciplina</button></div></form>`).join("") : "<p>Nenhuma disciplina cadastrada.</p>";
  };
  const loadUsers = async () => {
    usersMessage.textContent = "Carregando usuários...";
    try { const data = await api("users"); allUsers = data.users || []; renderUsers(); usersMessage.textContent = `${allUsers.length} contas carregadas (máximo de 500).`; }
    catch (error) { usersMessage.textContent = error.message; }
  };
  const load = async () => {
    show("Carregando dados administrativos...");
    try {
      const data = await api("dashboard");
      subjects = data.subjects || [];
      renderSubjects();
      const teachers = data.teachers || [];
      document.querySelector("[data-teacher-count]").textContent = teachers.length;
      document.querySelector("[data-subject-count]").textContent = subjects.length;
      list.innerHTML = teachers.length ? teachers.map((teacher) => {
        const assigned = teacher.subjects || [];
        const options = subjects.filter((subject) => !assigned.some((item) => item.id === subject.id));
        return `<article class="teacher-card" data-teacher="${escapeHtml(teacher.id)}"><h3>${escapeHtml(teacher.name)}</h3><p>${escapeHtml(teacher.email)}</p><div>${assigned.length ? assigned.map((subject) => `<div class="subject-row"><span>${escapeHtml(subject.name)}</span><button type="button" data-remove="${escapeHtml(subject.id)}">Remover</button></div>`).join("") : '<p>Sem disciplinas vinculadas.</p>'}</div><form class="assign-form"><select aria-label="Disciplina para atribuir" required ${options.length ? "" : "disabled"}><option value="">${options.length ? "Escolha uma disciplina" : "Todas as disciplinas atribuídas"}</option>${options.map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.name)}</option>`).join("")}</select><button type="submit" ${options.length ? "" : "disabled"}>Atribuir</button></form></article>`;
      }).join("") : '<article class="teacher-card">Nenhum professor cadastrado.</article>';
      show("Dados atualizados.", "success");
    } catch (error) {
      if (error.message === "Não autenticado.") { location.href = "login.html"; return; }
      show(error.message, "error");
    }
  };
  document.addEventListener("submit", async (event) => {
    if (event.target.matches("[data-create-subject]")) {
      event.preventDefault();
      const form = event.target;
      try { await api("create-subject", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); form.reset(); subjectMessage.textContent = "Disciplina adicionada."; await load(); }
      catch (error) { subjectMessage.textContent = error.message; }
      return;
    }
    if (event.target.matches(".subject-edit-form")) {
      event.preventDefault();
      const form = event.target;
      const body = Object.fromEntries(new FormData(form)); body.id = form.dataset.subject;
      try { await api("update-subject", { method: "POST", body: JSON.stringify(body) }); subjectMessage.textContent = "Disciplina atualizada."; await load(); }
      catch (error) { subjectMessage.textContent = error.message; }
      return;
    }
    if (event.target.matches(".assign-form")) {
      event.preventDefault();
      const card = event.target.closest("[data-teacher]");
      try { await api("assign-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: event.target.querySelector("select").value }) }); await load(); }
      catch (error) { show(error.message, "error"); }
    }
  });
  document.addEventListener("click", async (event) => {
    const row = event.target.closest("[data-user]");
    if (event.target.matches("[data-save-user]")) {
      const body = { userId: row.dataset.user, name: row.querySelector("[data-user-name]").value, email: row.querySelector("[data-user-email]").value, type: row.querySelector("[data-user-type]").value };
      try { await api("update-user", { method: "POST", body: JSON.stringify(body) }); usersMessage.textContent = "Usuário atualizado."; await loadUsers(); await load(); }
      catch (error) { usersMessage.textContent = error.message; }
      return;
    }
    if (event.target.matches("[data-reset-password]")) {
      const password = row.querySelector("[data-user-password]").value;
      try {
        await api("reset-password", { method: "POST", body: JSON.stringify({ userId: row.dataset.user, password }) });
        row.querySelector("[data-user-password]").value = "";
        if (row.dataset.user === currentUserId) { location.href = "login.html"; return; }
        usersMessage.textContent = "Senha alterada. Combine a entrega da nova senha por um canal seguro.";
      }
      catch (error) { usersMessage.textContent = error.message; }
      return;
    }
    const button = event.target.closest("[data-remove]"); if (!button) return;
    const card = button.closest("[data-teacher]");
    try { await api("remove-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: button.dataset.remove }) }); await load(); }
    catch (error) { show(error.message, "error"); }
  });
  document.querySelector("[data-refresh]").addEventListener("click", load);
  document.querySelector("[data-load-users]").addEventListener("click", loadUsers);
  document.querySelector("[data-user-search]").addEventListener("input", renderUsers);
  document.addEventListener("DOMContentLoaded", async () => {
    await window.BitAcademyAuth.ready;
    const user = window.BitAcademyAuth.getCurrentUser();
    if (!user) { location.href = "login.html"; return; }
    currentUserId = user.id;
    if (user.type !== "Administrador") { show("Acesso restrito a administradores.", "error"); list.innerHTML = ""; return; }
    await load();
    await loadUsers();
  });
})();
