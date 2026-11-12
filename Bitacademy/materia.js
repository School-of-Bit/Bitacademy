(() => {
  const slug = new URLSearchParams(location.search).get("slug") || "";
  const status = document.querySelector("[data-status]");
  const materials = document.querySelector("[data-materials]");
  const resourceList = document.querySelector("[data-subject-resources]");
  const toc = document.querySelector("[data-material-toc]");

  const SUBJECT_ACCENTS = {
    artes: "#ec4899",
    ciencias: "#22c55e",
    filosofia: "#8b5cf6",
    geografia: "#06b6d4",
    historia: "#f59e0b",
    ingles: "#3b82f6",
    matematica: "#f97316",
    portugues: "#ef4444"
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (value) => new Date(value).toLocaleDateString("pt-BR", { dateStyle: "medium" });

  const safeExternalUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };

  const estimateReadingMinutes = (text) => {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 180));
  };

  const load = async () => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      status.textContent = "Endereço de disciplina inválido.";
      return;
    }

    if (SUBJECT_ACCENTS[slug]) {
      document.body.style.setProperty("--subject-accent", SUBJECT_ACCENTS[slug]);
    }

    try {
      const response = await fetch(`/api/academic?action=published&subject=${encodeURIComponent(slug)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a disciplina.");

      document.title = `${data.subject.name} — BitAcademy`;
      document.querySelector("[data-subject-name]").textContent = data.subject.name;
      document.querySelector("[data-subject-icon]").textContent = data.subject.icon || "📘";
      document.querySelector("[data-subject-description]").textContent = data.subject.description || "Conteúdos e materiais para estudar esta disciplina.";

      try {
        const resourceResponse = await fetch(`/api/academic?action=resources&subject=${encodeURIComponent(slug)}`);
        const resourceData = await resourceResponse.json();
        if (!resourceResponse.ok) throw new Error(resourceData.error || "Falha ao carregar recursos.");
        const resources = resourceData.resources || [];
        resourceList.innerHTML = resources.length
          ? resources.map((item) => `
              <article class="material-card resource-card">
                <div>
                  <p class="resource-type">${item.resource_type === "game" ? "🎮 Jogo Competitivo" : "📝 Quiz de Fixação"}</p>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description || "Pratique o conteúdo desta disciplina.")}</p>
                </div>
                <a href="${escapeHtml(item.html_path)}">${item.resource_type === "game" ? "Jogar agora" : "Fazer quiz"} →</a>
              </article>
            `).join("")
          : '<p class="empty-state">Ainda não há quizzes ou jogos cadastrados nesta disciplina.</p>';
      } catch {
        resourceList.innerHTML = '<p class="empty-state">Não foi possível carregar os quizzes e jogos.</p>';
      }

      const rows = data.materials || [];
      document.querySelector("[data-material-count]").textContent = `${rows.length} ${rows.length === 1 ? "material" : "materiais"}`;

      if (!rows.length) {
        status.textContent = "Ainda não há materiais publicados nesta disciplina.";
        materials.innerHTML = '<div class="empty-state">O professor ainda não publicou materiais para esta disciplina. Volte em breve.</div>';
        return;
      }

      if (toc && rows.length > 1) {
        toc.hidden = false;
        toc.innerHTML = `
          <span class="material-toc-label">Tópicos:</span>
          ${rows.map((item, idx) => `<a href="#material-${idx + 1}">${escapeHtml(item.title)}</a>`).join("")}
        `;
      }

      status.textContent = "Materiais preparados pelos professores desta disciplina.";
      materials.innerHTML = rows.map((item, idx) => {
        const link = safeExternalUrl(item.link);
        const minutes = estimateReadingMinutes(item.content);
        return `
          <article id="material-${idx + 1}" class="material-card">
            <div class="material-card-header">
              <h3>${escapeHtml(item.title)}</h3>
              <span class="reading-badge">⏱️ ~${minutes} min de leitura</span>
            </div>
            <div class="material-content">${escapeHtml(item.content)}</div>
            <div class="material-meta">
              <span>👨‍🏫 Responsável: ${escapeHtml(item.teacher_name)}</span>
              <span>📅 Publicado em ${escapeHtml(formatDate(item.published_at))}</span>
            </div>
            ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Abrir material complementar ↗</a>` : ""}
          </article>
        `;
      }).join("");
    } catch (error) {
      status.textContent = error.message;
      materials.innerHTML = "";
    }
  };
  load();
})();
