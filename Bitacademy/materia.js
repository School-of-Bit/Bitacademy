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
      const subjectIconEl = document.querySelector("[data-subject-icon]");
      if (subjectIconEl && window.BitAcademyIcons) {
        subjectIconEl.innerHTML = window.BitAcademyIcons.forSubject(slug, data.subject.icon, 28);
      } else if (subjectIconEl) {
        subjectIconEl.textContent = data.subject.icon || "📘";
      }
      document.querySelector("[data-subject-description]").textContent = data.subject.description || "Conteúdos e materiais para estudar esta disciplina.";
      window.BitAcademyMotion?.panelIn(".material-hero");

      const SUBJECT_ARCADE_GAMES = {
        portugues: {
          resource_type: "game",
          title: "Termo Escolar",
          description: "Descubra palavras de 5 letras do vocabulário de Português em até 6 tentativas com feedback colorido e ranking oficial.",
          html_path: "Jogos/jogo.html?mode=portugues-termo"
        },
        ingles: {
          resource_type: "game",
          title: "Word Match Bilíngue",
          description: "Jogo da memória 3D para parear vocabulário e verbos em Inglês ↔ Português com bônus de combo.",
          html_path: "Jogos/jogo.html?mode=ingles-match"
        },
        historia: {
          resource_type: "game",
          title: "Antes ou Depois?",
          description: "Decida se cada marco histórico aconteceu antes ou depois do evento de referência e construa sua linha do tempo.",
          html_path: "Jogos/jogo.html?mode=historia-cronologia"
        },
        geografia: {
          resource_type: "game",
          title: "GeoRadar",
          description: "Desafio de capitais mundiais, estados brasileiros e biomas com 3 vidas e sistema de dicas 50/50.",
          html_path: "Jogos/jogo.html?mode=geografia-radar"
        },
        ciencias: {
          resource_type: "game",
          title: "Lab Relâmpago",
          description: "Classifique fenômenos físicos/químicos, tabela periódica e sistemas do corpo antes de o tempo acabar.",
          html_path: "Jogos/jogo.html?mode=ciencias-lab"
        },
        artes: {
          resource_type: "game",
          title: "Estúdio Cromático",
          description: "Misture canais de luz RGB para recriar tons-alvo em tempo real e identifique movimentos artísticos.",
          html_path: "Jogos/jogo.html?mode=artes-estudio"
        },
        filosofia: {
          resource_type: "game",
          title: "Oráculo Filosófico",
          description: "Desvende grandes pensadores usando pistas progressivas — quanto menos pistas usar, maior sua pontuação.",
          html_path: "Jogos/jogo.html?mode=filosofia-oraculo"
        }
      };

      try {
        const resourceResponse = await fetch(`/api/academic?action=resources&subject=${encodeURIComponent(slug)}`);
        const resourceData = await resourceResponse.json();
        if (!resourceResponse.ok) throw new Error(resourceData.error || "Falha ao carregar recursos.");
        const resources = [...(resourceData.resources || [])];
        const builtInGame = SUBJECT_ARCADE_GAMES[slug];
        if (builtInGame && !resources.some((r) => r.html_path === builtInGame.html_path)) {
          resources.unshift(builtInGame);
        }
        resourceList.innerHTML = resources.length
          ? resources.map((item) => `
              <article class="material-card resource-card">
                <div>
                  <p class="resource-type">${item.resource_type === "game" ? '<i data-lucide="gamepad-2" data-lucide-size="16"></i> Jogo Competitivo' : '<i data-lucide="clipboard-check" data-lucide-size="16"></i> Quiz de Fixação'}</p>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description || "Pratique o conteúdo desta disciplina.")}</p>
                </div>
                <a href="${escapeHtml(item.html_path)}">${item.resource_type === "game" ? "Jogar agora" : "Fazer quiz"} <i data-lucide="arrow-right" data-lucide-size="16"></i></a>
              </article>
            `).join("")
          : '<p class="empty-state">Ainda não há quizzes ou jogos cadastrados nesta disciplina.</p>';
        window.BitAcademyMotion?.staggerCards(resourceList, ".resource-card", { stagger: 0.06, y: 16 });
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
              <span class="reading-badge"><i data-lucide="clock" data-lucide-size="14"></i> ~${minutes} min de leitura</span>
            </div>
            <div class="material-content">${escapeHtml(item.content)}</div>
            <div class="material-meta">
              <span><i data-lucide="graduation-cap" data-lucide-size="15"></i> Responsável: ${escapeHtml(item.teacher_name)}</span>
              <span><i data-lucide="calendar" data-lucide-size="15"></i> Publicado em ${escapeHtml(formatDate(item.published_at))}</span>
            </div>
            ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Abrir material complementar <i data-lucide="external-link" data-lucide-size="15"></i></a>` : ""}
          </article>
        `;
      }).join("");
      window.BitAcademyMotion?.staggerCards(materials, ".material-card", { stagger: 0.07, y: 20 });
    } catch (error) {
      status.textContent = error.message;
      materials.innerHTML = "";
    }
  };
  load();
})();
