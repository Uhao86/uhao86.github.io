(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector("[data-language-toggle]");
  const themeButton = document.querySelector("[data-theme-toggle]");

  const applyLanguage = (language) => {
    root.dataset.lang = language;
    root.lang = language === "zh" ? "zh-CN" : "en";
    localStorage.setItem("site-language", language);
  };

  languageButton?.addEventListener("click", () => {
    const next = root.dataset.lang === "zh" ? "en" : "zh";
    const target = languageButton.getAttribute(`data-translation-${next}`);
    const contentLanguage = languageButton.getAttribute("data-content-lang");

    if (contentLanguage) {
      if (target && contentLanguage !== next) {
        localStorage.setItem("site-language", next);
        window.location.href = target;
      } else if (!target) {
        languageButton.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-2px)" },
            { transform: "translateX(2px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 220, easing: "ease-out" },
        );
      }
      return;
    }

    applyLanguage(next);
  });

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("site-theme", theme);
  };

  themeButton?.addEventListener("click", async () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canReveal = typeof document.startViewTransition === "function" && !reduceMotion;

    if (!canReveal) {
      applyTheme(next);
      return;
    }

    const bounds = themeButton.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => applyTheme(next));
    await transition.ready;

    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      },
      {
        duration: 1050,
        easing: "cubic-bezier(.22, .78, .26, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
})();
