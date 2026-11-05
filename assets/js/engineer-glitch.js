(() => {
    "use strict";

    const root = document.querySelector(".engineer-glitch");
    if (!root) return;
    document.documentElement.classList.add("engineer-glitch-page");

    const stage = root.querySelector(".engineer-glitch__stage");
    const base = root.querySelector(".engineer-glitch__base");
    const layers = [...root.querySelectorAll(".engineer-glitch__corrupt")];
    const pixels = root.querySelector(".engineer-glitch__pixels");
    if (!stage || !base || !layers.length || !pixels || typeof stage.animate !== "function") return;

    const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce), (prefers-contrast: more), (forced-colors: active)"
    );
    const originalText = base.textContent.trim();
    const corruptGlyphs = "01#$%&?/\\[]{}<>_█▓▒░";
    const typefaces = [
        '"Courier New", monospace',
        'Georgia, "Times New Roman", serif',
        'Arial, Helvetica, sans-serif',
        'Impact, Haettenschweiler, sans-serif',
    ];

    let burstTimer = 0;
    let followupTimer = 0;
    let activeAnimations = [];

    const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = (items) => items[randomBetween(0, items.length - 1)];
    const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
    const stepped = (frames) =>
        frames.map((frame, index) =>
            index === frames.length - 1 ? frame : { ...frame, easing: "steps(1, end)" }
        );

    const stopAnimations = () => {
        activeAnimations.forEach((animation) => animation.cancel());
        activeAnimations = [];
    };

    const remember = (animation) => {
        activeAnimations.push(animation);
        animation.finished
            .catch(() => {})
            .finally(() => {
                activeAnimations = activeAnimations.filter((item) => item !== animation);
            });
    };

    const corruptText = () => {
        let result = [...originalText]
            .map((character) => {
                if (character === " ") {
                    return Math.random() < 0.16 ? "  " : " ";
                }
                if (Math.random() < 0.48) {
                    return pick([
                        character,
                        character.toUpperCase(),
                        character.toLowerCase(),
                        ...corruptGlyphs,
                    ]);
                }
                return character;
            })
            .join("");

        if (result === originalText) {
            const characters = [...result];
            characters[randomBetween(0, characters.length - 1)] = pick([...corruptGlyphs]);
            result = characters.join("");
        }

        return result;
    };

    const randomTransform = (hard) => {
        const distance = hard ? randomBetween(10, 26) : randomBetween(5, 15);
        const dx = randomBetween(-distance, distance);
        const dy = randomBetween(-Math.round(distance / 2), Math.round(distance / 2));
        const rotation = randomBetween(hard ? -3 : -2, hard ? 3 : 2);
        const scale = randomBetween(hard ? 88 : 94, hard ? 116 : 108) / 100;
        const skew = randomBetween(hard ? -9 : -5, hard ? 9 : 5);
        return `translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${scale}) skewX(${skew}deg)`;
    };

    const randomFilter = (hard) => {
        const blur = randomBetween(0, hard ? 18 : 8) / 10;
        const contrast = randomBetween(hard ? 80 : 92, hard ? 260 : 180);
        return `blur(${blur}px) contrast(${contrast}%)`;
    };

    const stageFrames = (hard) => {
        const steps = hard ? 15 : 10;
        const frames = [{ offset: 0, transform: "none", filter: "none" }];

        for (let index = 1; index < steps; index += 1) {
            frames.push({
                offset: index / steps,
                transform: randomTransform(hard),
                filter: randomFilter(hard),
            });
        }

        frames.push({ offset: 1, transform: "none", filter: "none" });
        return frames;
    };

    const textFrames = (hard) => {
        const steps = hard ? 8 : 5;
        const frames = [
            {
                offset: 0,
                opacity: 1,
            },
        ];

        for (let index = 1; index < steps; index += 1) {
            frames.push({
                offset: index / steps,
                opacity: randomBetween(6, 100) / 100,
            });
        }

        frames.push({
            offset: 1,
            opacity: 1,
        });
        return frames;
    };

    const layerFrames = (hard) => {
        const steps = hard ? 9 : 6;
        const frames = [
            { offset: 0, opacity: 0, clipPath: "inset(0 0 100% 0)", transform: "none" },
        ];

        for (let index = 1; index < steps; index += 1) {
            const top = randomBetween(0, 78);
            const bottom = randomBetween(0, 78);
            frames.push({
                offset: index / steps,
                opacity: randomBetween(35, 100) / 100,
                clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                transform: randomTransform(hard),
            });
        }

        frames.push({ offset: 1, opacity: 0, clipPath: "inset(100% 0 0 0)", transform: "none" });
        return frames;
    };

    const scheduleNext = () => {
        window.clearTimeout(burstTimer);
        if (motionPreference.matches) return;
        burstTimer = window.setTimeout(() => runBurst(false), randomBetween(1400, 7600));
    };

    const runBurst = (followup) => {
        window.clearTimeout(followupTimer);

        if (document.hidden || motionPreference.matches) {
            if (!followup) scheduleNext();
            return;
        }

        stopAnimations();

        const hard = Math.random() < 0.58;
        const duration = randomBetween(hard ? 380 : 220, hard ? 720 : 460);
        remember(
            stage.animate(stepped(stageFrames(hard)), {
                duration,
                easing: "linear",
            })
        );
        remember(
            base.animate(stepped(textFrames(hard)), {
                duration,
                easing: "linear",
            })
        );

        const visibleLayers = shuffle(layers).slice(0, hard ? randomBetween(2, layers.length) : randomBetween(1, 2));
        visibleLayers.forEach((layer) => {
            layer.textContent = corruptText();
            layer.style.fontFamily = pick(typefaces);
            layer.style.fontSize = `${randomBetween(hard ? 80 : 90, hard ? 136 : 118) / 100}em`;
            layer.style.fontWeight = String(pick([400, 700, 800, 900]));
            layer.style.letterSpacing = `${randomBetween(-12, 12) / 100}em`;
            layer.style.textTransform = pick(["none", "uppercase"]);
            remember(
                layer.animate(stepped(layerFrames(hard)), {
                    duration: duration + randomBetween(0, 160),
                    delay: randomBetween(0, 70),
                    easing: "linear",
                })
            );
        });

        remember(
            pixels.animate(
                stepped([
                    { offset: 0, opacity: 0, transform: "none" },
                    {
                        offset: 0.18,
                        opacity: randomBetween(45, 100) / 100,
                        transform: `translate(${randomBetween(-12, 12)}px, ${randomBetween(-8, 8)}px) scale(${randomBetween(85, 125) / 100})`,
                    },
                    {
                        offset: 0.46,
                        opacity: randomBetween(20, 80) / 100,
                        transform: `translate(${randomBetween(-16, 16)}px, ${randomBetween(-10, 10)}px) scale(${randomBetween(90, 135) / 100})`,
                    },
                    {
                        offset: 0.72,
                        opacity: randomBetween(35, 100) / 100,
                        transform: `translate(${randomBetween(-12, 12)}px, ${randomBetween(-8, 8)}px) scale(${randomBetween(88, 120) / 100})`,
                    },
                    { offset: 1, opacity: 0, transform: "none" },
                ]),
                {
                    duration: duration + randomBetween(20, 220),
                    delay: randomBetween(0, 90),
                    easing: "linear",
                }
            )
        );

        if (!followup && Math.random() < 0.55) {
            followupTimer = window.setTimeout(() => runBurst(true), randomBetween(90, 280));
        }
        if (!followup) scheduleNext();
    };

    const handleMotionChange = () => {
        window.clearTimeout(burstTimer);
        window.clearTimeout(followupTimer);
        stopAnimations();
        if (!motionPreference.matches) scheduleNext();
    };

    motionPreference.addEventListener?.("change", handleMotionChange);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            window.clearTimeout(burstTimer);
            window.clearTimeout(followupTimer);
            stopAnimations();
        } else {
            scheduleNext();
        }
    });

    burstTimer = window.setTimeout(() => runBurst(false), randomBetween(700, 2600));
})();
