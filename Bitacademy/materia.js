(() => {
  const legacyPages = {
    artes: "artes.html", ciencias: "ciencias.html", filosofia: "filosofia.html",
    geografia: "geografia.html", historia: "historia.html", ingles: "ingles.html",
    matematica: "matematica.html", portugues: "portugues.html"
  };
  const quizPages = {
    artes: "Quiz/quiz-artes.html", ciencias: "Quiz/quiz-ciencias.html", filosofia: "Quiz/quiz-filosofia.html",
    geografia: "Quiz/quiz-geografia.html", historia: "Quiz/quiz-historia.html", ingles: "Quiz/quiz-ingles.html",
    matematica: "Quiz/quiz-matematica.html", portugues: "Quiz/quiz-portugues.html"
  };
  const slug = new URLSearchParams(location.search).get("slug") || "";
  const status = document.querySelector("[data-status]");
  const materials = document.querySelector("[data-materials]");
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const formatDate = (value) => new Date(value).toLocaleDateString("pt-BR", { dateStyle: "medium" });
  const safeExternalUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };

  const load = async () => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      status.textContent = "Endereço de disciplina inválido.";
      return;
    }
    try {
      const response = await fetch(`/api/academic?action=published&subject=${encodeURIComponent(slug)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a disciplina.");

      document.title = `${data.subject.name} - BitAcademy`;
      document.querySelector("[data-subject-name]").textContent = data.subject.name;
      document.querySelector("[data-subject-icon]").textContent = data.subject.icon || "📘";
      document.querySelector("[data-subject-description]").textContent = data.subject.description || "Conteúdos e materiais para estudar esta disciplina.";
      const legacyLink = document.querySelector("[data-legacy-link]");
      if (legacyPages[slug]) { legacyLink.href = legacyPages[slug]; legacyLink.hidden = false; }
      const quizLink = document.querySelector("[data-quiz-link]");
      if (quizPages[slug]) { quizLink.href = quizPages[slug]; quizLink.hidden = false; }

      const rows = data.materials || [];
      document.querySelector("[data-material-count]").textContent = `${rows.length} ${rows.length === 1 ? "material" : "materiais"}`;
      if (!rows.length) {
        status.textContent = "Ainda não há materiais publicados nesta disciplina.";
        materials.innerHTML = legacyPages[slug] ? '<div class="empty-state">Enquanto o professor prepara novos materiais, você pode consultar o conteúdo original desta disciplina pelo botão acima.</div>' : '<div class="empty-state">O professor ainda não publicou materiais para esta disciplina. Volte em breve.</div>';
        return;
      }
      status.textContent = "Materiais preparados pelos professores desta disciplina.";
      materials.innerHTML = rows.map((item) => {
        const link = safeExternalUrl(item.link);
        return `
          <article class="material-card">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="material-content">${escapeHtml(item.content)}</div>
            <div class="material-meta"><span>Professor(a): ${escapeHtml(item.teacher_name)}</span><span>Publicado em ${escapeHtml(formatDate(item.published_at))}</span></div>
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
