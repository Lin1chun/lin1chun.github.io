(() => {
    "use strict";

    const container = document.querySelector("[data-giscus-comments]");
    if (!container) return;
    let ready = false;
    const themeBase = container.dataset.themeBase;

    const theme = () => {
        const dark = document.body.dataset.scheme === "dark"
            || document.documentElement.classList.contains("dark")
            || window.matchMedia("(prefers-color-scheme: dark)").matches;
        const contrast = document.body.dataset.contrast;
        const mode = dark ? "dark" : "light";
        const variant = contrast === "more"
            ? "-more"
            : (contrast === "less" ? "-less" : "");

        return `${themeBase}/${mode}${variant}.css`;
    };

    const applyTheme = () => {
        if (!ready) return;
        const frame = container.querySelector("iframe.giscus-frame");
        if (!frame) return;
        frame.contentWindow?.postMessage({
            giscus: {
                setConfig: { theme: theme() }
            }
        }, "https://giscus.app");
    };

    const observeFrame = () => {
        const observer = new MutationObserver(() => {
            const frame = container.querySelector("iframe.giscus-frame");
            if (!frame || frame.dataset.themeBound === "true") return;
            frame.dataset.themeBound = "true";
        });
        observer.observe(container, { childList: true, subtree: true });
    };

    window.addEventListener("message", (event) => {
        if (event.origin !== "https://giscus.app") return;
        if (!event.data?.giscus) return;
        ready = true;
        applyTheme();
    });

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "style", "data-scheme", "data-contrast"]
    });
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
    });

    observeFrame();
})();
