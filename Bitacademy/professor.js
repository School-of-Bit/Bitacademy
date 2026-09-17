(() => {
  const panel = document.querySelector("[data-teacher-panel]");
  if (!panel) return;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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
          <p>Os recursos de materiais, atividades e alunos serão organizados dentro de cada disciplina.</p>
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

        panel.querySelectorAll("[data-subject-action]").forEach((item) => item.disabled = true);
        showSubjectPlaceholder(subject);
      });
    });
  };

  const showSubjectPlaceholder = (subject) => {
    panel.innerHTML = `
      <button type="button" class="teacher-back" data-teacher-back>← Voltar para disciplinas</button>

      <section class="teacher-welcome">
        <div>
          <span class="teacher-label">Disciplina</span>
          <h2>${escapeHtml(subject.name)}</h2>
          <p>Este será o espaço de gestão da disciplina.</p>
        </div>
        <div class="teacher-welcome-icon">📖</div>
      </section>

      <section class="teacher-tabs" aria-label="Seções da disciplina">
        <button class="active" type="button">Visão geral</button>
        <button type="button" disabled>Materiais</button>
        <button type="button" disabled>Atividades</button>
        <button type="button" disabled>Alunos</button>
      </section>

      <section class="teacher-section">
        <div class="teacher-section-heading">
          <div>
            <span class="teacher-label">Próxima etapa</span>
            <h2>Gestão da disciplina</h2>
          </div>
        </div>
        <div class="teacher-feature-grid">
          <article>
            <span>📄</span>
            <h3>Materiais</h3>
            <p>Publique conteúdos complementares para os alunos.</p>
          </article>
          <article>
            <span>📝</span>
            <h3>Atividades</h3>
            <p>Crie avaliações automáticas ou tarefas para correção manual.</p>
          </article>
          <article>
            <span>👥</span>
            <h3>Alunos</h3>
            <p>Acompanhe os estudantes vinculados à disciplina.</p>
          </article>
        </div>
      </section>
    `;

    panel.querySelector("[data-teacher-back]").addEventListener("click", render);
  };

  document.addEventListener("DOMContentLoaded", render);
})();
