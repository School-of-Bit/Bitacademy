window.BitAcademyMotion = (() => {
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPRING_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const BOUNCE_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const resolveElements = (target, root = document) => {
    if (!target) return [];
    if (typeof target === "string") return Array.from(root.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target.length !== undefined) return Array.from(target);
    return [];
  };

  const stagger = (stepSeconds = 0.06, startDelay = 0) => (index) => startDelay + index * stepSeconds;

  const buildKeyframes = (spec) => {
    if (Array.isArray(spec)) return spec;
    const steps = 2;
    const frames = [];
    for (let i = 0; i < steps; i++) {
      const frame = {};
      const transforms = [];
      for (const [key, val] of Object.entries(spec)) {
        const v = Array.isArray(val) ? val[i] ?? val[val.length - 1] : val;
        if (key === "y") transforms.push(`translateY(${typeof v === "number" ? `${v}px` : v})`);
        else if (key === "x") transforms.push(`translateX(${typeof v === "number" ? `${v}px` : v})`);
        else if (key === "scale") transforms.push(`scale(${v})`);
        else if (key === "rotate") transforms.push(`rotate(${typeof v === "number" ? `${v}deg` : v})`);
        else frame[key] = v;
      }
      if (transforms.length) frame.transform = transforms.join(" ");
      frames.push(frame);
    }
    return frames;
  };

  const animate = (target, keyframesSpec, options = {}) => {
    const elements = resolveElements(target, options.root || document);
    if (!elements.length || prefersReducedMotion()) return [];
    const frames = buildKeyframes(keyframesSpec);
    const durationMs = (options.duration ?? 0.45) * 1000;
    const easing = options.type === "spring" ? BOUNCE_EASE : options.easing || SPRING_EASE;

    return elements.map((el, idx) => {
      if (!el || typeof el.animate !== "function") return null;
      const delaySec = typeof options.delay === "function" ? options.delay(idx, elements.length) : (options.delay || 0);
      return el.animate(frames, {
        duration: durationMs,
        delay: delaySec * 1000,
        easing,
        fill: options.fill || "both"
      });
    });
  };

  const inView = (target, callback, options = {}) => {
    const elements = resolveElements(target, options.root || document);
    if (!elements.length) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => callback(el));
      return;
    }
    const once = options.once !== false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.amount ?? 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
  };

  const staggerCards = (container, itemSelector, options = {}) => {
    const rootEl = typeof container === "string" ? document.querySelector(container) : container;
    if (!rootEl) return;
    const items = itemSelector ? Array.from(rootEl.querySelectorAll(itemSelector)) : [rootEl];
    if (!items.length || prefersReducedMotion()) return;
    const yDist = options.y ?? 20;
    const step = options.stagger ?? 0.055;
    animate(
      items,
      { opacity: [0, 1], y: [yDist, 0], scale: [0.97, 1] },
      {
        duration: options.duration ?? 0.46,
        delay: stagger(step, options.startDelay ?? 0),
        easing: SPRING_EASE
      }
    );
  };

  const panelIn = (panel) => {
    const el = typeof panel === "string" ? document.querySelector(panel) : panel;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: 0.36, easing: SPRING_EASE });
  };

  const drawerIn = (drawer) => {
    const el = typeof drawer === "string" ? document.querySelector(drawer) : drawer;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1], y: [-10, 0], scale: [0.985, 1] }, { duration: 0.32, easing: SPRING_EASE });
  };

  const pop = (target, peakScale = 1.14) => {
    const elements = resolveElements(target);
    if (!elements.length || prefersReducedMotion()) return;
    elements.forEach((el) => {
      if (typeof el.animate !== "function") return;
      el.animate(
        [
          { transform: "scale(1)" },
          { transform: `scale(${peakScale})` },
          { transform: "scale(1)" }
        ],
        { duration: 360, easing: BOUNCE_EASE }
      );
    });
  };

  const shake = (target) => {
    const elements = resolveElements(target);
    if (!elements.length || prefersReducedMotion()) return;
    elements.forEach((el) => {
      if (typeof el.animate !== "function") return;
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 380, easing: "ease-in-out" }
      );
    });
  };

  const countUp = (el, endValue, options = {}) => {
    const targetEl = typeof el === "string" ? document.querySelector(el) : el;
    const numeric = Number(endValue);
    if (!targetEl || !Number.isFinite(numeric)) return;
    const suffix = options.suffix || "";
    const decimals = options.decimals ?? 0;
    if (prefersReducedMotion() || numeric === 0) {
      targetEl.textContent = `${numeric.toFixed(decimals)}${suffix}`;
      return;
    }
    const duration = options.duration ?? 720;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = numeric * eased;
      targetEl.textContent = `${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const animateMeters = (root = document) => {
    if (!root || prefersReducedMotion()) return;
    root.querySelectorAll(".grade-meter-fill, .weight-meter-fill").forEach((bar) => {
      const targetWidth = bar.style.width || "0%";
      if (typeof bar.animate === "function") {
        bar.animate([{ width: "0%" }, { width: targetWidth }], {
          duration: 680,
          easing: SPRING_EASE,
          fill: "forwards"
        });
      }
    });
    root.querySelectorAll(".board-chart span").forEach((bar, idx) => {
      const targetHeight = bar.style.height || "50%";
      if (typeof bar.animate === "function") {
        bar.animate([{ height: "12%", opacity: 0.4 }, { height: targetHeight, opacity: 1 }], {
          duration: 640,
          delay: idx * 70,
          easing: BOUNCE_EASE,
          fill: "forwards"
        });
      }
    });
  };

  const initPageAnimations = () => {
    if (prefersReducedMotion()) return;
    // Hero & Study Board
    panelIn(".learning-hero .hero-copy");
    animate(".learning-hero .study-board", { opacity: [0, 1], y: [22, 0], scale: [0.96, 1] }, { duration: 0.55, delay: 0.1 });
    animateMeters(document);

    // Overview cards na Home
    inView(".home-overview", (el) => {
      staggerCards(el, "article", { stagger: 0.08, y: 18 });
    });

    // Seção de trilhas e prática na Home
    inView("#trilhas", (el) => panelIn(el));
    inView(".math-game-banner", (el) => panelIn(el));
    inView(".quiz-Quick-grid", (el) => staggerCards(el, ".quiz-pill-card", { stagger: 0.045, y: 16 }));

    // Página Sobre Nós
    inView(".about-hero", (el) => {
      panelIn(el);
      staggerCards(el, ".about-pillars article", { stagger: 0.08, startDelay: 0.1 });
    });
    inView(".about-story-grid", (el) => staggerCards(el, ".about-story-card", { stagger: 0.1 }));
    inView(".team-grid", (el) => staggerCards(el, ".team-card", { stagger: 0.065 }));

    // Página de Login
    panelIn(".login-card");
    animate(".access-panel", { opacity: [0, 1], x: [18, 0] }, { duration: 0.48, delay: 0.08 });
  };

  return {
    animate,
    stagger,
    inView,
    staggerCards,
    panelIn,
    drawerIn,
    pop,
    shake,
    countUp,
    animateMeters,
    initPageAnimations
  };
})();

