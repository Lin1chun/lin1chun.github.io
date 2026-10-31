(() => {
  'use strict';

  const PREFERENCE_KEY = 'hiyori-widget-enabled';
  const HOVER_DELAY = 1100;
  const HOVER_COOLDOWN = 9000;
  const TAP_COOLDOWN = 2400;
  const MOUNT_TIMEOUT = 15000;

  const zones = {
    hair: {
      hover: ['The wind got to my hair... mind fixing it?', "One strand just won't stay put."],
      tap: ['Easy there. My hair clip will slip.', "Headpats are fine. Just don't ruin the styling.", 'Oh... hi.'],
    },
    'face-left': {
      hover: ["You're staring at that side. I can tell."],
      tap: ["Soft? You don't need to keep checking.", "Touch me again and I'm turning away."],
    },
    face: {
      hover: ['Are you looking at my eyes?'],
      tap: ['Mm... that was my face, you know.', "For the record, I'm not blushing.", 'Heart. Heart heart.'],
    },
    'face-right': {
      hover: ['Is there something interesting on that side?'],
      tap: ['Hey, poking my cheek is against the rules.', 'The next one costs you.'],
    },
    shoulder: {
      hover: ['My shoulder is a little stiff. Mind if I lean for a moment?'],
      tap: ["A pat on the shoulder is fine. Too hard, and I'll remember it.", 'Gymbag.'],
    },
    waist: {
      hover: ["Please don't go wandering around my waist."],
      tap: ["Hey—that's off-limits.", 'Filtered.'],
    },
    skirt: {
      hover: ["You're going to mess up my skirt."],
      tap: ["Don't lift it. I'm serious."],
    },
    legs: {
      hover: ['Standing this long gets tiring. You should sit for a while too.'],
      tap: ["Poke me again and I'll jump.", "What's 9 + 10? It's 21."],
    },
  };

  let say = null;
  let preferenceControl = null;
  let hoverTimer = null;
  let hoverZone = null;
  let lastHoverAt = 0;
  let lastTapAt = 0;
  let hideTimer = null;
  let requestSequence = 0;
  let observer = null;
  let observerTimeout = null;
  let sessionPreference = null;

  const getWidget = () => document.getElementById('waifu');

  const readPreference = () => {
    try {
      const storedPreference = localStorage.getItem(PREFERENCE_KEY);
      if (storedPreference !== null) return storedPreference === 'true';
    } catch {
      // Fall through to the in-memory preference.
    }

    return sessionPreference ?? false;
  };

  const writePreference = (enabled) => {
    sessionPreference = enabled;
    try {
      localStorage.setItem(PREFERENCE_KEY, String(enabled));
    } catch {
      // The current page can still use the toggle when storage is unavailable.
    }
  };

  const syncPreferenceControl = (enabled) => {
    if (preferenceControl) preferenceControl.checked = enabled;
  };

  const announceState = (enabled) => {
    window.dispatchEvent(new CustomEvent('hiyori:statechange', {
      detail: { enabled },
    }));
  };

  const setLoading = (loading) => {
    const section = document.getElementById('live2dPreference');
    if (!section) return;

    if (loading) {
      section.dataset.loading = 'true';
      section.setAttribute('aria-busy', 'true');
    } else {
      delete section.dataset.loading;
      section.removeAttribute('aria-busy');
    }
  };

  const waitForWidgetReady = (timeout = 15000) => new Promise((resolve) => {
    const deadline = performance.now() + timeout;

    const check = () => {
      const widget = getWidget();
      if (
        widget?.classList.contains('waifu-active') ||
        widget?.classList.contains('waifu-paused') ||
        !readPreference()
      ) {
        resolve();
        return;
      }

      if (performance.now() >= deadline) {
        resolve();
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });

  const hideWidget = () => {
    const widget = getWidget();
    if (!widget) return;

    window.clearTimeout(hideTimer);
    widget.classList.remove('waifu-active');
    document.getElementById('waifu-tips')?.classList.remove('waifu-tips-active');
    hideTimer = window.setTimeout(() => {
      if (!readPreference()) widget.classList.add('waifu-paused');
    }, 3100);
  };

  const showWidget = () => {
    const widget = getWidget();
    if (!widget) return;

    window.clearTimeout(hideTimer);
    widget.classList.remove('waifu-hidden', 'waifu-paused');
    void widget.offsetWidth;
    window.requestAnimationFrame(() => {
      if (!readPreference()) return;
      widget.classList.add('waifu-active');
      window.dispatchEvent(new Event('resize'));
    });
  };

  const pointZone = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // The character occupies the middle of the transparent canvas.
    if (x < 0.34 || x > 0.64 || y < 0.01 || y > 0.9) return null;

    if (y < 0.14) return 'hair';
    if (y < 0.29) {
      if (x < 0.46) return 'face-left';
      if (x > 0.52) return 'face-right';
      return 'face';
    }
    if (y < 0.41) return 'shoulder';
    if (y < 0.57) return 'waist';
    if (y < 0.69) return 'skirt';
    return 'legs';
  };

  const speak = async (messages, duration, priority) => {
    if (!readPreference()) return;

    try {
      if (!say) ({ say } = await import('/live2d-widget/waifu-tips.js'));
      say(messages, duration, priority);
    } catch (error) {
      console.warn('[Hiyori] Could not show dialogue.', error);
    }
  };

  const bindInteractions = (widget) => {
    const canvas = widget.querySelector('#live2d');
    const canvasFrame = widget.querySelector('#waifu-canvas');
    if (!canvas || !canvasFrame || canvas.dataset.hiyoriInteractive === 'true') return;

    canvas.dataset.hiyoriInteractive = 'true';
    canvas.lang = 'en';
    canvas.setAttribute('aria-label', 'Hiyori Live2D model. Move over or tap different parts to interact.');

    const hitArea = document.createElement('div');
    hitArea.id = 'hiyori-hit-area';
    hitArea.setAttribute('aria-hidden', 'true');
    canvasFrame.appendChild(hitArea);

    hitArea.addEventListener('pointermove', (event) => {
      if (!readPreference()) return;
      const zone = pointZone(event, canvas);
      if (zone === hoverZone && hoverTimer) return;

      window.clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverZone = zone;
      if (!zone) return;

      hoverTimer = window.setTimeout(() => {
        if (!readPreference() || !hitArea.matches(':hover')) return;
        if (Date.now() - lastHoverAt < HOVER_COOLDOWN) return;
        lastHoverAt = Date.now();
        speak(zones[zone].hover, 3800, 8);
      }, HOVER_DELAY);
    }, { passive: true });

    hitArea.addEventListener('pointerleave', () => {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverZone = null;
    });

    hitArea.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !readPreference()) return;
      const zone = pointZone(event, canvas);
      if (!zone || Date.now() - lastTapAt < TAP_COOLDOWN) return;
      lastTapAt = Date.now();
      speak(zones[zone].tap, 4200, 9);
    }, { passive: true });
  };

  const mountPreference = () => {
    if (preferenceControl?.isConnected) return;

    const optimizeSR = document.getElementById('optimizeSR');
    if (!optimizeSR) return;

    const existingControl = document.getElementById('live2dEnabled');
    if (existingControl) {
      preferenceControl = existingControl;
      preferenceControl.checked = readPreference();
      return;
    }

    const section = document.createElement('div');
    section.id = 'live2dPreference';
    section.className = 'live2d-preference';
    section.lang = 'en';

    const control = document.createElement('input');
    control.id = 'live2dEnabled';
    control.className = 'toggle';
    control.type = 'checkbox';
    control.checked = readPreference();

    const label = document.createElement('label');
    label.htmlFor = control.id;
    label.textContent = 'Hiyori';

    control.addEventListener('change', () => {
      void setEnabled(control.checked);
    });

    section.append(control, label);
    optimizeSR.after(section);
    preferenceControl = control;
  };

  const mountWidget = () => {
    const widget = getWidget();
    if (!widget) return false;

    const firstMount = widget.dataset.hiyoriMounted !== 'true';
    const tips = document.getElementById('waifu-tips');
    if (tips) tips.lang = 'en';

    widget.querySelector('#waifu-tool')?.remove();
    document.getElementById('waifu-toggle')?.remove();
    bindInteractions(widget);

    if (firstMount) {
      widget.dataset.hiyoriMounted = 'true';
      if (!readPreference()) {
        widget.classList.remove('waifu-active');
        widget.classList.add('waifu-paused');
      }
    }

    return true;
  };

  const stopObserving = () => {
    observer?.disconnect();
    observer = null;
    window.clearTimeout(observerTimeout);
    observerTimeout = null;
  };

  const reconcileDom = () => {
    mountPreference();
    const widgetMounted = mountWidget();

    if (preferenceControl && (widgetMounted || !readPreference())) {
      stopObserving();
    }
  };

  const setEnabled = async (enabled) => {
    const next = Boolean(enabled);
    const request = ++requestSequence;

    writePreference(next);
    syncPreferenceControl(next);
    announceState(next);

    const widget = getWidget();
    if (!next) {
      setLoading(false);
      hideWidget();
      document.getElementById('waifu-toggle')?.remove();
      return;
    }

    if (widget) {
      showWidget();
      return;
    }

    if (typeof window.startLive2DWidget !== 'function') {
      setLoading(false);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    });

    try {
      const started = await window.startLive2DWidget();
      if (!started) return;

      await waitForWidgetReady();
      if (request !== requestSequence || !readPreference()) {
        hideWidget();
        return;
      }

      mountPreference();
      if (!mountWidget()) {
        throw new Error('Live2D widget did not appear after loading.');
      }
    } catch (error) {
      console.warn('[Hiyori] Model failed to load.', error);
    } finally {
      if (request === requestSequence) setLoading(false);
    }
  };

  window.HiyoriWidget = {
    get enabled() {
      return readPreference();
    },
    setEnabled,
  };

  window.addEventListener('hiyori:statechange', () => {
    syncPreferenceControl(readPreference());
  });

  if (document.body) {
    observer = new MutationObserver(reconcileDom);
    observer.observe(document.body, { childList: true, subtree: true });
    observerTimeout = window.setTimeout(stopObserving, MOUNT_TIMEOUT);
  }

  reconcileDom();
})();
