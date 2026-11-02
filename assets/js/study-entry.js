(() => {
    "use strict";

    const entry = document.querySelector("[data-study-entry]");
    const stage = document.querySelector("[data-study-stage]");
    if (!entry || !stage) return;

    const html = document.documentElement;
    const video = stage.querySelector("[data-study-video]");
    const audioButton = stage.querySelector("[data-study-audio]");
    const replayButton = stage.querySelector("[data-study-replay]");
    const muteButton = stage.querySelector("[data-study-mute]");
    const seekControl = stage.querySelector("[data-study-seek]");
    const playerTimeDisplay = stage.querySelector("[data-study-player-time]");
    const playerDurationDisplay = stage.querySelector("[data-study-player-duration]");
    const loopButton = stage.querySelector("[data-study-loop]");
    const fullscreenButton = stage.querySelector("[data-study-fullscreen]");
    const focusOpenButton = stage.querySelector("[data-study-focus-open]");
    const focusPanel = document.querySelector("[data-study-focus]");
    const focusCloseButton = focusPanel?.querySelector("[data-focus-close]");
    const focusTimeDisplay = focusPanel?.querySelector("[data-focus-time]");
    const focusModeDisplay = focusPanel?.querySelector("[data-focus-mode]");
    const focusStatus = focusPanel?.querySelector("[data-focus-status]");
    const focusProgress = focusPanel?.querySelector("[data-focus-progress]");
    const focusToggleButton = focusPanel?.querySelector("[data-focus-toggle]");
    const focusResetButton = focusPanel?.querySelector("[data-focus-reset]");
    const focusMusicButton = focusPanel?.querySelector("[data-focus-music]");
    const focusPresetButtons = [...(focusPanel?.querySelectorAll("[data-focus-preset]") || [])];
    const enterButton = entry.querySelector("[data-study-enter]");
    const skipButton = entry.querySelector("[data-study-skip]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let loopEnabled = true;
    let videoSourceReady = false;
    let previousVideoTime = 0;
    let lastMusicShortcutAt = 0;
    let focusBeforeEntry = document.activeElement;
    let removeCinemaFallback = () => {};
    let focusMode = "focus";
    let focusRemaining = 25 * 60 * 1000;
    let focusRunning = false;
    let focusDeadline = 0;
    let focusTimer = 0;
    let audioContext;

    const formatTime = (seconds) => {
        const safeSeconds = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(safeSeconds / 60);
        return `${String(minutes).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
    };

    const setButtonState = (button, label, pressed) => {
        button.textContent = label;
        if (typeof pressed === "boolean") button.setAttribute("aria-pressed", String(pressed));
    };

    const announceStudyAction = (name, detail = {}) => {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    };

    const syncPlayerButton = () => {
        if (video.ended) {
            setButtonState(audioButton, "REPLAY");
        } else {
            setButtonState(audioButton, video.paused ? "PLAY" : "PAUSE");
        }
        audioButton.setAttribute("aria-label", video.paused ? "Play music" : "Pause music");
        if (focusMusicButton) {
            focusMusicButton.textContent = video.paused ? "PLAY MUSIC" : "PAUSE MUSIC";
        }
    };

    const syncVideoUi = () => {
        if (!video) return;
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;

        playerTimeDisplay.textContent = formatTime(currentTime);
        playerDurationDisplay.textContent = formatTime(duration || 258.664);
        if (document.activeElement !== seekControl) {
            seekControl.value = String(currentTime);
        }
        seekControl.max = String(duration || 258.664);
        seekControl.style.setProperty("--seek-fill", `${duration ? (currentTime / duration) * 100 : 0}%`);

        previousVideoTime = currentTime;
        syncPlayerButton();
    };

    const prepareVideo = () => {
        if (!videoSourceReady) {
            video.src = video.dataset.src;
            video.load();
            videoSourceReady = true;
        }
        video.loop = loopEnabled;
        stage.classList.add("has-audio");
    };

    const playVideo = async ({ restart = false } = {}) => {
        prepareVideo();
        if (restart || video.ended) {
            video.currentTime = 0;
            previousVideoTime = 0;
        }
        try {
            await video.play();
        } catch {
            syncPlayerButton();
        }
    };

    const togglePlayback = () => {
        if (video.paused) {
            playVideo({ restart: video.ended });
            announceStudyAction("study:play");
        } else {
            video.pause();
            announceStudyAction("study:pause");
        }
    };

    const replayVideo = () => {
        playVideo({ restart: true });
        announceStudyAction("study:replay");
    };

    const toggleMute = () => {
        video.muted = !video.muted;
        setButtonState(muteButton, video.muted ? "MUTED" : "SOUND ON", video.muted);
        muteButton.setAttribute("aria-label", video.muted ? "Unmute audio" : "Mute audio");
    };

    const closeEntry = ({ play = false } = {}) => {
        if (entry.hidden || entry.classList.contains("is-departing")) return;
        entry.classList.add("is-departing");
        announceStudyAction("study:enter", { sound: play });
        if (play) playVideo();

        const delay = reduceMotion.matches ? 80 : 1050;
        window.setTimeout(() => {
            entry.hidden = true;
            entry.classList.remove("is-visible", "is-departing");
            html.classList.remove("study-entry-open");
            document.body.classList.remove("study-entry-open");
            stage.classList.add("is-revealed");
            if (focusBeforeEntry instanceof HTMLElement) focusBeforeEntry.blur();
            fullscreenButton.focus({ preventScroll: true });
        }, delay);
    };

    const openEntry = () => {
        focusBeforeEntry = document.activeElement;
        entry.hidden = false;
        html.classList.add("study-entry-open");
        document.body.classList.add("study-entry-open");
        requestAnimationFrame(() => {
            entry.classList.add("is-visible");
            enterButton.focus({ preventScroll: true });
        });
    };

    const trapEntryFocus = (event) => {
        if (event.key !== "Tab" || entry.hidden) return;
        const focusable = [enterButton, skipButton];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const isCinema = () => document.fullscreenElement === stage || stage.classList.contains("is-cinema");

    const syncFullscreenButton = () => {
        const active = isCinema();
        stage.dataset.fullscreen = String(active);
        setButtonState(fullscreenButton, active ? "EXIT" : "FULLSCREEN");
        fullscreenButton.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
    };

    const requestCinema = async () => {
        if (isCinema()) {
            if (document.fullscreenElement === stage) await document.exitFullscreen?.();
            removeCinemaFallback();
            announceStudyAction("study:fullscreen", { active: false });
            return;
        }

        if (stage.requestFullscreen) {
            try {
                await stage.requestFullscreen();
                announceStudyAction("study:fullscreen", { active: true });
                return;
            } catch {
            }
        }

        stage.classList.add("is-cinema");
        html.classList.add("study-cinema-open");
        document.body.classList.add("study-cinema-open");
        removeCinemaFallback = () => {
            stage.classList.remove("is-cinema");
            html.classList.remove("study-cinema-open");
            document.body.classList.remove("study-cinema-open");
            syncFullscreenButton();
        };
        announceStudyAction("study:fullscreen", { active: true });
        syncFullscreenButton();
    };

    const focusDuration = () => (focusMode === "focus" ? 25 * 60 * 1000 : 5 * 60 * 1000);
    const focusModeName = () => (focusMode === "focus" ? "DEEP FOCUS" : "SHORT BREAK");
    const focusStartLabel = () => {
        if (focusRunning) return "PAUSE";
        return focusMode === "focus" ? "START FOCUS" : "START BREAK";
    };

    const renderFocusTimer = () => {
        if (!focusPanel) return;
        const safeRemaining = Math.max(0, focusRemaining);
        const seconds = Math.ceil(safeRemaining / 1000);
        const elapsedPercent = 100 - (safeRemaining / focusDuration()) * 100;
        focusTimeDisplay.textContent = formatTime(seconds);
        focusModeDisplay.textContent = focusModeName();
        focusProgress.style.strokeDashoffset = String(Math.max(0, Math.min(100, elapsedPercent)));
        focusToggleButton.textContent = focusStartLabel();
        focusPresetButtons.forEach((button) => {
            const selected = button.dataset.focusPreset === focusMode;
            button.setAttribute("aria-pressed", String(selected));
        });
    };

    const playCompletionTone = () => {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
            audioContext ||= new AudioContextClass();
            if (audioContext.state === "suspended") audioContext.resume();
            [0, 0.22, 0.44].forEach((offset, index) => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = [523.25, 659.25, 783.99][index];
                gain.gain.setValueAtTime(0.0001, audioContext.currentTime + offset);
                gain.gain.exponentialRampToValueAtTime(0.075, audioContext.currentTime + offset + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + offset + 0.5);
                oscillator.connect(gain).connect(audioContext.destination);
                oscillator.start(audioContext.currentTime + offset);
                oscillator.stop(audioContext.currentTime + offset + 0.55);
            });
            navigator.vibrate?.([80, 60, 120]);
        } catch {
        }
    };

    const completeFocusPhase = () => {
        window.clearInterval(focusTimer);
        focusRunning = false;
        const completedMode = focusMode;
        if (completedMode === "focus") {
            focusMode = "break";
            focusStatus.textContent = "Focus complete. Let the numbers rest for five minutes.";
        } else {
            focusMode = "focus";
            focusStatus.textContent = "Break over. Return to one thing when you're ready.";
        }
        focusRemaining = focusDuration();
        announceStudyAction("study:focuscomplete", { mode: focusMode });
        focusPanel.classList.add("is-complete");
        window.setTimeout(() => focusPanel.classList.remove("is-complete"), 1600);
        playCompletionTone();
        renderFocusTimer();
    };

    const tickFocusTimer = () => {
        if (!focusRunning) return;
        focusRemaining = Math.max(0, focusDeadline - performance.now());
        if (focusRemaining <= 0) {
            completeFocusPhase();
            return;
        }
        renderFocusTimer();
    };

    const startFocusTimer = () => {
        if (focusRemaining <= 0) focusRemaining = focusDuration();
        focusRunning = true;
        focusDeadline = performance.now() + focusRemaining;
        window.clearInterval(focusTimer);
        focusTimer = window.setInterval(tickFocusTimer, 250);
        focusStatus.textContent = focusMode === "focus"
            ? "The room is quiet. Stay with one thing."
            : "Step away from the screen. Breathe.";
        renderFocusTimer();
    };

    const pauseFocusTimer = () => {
        if (!focusRunning) return;
        focusRemaining = Math.max(0, focusDeadline - performance.now());
        focusRunning = false;
        window.clearInterval(focusTimer);
        focusStatus.textContent = "Paused. The room will wait.";
        renderFocusTimer();
    };

    const switchFocusMode = (nextMode) => {
        window.clearInterval(focusTimer);
        focusRunning = false;
        focusMode = nextMode;
        focusRemaining = focusDuration();
        focusStatus.textContent = focusMode === "focus"
            ? "25 minutes. One thing at a time."
            : "Five minutes. Nothing has to be solved.";
        renderFocusTimer();
    };

    const resetFocusTimer = () => {
        window.clearInterval(focusTimer);
        focusRunning = false;
        focusRemaining = focusDuration();
        focusStatus.textContent = focusMode === "focus"
            ? "25 minutes. One thing at a time."
            : "Five minutes. Nothing has to be solved.";
        renderFocusTimer();
    };

    const openFocusMode = async () => {
        if (document.fullscreenElement === stage) {
            try {
                await document.exitFullscreen();
            } catch {
            }
        }
        focusPanel.hidden = false;
        announceStudyAction("study:focus");
        stage.inert = true;
        html.classList.add("study-focus-open");
        document.body.classList.add("study-focus-open");
        renderFocusTimer();
        requestAnimationFrame(() => {
            focusPanel.classList.add("is-visible");
            focusToggleButton.focus({ preventScroll: true });
        });
    };

    const closeFocusMode = () => {
        if (focusPanel.hidden) return;
        focusPanel.classList.remove("is-visible");
        focusPanel.hidden = true;
        stage.inert = false;
        html.classList.remove("study-focus-open");
        document.body.classList.remove("study-focus-open");
        focusOpenButton.focus({ preventScroll: true });
    };

    const trapFocusPanel = (event) => {
        if (!focusPanel || focusPanel.hidden || event.key !== "Tab") return;
        const focusable = [...focusPanel.querySelectorAll("button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    enterButton.addEventListener("click", () => closeEntry({ play: true }));
    skipButton.addEventListener("click", () => closeEntry());
    audioButton.addEventListener("click", togglePlayback);
    replayButton.addEventListener("click", replayVideo);
    muteButton.addEventListener("click", toggleMute);
    video.addEventListener("click", togglePlayback);

    video.addEventListener("play", () => {
        stage.classList.add("has-audio");
        syncVideoUi();
    });
    video.addEventListener("pause", syncVideoUi);
    video.addEventListener("ended", syncVideoUi);
    video.addEventListener("timeupdate", syncVideoUi);
    video.addEventListener("loadedmetadata", () => {
        previousVideoTime = video.currentTime;
        syncVideoUi();
    });
    video.addEventListener("volumechange", () => {
        setButtonState(muteButton, video.muted ? "MUTED" : "SOUND ON", video.muted);
        muteButton.setAttribute("aria-label", video.muted ? "Unmute audio" : "Mute audio");
    });
    seekControl.addEventListener("input", () => {
        video.currentTime = Number(seekControl.value);
        previousVideoTime = video.currentTime;
        syncVideoUi();
    });

    loopButton.addEventListener("click", () => {
        loopEnabled = !loopEnabled;
        video.loop = loopEnabled;
        setButtonState(loopButton, loopEnabled ? "SINGLE LOOP" : "LOOP OFF", loopEnabled);
        loopButton.setAttribute("aria-label", loopEnabled ? "Disable single-track loop" : "Enable single-track loop");
        announceStudyAction("study:loop", { enabled: loopEnabled });
    });

    fullscreenButton.addEventListener("click", requestCinema);
    focusOpenButton.addEventListener("click", openFocusMode);
    focusCloseButton.addEventListener("click", closeFocusMode);
    focusToggleButton.addEventListener("click", () => {
        if (focusRunning) pauseFocusTimer();
        else {
            startFocusTimer();
            announceStudyAction("study:focusstart", { mode: focusMode });
        }
    });
    focusResetButton.addEventListener("click", resetFocusTimer);
    focusMusicButton.addEventListener("click", togglePlayback);
    focusPresetButtons.forEach((button) => {
        button.addEventListener("click", () => switchFocusMode(button.dataset.focusPreset));
    });

    document.addEventListener("keydown", (event) => {
        if (focusPanel && !focusPanel.hidden) {
            if (event.key === "Tab") {
                trapFocusPanel(event);
                return;
            }
            if (event.key === "Escape") {
                event.preventDefault();
                closeFocusMode();
            }
            return;
        }

        if (entry.hidden && event.key.toLowerCase() === "f" && stage.classList.contains("is-revealed")) {
            fullscreenButton.click();
            return;
        }

        if (event.key === "Tab") trapEntryFocus(event);

        if (event.key === "Escape" && !entry.hidden) {
            event.preventDefault();
            closeEntry();
            return;
        }

        if (event.key === "Escape" && stage.classList.contains("is-cinema")) {
            removeCinemaFallback();
            return;
        }

        if (event.key.toLowerCase() === "m" && stage.classList.contains("is-revealed")) {
            const now = performance.now();
            if (now - lastMusicShortcutAt > 500) togglePlayback();
            lastMusicShortcutAt = now;
        }
    });

    document.addEventListener("fullscreenchange", syncFullscreenButton);
    window.addEventListener("pagehide", () => window.clearInterval(focusTimer), { once: true });

    setButtonState(loopButton, "SINGLE LOOP", true);
    syncVideoUi();
    syncFullscreenButton();
    renderFocusTimer();
    openEntry();
})();
