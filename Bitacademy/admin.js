(() => {
  const list = document.querySelector("[data-teachers]");
  const message = document.querySelector("[data-message]");
  let subjects = [];
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const api = async (action, options) => {
    const response = await fetch(`/api/admin${action ? `?action=${encodeURIComponent(action)}` : ""}`, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
    let data = {}; try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
    return data;
  };
  const show = (text, type = "") => { message.textContent = text; message.className = `message ${type}`; };
  const load = async () => {
    show("Carregando dados administrativos...");
    try {
      const data = await api("dashboard");
      subjects = data.subjects || [];
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
    if (!event.target.matches(".assign-form")) return;
    event.preventDefault();
    const card = event.target.closest("[data-teacher]");
    try { await api("assign-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: event.target.querySelector("select").value }) }); await load(); }
    catch (error) { show(error.message, "error"); }
  });
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-remove]"); if (!button) return;
    const card = button.closest("[data-teacher]");
    try { await api("remove-subject", { method: "POST", body: JSON.stringify({ teacherId: card.dataset.teacher, subjectId: button.dataset.remove }) }); await load(); }
    catch (error) { show(error.message, "error"); }
  });
  document.querySelector("[data-refresh]").addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", async () => {
    await window.BitAcademyAuth.ready;
    const user = window.BitAcademyAuth.getCurrentUser();
    if (!user) { location.href = "login.html"; return; }
    if (user.type !== "Administrador") { show("Acesso restrito a administradores.", "error"); list.innerHTML = ""; return; }
    await load();
  });
})();
