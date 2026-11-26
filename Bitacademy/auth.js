window.BitAcademyAuth = (() => {
  let currentUser = null;
  let profileData = null;

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const getRelativePrefix = () => {
    const path = window.location.pathname;
    return path.includes("/Quiz/") || path.includes("/Jogos/") ? "../" : "";
  };
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const api = async (path, options = {}) => {
    const response = await fetch(`${getRelativePrefix()}api/${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });

    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || "Ocorreu um erro na comunicação com o servidor.");
    return data;
  };

  const loadCurrentUser = async () => {
    try {
      const data = await api("auth/me");
      currentUser = data.user || null;
    } catch {
      currentUser = null;
    }
    return currentUser;
  };

  const ready = loadCurrentUser();

  const getCurrentUser = () => currentUser;

  const register = async ({ name, email, password }) => {
    const data = await api("auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(name || "").trim(),
        email: normalize(email),
        password
      })
    });
    currentUser = data.user;
    return currentUser;
  };

  const login = async ({ email, password }) => {
    const data = await api("auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalize(email), password })
    });
    currentUser = data.user;
    return currentUser;
  };

  const logout = async () => {
    try { await api("auth/logout", { method: "POST" }); } catch {}
    currentUser = null;
    window.location.href = `${getRelativePrefix()}login.html`;
  };

  const getQuizQuestions = async (materia) => api(`quizzes?action=questions&${new URLSearchParams({ materia })}`);
  const recordQuizResult = async ({ materia, token, answers }) => {
    const data = await api("quizzes?action=result", {
      method: "POST",
      body: JSON.stringify({ materia, token, answers })
    });
    profileData = null;
    return data.result;
  };

  const getQuizRanking = async (materia, limit = 10) => {
    const params = new URLSearchParams({ materia, limit: String(limit) });
    const data = await api(`quizzes?action=ranking&${params}`);
    return data.ranking || [];
  };

  const getProgress = async () => {
    if (!currentUser) return [];
    if (!profileData) {
      profileData = await api("profile");
    }
    return profileData.quizResults || [];
  };

  const startGame = async () => {
    return api("games?action=start", {
      method: "POST",
      body: JSON.stringify({ mode: "math-infinite" })
    });
  };

  const submitGameAnswer = async ({ sessionId, answer, revision }) => {
    return api("games?action=answer", {
      method: "POST",
      body: JSON.stringify({ sessionId, answer, revision })
    });
  };

  const finishGame = async (sessionId) => {
    return api("games?action=finish", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const abortGame = async (sessionId) => {
    return api("games?action=abort", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    });
  };

  const getGameRanking = async (mode, limit = 10) => {
    const params = new URLSearchParams({ mode, limit: String(limit) });
    const data = await api(`games?action=ranking&${params}`);
    return data.ranking || [];
  };

  const getUserGameScores = async () => {
    if (!currentUser) return [];
    if (!profileData) profileData = await api("profile");
    return profileData.gameScores || [];
  };

  const renderAuthStatus = () => {
    document.querySelectorAll("[data-auth-status]").forEach((container) => {
      const user = getCurrentUser();
      const prefix = getRelativePrefix();
      if (!user) {
        container.innerHTML = `<a href="${prefix}login.html"><i data-lucide="log-in" data-lucide-size="16"></i> Entrar</a>`;
        return;
      }
      const firstName = escapeHtml(user.name.split(" ")[0]);
      const areaByRole = {
        Professor: { href: "professor.html", label: "Área do Professor", icon: "graduation-cap" },
        Administrador: { href: "admin.html", label: "Painel Admin", icon: "shield-check" }
      };
      const roleArea = areaByRole[user.type];
      const currentPage = window.location.pathname.split("/").pop().toLowerCase();
      const areaLink = roleArea && currentPage !== roleArea.href
        ? `<a class="auth-role-link" href="${prefix}${roleArea.href}"><i data-lucide="${roleArea.icon}" data-lucide-size="15"></i> ${roleArea.label}</a>`
        : "";
      container.innerHTML = `
        <a class="auth-user-pill" href="${prefix}perfil.html">
          ${window.BitAcademyIcons.avatar(user.name || user.email, 24, "auth-avatar-mini")}
          <span>Olá, ${firstName}</span>
          <span class="auth-role-badge">${escapeHtml(user.type)}</span>
        </a>
        ${areaLink}
        <button type="button" data-auth-logout><i data-lucide="log-out" data-lucide-size="15"></i> Sair</button>
      `;
    });
  };

  const renderProfile = window.createBitAcademyProfile({ api, ready, getCurrentUser, escapeHtml,
    setProfileData: value => { profileData = value; } });

  const bindLoginPage = () => {
    const tabs = document.querySelectorAll("[data-auth-tab]");
    const panels = document.querySelectorAll("[data-auth-panel]");
    const messageBox = document.querySelector("[data-auth-message-box]");
    const messageIcon = document.querySelector("[data-auth-message-icon]");
    const message = document.querySelector("[data-auth-message]");
    const recoveryNotice = document.querySelector("[data-recovery-notice]");
    if (!tabs.length && !panels.length) return;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setBannerMessage = (text, type = "error") => {
      if (!message) return;
      message.textContent = text || "";
      if (!messageBox) return;
      if (!text) {
        messageBox.hidden = true;
        messageBox.className = "form-message-banner";
        return;
      }
      messageBox.hidden = false;
      messageBox.className = `form-message-banner is-${type}`;
      if (messageIcon) {
        const iconName = type === "success" ? "check-circle-2" : "alert-circle";
        messageIcon.innerHTML = window.BitAcademyIcons.svg(iconName, 18);
      }
      window.BitAcademyMotion?.drawerIn(messageBox);
    };

    const getFieldGroup = (input) => input?.closest(".field-group");

    const clearFieldState = (input) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-error", "is-valid");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) statusEl.innerHTML = "";
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl && !errorEl.hasAttribute("data-match-status")) {
        errorEl.textContent = "";
      }
    };

    const setFieldError = (input, errorText, shouldShake = true) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-valid");
      group.classList.add("is-error");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) {
        statusEl.innerHTML = window.BitAcademyIcons.svg("alert-circle", 17);
      }
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl) {
        errorEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>${escapeHtml(errorText)}</span>`;
      }
      if (shouldShake) {
        const target = group.querySelector(".input-with-icon") || group;
        window.BitAcademyMotion?.shake(target);
      }
    };

    const setFieldValid = (input) => {
      const group = getFieldGroup(input);
      if (!group) return;
      group.classList.remove("is-error");
      group.classList.add("is-valid");
      const statusEl = group.querySelector("[data-input-status]");
      if (statusEl) {
        statusEl.innerHTML = window.BitAcademyIcons.svg("check-circle-2", 17);
        window.BitAcademyMotion?.pop(statusEl);
      }
      const errorEl = group.querySelector("[data-field-error]");
      if (errorEl && !errorEl.hasAttribute("data-match-status")) {
        errorEl.textContent = "";
      }
    };

    const evaluatePasswordRules = (pwd) => {
      const byteLength = new TextEncoder().encode(pwd).length;
      return {
        length: pwd.length >= 8 && byteLength <= 72,
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        number: /\d/.test(pwd),
        symbol: /[^A-Za-z0-9À-ÿ]/.test(pwd)
      };
    };

    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authTab === target));
      panels.forEach((panel) => {
        const isMatch = panel.dataset.authPanel === target;
        panel.hidden = !isMatch;
        if (isMatch) window.BitAcademyMotion?.panelIn(panel);
      });
      setBannerMessage("");
      if (recoveryNotice) recoveryNotice.hidden = true;
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.authTab)));

    document.querySelector("[data-forgot-password]")?.addEventListener("click", () => {
      if (recoveryNotice) {
        recoveryNotice.hidden = !recoveryNotice.hidden;
        if (!recoveryNotice.hidden) window.BitAcademyMotion?.drawerIn(recoveryNotice);
      }
      setBannerMessage("");
    });

    // Toggle Mostrar / Ocultar senha com ícones eye e eye-off
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.innerHTML = `${window.BitAcademyIcons.svg(show ? "eye-off" : "eye", 16)} <span>${show ? "Ocultar" : "Mostrar"}</span>`;
        button.setAttribute("aria-label", `${show ? "Ocultar" : "Mostrar"} senha`);
        window.BitAcademyMotion?.pop(button);
      });
    });

    // Detector de Caps Lock em campos de senha
    document.querySelectorAll('.login-form input[type="password"]').forEach((pwdInput) => {
      const group = getFieldGroup(pwdInput);
      const capsWarning = group?.querySelector("[data-caps-warning]");
      if (!capsWarning) return;
      const checkCaps = (event) => {
        if (typeof event.getModifierState !== "function") return;
        const isCaps = event.getModifierState("CapsLock");
        capsWarning.hidden = !isCaps;
      };
      pwdInput.addEventListener("keydown", checkCaps);
      pwdInput.addEventListener("keyup", checkCaps);
      pwdInput.addEventListener("blur", () => { capsWarning.hidden = true; });
    });

    // Validação guiada em tempo real para campos de Nome e E-mail
    document.querySelectorAll('#login-email, #cadastro-email').forEach((emailInput) => {
      emailInput.addEventListener("input", () => {
        const val = emailInput.value.trim();
        if (!val) {
          clearFieldState(emailInput);
          return;
        }
        if (EMAIL_REGEX.test(val)) {
          setFieldValid(emailInput);
        } else if (getFieldGroup(emailInput)?.classList.contains("is-error")) {
          clearFieldState(emailInput);
        }
      });
      emailInput.addEventListener("blur", () => {
        const val = emailInput.value.trim();
        if (!val) return;
        if (!EMAIL_REGEX.test(val)) {
          setFieldError(emailInput, "Informe um e-mail válido (ex.: nome@escola.com).", false);
        } else {
          setFieldValid(emailInput);
        }
      });
    });

    const registerNameInput = document.getElementById("cadastro-nome");
    if (registerNameInput) {
      registerNameInput.addEventListener("input", () => {
        const val = registerNameInput.value.trim();
        if (val.length >= 3) {
          setFieldValid(registerNameInput);
        } else {
          clearFieldState(registerNameInput);
        }
      });
      registerNameInput.addEventListener("blur", () => {
        const val = registerNameInput.value.trim();
        if (val && val.length < 2) {
          setFieldError(registerNameInput, "Digite seu nome e sobrenome (mínimo 2 caracteres).", false);
        }
      });
    }

    const loginPwdInput = document.getElementById("login-senha");
    if (loginPwdInput) {
      loginPwdInput.addEventListener("input", () => {
        if (loginPwdInput.value.length > 0) clearFieldState(loginPwdInput);
      });
    }

    // Medidor de força de senha + Checklist interativo + Confirmação em tempo real
    const registerPwdInput = document.getElementById("cadastro-senha");
    const confirmPwdInput = document.getElementById("cadastro-confirma-senha");
    const checklistEl = document.querySelector("[data-password-checklist]");
    const strengthBarsEl = document.querySelector("[data-strength-bars]");
    const strengthLabelEl = document.querySelector("[data-strength-label]");
    const matchStatusEl = document.querySelector("[data-match-status]");

    const updateConfirmMatch = () => {
      if (!confirmPwdInput || !registerPwdInput || !matchStatusEl) return;
      const pwd = registerPwdInput.value;
      const confirm = confirmPwdInput.value;
      const group = getFieldGroup(confirmPwdInput);
      if (!confirm) {
        group?.classList.remove("is-error", "is-valid");
        matchStatusEl.textContent = "";
        return;
      }
      if (pwd === confirm) {
        group?.classList.remove("is-error");
        group?.classList.add("is-valid");
        matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("check-circle-2", 13)} <span>As senhas coincidem perfeitamente</span>`;
      } else {
        group?.classList.remove("is-valid");
        group?.classList.add("is-error");
        matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>As senhas ainda não coincidem</span>`;
      }
    };

    if (registerPwdInput) {
      registerPwdInput.addEventListener("input", () => {
        const pwd = registerPwdInput.value;
        const rules = evaluatePasswordRules(pwd);
        const passedCount = Object.values(rules).filter(Boolean).length;

        if (checklistEl) {
          Object.entries(rules).forEach(([ruleKey, isMet]) => {
            const item = checklistEl.querySelector(`[data-rule="${ruleKey}"]`);
            if (!item) return;
            const wasMet = item.classList.contains("is-met");
            item.classList.toggle("is-met", isMet);
            const iconHolder = item.querySelector(".rule-icon");
            if (iconHolder) {
              iconHolder.innerHTML = window.BitAcademyIcons.svg(isMet ? "check-circle-2" : "circle", 13);
              if (isMet && !wasMet) window.BitAcademyMotion?.pop(iconHolder);
            }
          });
        }

        let level = 0;
        let label = "Força da senha";
        if (pwd.length > 0) {
          if (passedCount <= 2) {
            level = 1;
            label = "Senha fraca";
          } else if (passedCount === 3) {
            level = 2;
            label = "Senha razoável";
          } else if (passedCount === 4) {
            level = 3;
            label = "Senha boa";
          } else if (passedCount === 5) {
            level = 4;
            label = "Senha forte";
          }
        }

        if (strengthBarsEl) {
          strengthBarsEl.dataset.level = String(level);
        }
        if (strengthLabelEl) {
          strengthLabelEl.textContent = label;
          strengthLabelEl.dataset.level = String(level);
        }

        const group = getFieldGroup(registerPwdInput);
        if (passedCount === 5) {
          group?.classList.remove("is-error");
          group?.classList.add("is-valid");
          const errEl = group?.querySelector("[data-field-error]");
          if (errEl) errEl.textContent = "";
        } else if (group?.classList.contains("is-valid")) {
          group.classList.remove("is-valid");
        }

        if (confirmPwdInput?.value) updateConfirmMatch();
      });
    }

    if (confirmPwdInput) {
      confirmPwdInput.addEventListener("input", updateConfirmMatch);
    }

    // Submit do Login com validação guiada por campo
    document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const emailInput = form.email;
      const pwdInput = form.senha;
      const submitBtn = form.querySelector("[data-submit-btn]");
      setBannerMessage("");

      let hasError = false;
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        setFieldError(emailInput, "Digite seu e-mail para continuar.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        setFieldError(emailInput, "Formato de e-mail inválido (ex.: aluno@escola.com).");
        hasError = true;
      } else {
        setFieldValid(emailInput);
      }

      if (!pwdInput.value) {
        setFieldError(pwdInput, "Digite sua senha de acesso.");
        hasError = true;
      } else {
        clearFieldState(pwdInput);
      }

      if (hasError) {
        setBannerMessage("Verifique os campos destacados em vermelho antes de entrar.", "error");
        const firstErr = form.querySelector(".field-group.is-error input");
        firstErr?.focus();
        return;
      }

      const originalBtnHtml = submitBtn?.innerHTML;
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `${window.BitAcademyIcons.svg("refresh-cw", 18, "spin-icon")} <span>Autenticando...</span>`;
        }
        const user = await login({ email: emailVal, password: pwdInput.value });
        setBannerMessage(`Bem-vindo(a), ${user.name}! Redirecionando...`, "success");
        window.location.href = user.type === "Administrador" ? "admin.html" : user.type === "Professor" ? "professor.html" : "perfil.html";
      } catch (error) {
        if (submitBtn && originalBtnHtml) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        setBannerMessage(error.message || "E-mail ou senha incorretos.", "error");
        setFieldError(pwdInput, "Confira se a senha e o e-mail estão corretos.", false);
        window.BitAcademyMotion?.shake(form);
        pwdInput.focus();
      }
    });

    // Submit do Cadastro com validação guiada por campo
    document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const nameInput = form.nome;
      const emailInput = form.email;
      const pwdInput = form.senha;
      const confirmInput = form.confirmaSenha;
      const submitBtn = form.querySelector("[data-submit-btn]");
      setBannerMessage("");

      let hasError = false;
      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const password = pwdInput.value;
      const confirmation = confirmInput.value;

      if (!nameVal || nameVal.length < 2) {
        setFieldError(nameInput, "Informe seu nome completo (mínimo 2 caracteres).");
        hasError = true;
      } else {
        setFieldValid(nameInput);
      }

      if (!emailVal) {
        setFieldError(emailInput, "Informe um e-mail para sua conta.");
        hasError = true;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        setFieldError(emailInput, "Informe um e-mail válido (ex.: nome@escola.com).");
        hasError = true;
      } else {
        setFieldValid(emailInput);
      }

      const rules = evaluatePasswordRules(password);
      const strongPassword = Object.values(rules).every(Boolean);
      if (!strongPassword) {
        setFieldError(pwdInput, "Complete todos os 5 requisitos da lista acima para proteger sua conta.");
        hasError = true;
      }

      if (!confirmation || password !== confirmation) {
        const group = getFieldGroup(confirmInput);
        group?.classList.remove("is-valid");
        group?.classList.add("is-error");
        if (matchStatusEl) {
          matchStatusEl.innerHTML = `${window.BitAcademyIcons.svg("alert-circle", 13)} <span>As senhas não coincidem. Digite a mesma senha nos dois campos.</span>`;
        }
        window.BitAcademyMotion?.shake(group?.querySelector(".input-with-icon") || group);
        hasError = true;
      }

      if (hasError) {
        setBannerMessage("Revise os campos destacados para concluir seu cadastro.", "error");
        const firstErr = form.querySelector(".field-group.is-error input");
        firstErr?.focus();
        return;
      }

      const originalBtnHtml = submitBtn?.innerHTML;
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `${window.BitAcademyIcons.svg("refresh-cw", 18, "spin-icon")} <span>Criando sua conta...</span>`;
        }
        await register({
          name: nameVal,
          email: emailVal,
          password
        });
        setBannerMessage("Conta criada com sucesso! Acessando seu perfil...", "success");
        window.location.href = "perfil.html";
      } catch (error) {
        if (submitBtn && originalBtnHtml) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        setBannerMessage(error.message || "Não foi possível criar a conta.", "error");
        if (String(error.message || "").toLowerCase().includes("e-mail")) {
          setFieldError(emailInput, error.message);
        } else {
          window.BitAcademyMotion?.shake(form);
        }
      }
    });
  };

  const bindHomeTabs = () => {
    const tabs = document.querySelectorAll("[data-home-tab]");
    const panels = document.querySelectorAll("[data-home-panel]");
    if (!tabs.length || !panels.length) return;
    const showPanel = (target) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.homeTab === target));
      panels.forEach((panel) => {
        const active = panel.dataset.homePanel === target;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
        if (active) {
          window.BitAcademyMotion?.panelIn(panel);
          window.BitAcademyMotion?.staggerCards(panel, ".subject-preview span", { stagger: 0.06, y: 10 });
        }
      });
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.homeTab)));
  };

  const loadSubjectCatalog = async () => {
    const grid = document.querySelector("[data-subject-catalog]");
    if (!grid) return;
    const status = document.querySelector("[data-subject-catalog-status]");
    try {
      const data = await api("academic?action=subjects");
      const subjects = data.subjects || [];
      grid.innerHTML = subjects.length ? subjects.map((subject) => `
        <article class="subject-card" data-accent="${escapeHtml(subject.slug)}">
          <span class="subject-icon">${window.BitAcademyIcons.forSubject(subject.slug, subject.icon, 24)}</span>
          <strong>${escapeHtml(subject.name)}</strong>
          <span>${escapeHtml(subject.description || "Conteúdos e materiais para estudar esta disciplina.")}</span>
          <a href="materia.html?slug=${encodeURIComponent(subject.slug)}">Estudar <i data-lucide="arrow-right" data-lucide-size="16"></i></a>
        </article>
      `).join("") : '<p>Nenhuma disciplina disponível no momento.</p>';
      const count = document.querySelector("[data-overview-subjects], .home-overview article:first-child strong");
      if (count) {
        count.textContent = subjects.length;
        window.BitAcademyMotion?.countUp(count, subjects.length);
      }
      if (status) status.textContent = `${subjects.length} disciplinas sincronizadas do catálogo.`;
      window.BitAcademyMotion?.inView(grid, () => window.BitAcademyMotion?.staggerCards(grid, ".subject-card", { stagger: 0.055 }));
    } catch (error) {
      if (status) status.textContent = "Exibindo as disciplinas disponíveis no portal.";
      window.BitAcademyMotion?.inView(grid, () => window.BitAcademyMotion?.staggerCards(grid, ".subject-card", { stagger: 0.055 }));
      console.warn("Não foi possível carregar o catálogo de disciplinas:", error.message);
    }
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-auth-logout]")) logout();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    window.BitAcademyMotion?.initPageAnimations();
    await ready;
    bindLoginPage();
    bindHomeTabs();
    renderAuthStatus();
    loadSubjectCatalog();
    await renderProfile();
  });

  return {
    ready,
    getCurrentUser,
    renderAuthStatus,
    getGameRanking,
    getProgress,
    getQuizRanking,
    getQuizQuestions,
    startGame,
    submitGameAnswer,
    finishGame,
    abortGame,
    login,
    logout,
    recordQuizResult,
    register,
    getUserGameScores
  };
})();
