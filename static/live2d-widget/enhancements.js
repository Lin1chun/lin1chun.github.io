(() => {
  'use strict';

  const preferenceKey = 'hiyori-widget-enabled';
  const hoverDelay = 1100;
  const hoverCooldown = 9000;
  const tapCooldown = 2400;

  let say = null;
  let preferenceControl = null;
  let hoverTimer = null;
  let hoverZone = null;
  let lastHoverAt = 0;
  let lastTapAt = 0;
  let hideTimer = null;
  let enableRequest = 0;

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

  const quotes = [
    'Small steps still count.',
    'A quiet page is still a place to begin.',
    'Curiosity is a habit worth keeping.',
    'Rest is part of the work.',
    'You do not have to rush every thought.',
    'Leave a little room for the unexpected.',
  ];

  const readPreference = () => {
    try {
      return localStorage.getItem(preferenceKey) !== 'false';
    } catch {
      return true;
    }
  };

  const writePreference = (enabled) => {
    try {
      localStorage.setItem(preferenceKey, String(enabled));
    } catch {
      // The switch still works for this page when storage is unavailable.
    }
  };

  const emitState = (enabled) => {
    window.dispatchEvent(new CustomEvent('hiyori:statechange', {
      detail: { enabled },
    }));
  };

  const setLoading = (loading) => {
    const section = preferenceControl?.closest('#live2dPreference');
    if (!section) return;
    section.dataset.loading = String(loading);
    section.setAttribute('aria-busy', String(loading));
  };

  const waitForWidgetReady = (timeout = 15000) => new Promise((resolve) => {
    const startedAt = performance.now();
    const check = () => {
      const waifu = document.getElementById('waifu');
      if (
        waifu?.classList.contains('waifu-active') ||
        waifu?.classList.contains('waifu-paused') ||
        !readPreference() ||
        performance.now() - startedAt >= timeout
      ) {
        resolve();
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });

  const hideWidget = () => {
    const waifu = document.getElementById('waifu');
    if (!waifu) return;
    clearTimeout(hideTimer);
    waifu.classList.remove('waifu-active');
    document.getElementById('waifu-tips')?.classList.remove('waifu-tips-active');
    hideTimer = window.setTimeout(() => {
      if (!readPreference()) waifu.classList.add('waifu-paused');
    }, 3100);
  };

  const showWidget = () => {
    const waifu = document.getElementById('waifu');
    if (!waifu) return;
    clearTimeout(hideTimer);
    waifu.classList.remove('waifu-hidden', 'waifu-paused');
    void waifu.offsetWidth;
    requestAnimationFrame(() => {
      if (!readPreference()) return;
      waifu.classList.add('waifu-active');
      window.dispatchEvent(new Event('resize'));
    });
  };

  const pointZone = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // The character occupies the middle of the transparent 300px canvas.
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

  const ensureQuoteButton = (waifu) => {
    const tools = waifu.querySelector('#waifu-tool');
    if (!tools || tools.querySelector('#waifu-tool-hitokoto')) return;

    const button = document.createElement('button');
    button.id = 'waifu-tool-hitokoto';
    button.type = 'button';
    button.title = 'Quote';
    button.setAttribute('aria-label', 'Show a quote');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
        <path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c0 0 0 0 0 0s0 0 0 0s0 0 0 0l.3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/>
      </svg>
    `;
    button.addEventListener('click', () => {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      speak([quote], 4800, 9);
    });
    tools.insertBefore(button, tools.firstElementChild);
  };

  const bindInteractions = (waifu) => {
    const canvas = waifu.querySelector('#live2d');
    const canvasFrame = waifu.querySelector('#waifu-canvas');
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

      clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverZone = zone;
      if (!zone) return;

      hoverTimer = window.setTimeout(() => {
        if (!readPreference()) return;
        if (!hitArea.matches(':hover')) return;
        if (Date.now() - lastHoverAt < hoverCooldown) return;
        lastHoverAt = Date.now();
        speak(zones[zone].hover, 3800, 8);
      }, hoverDelay);
    }, { passive: true });

    hitArea.addEventListener('pointerleave', () => {
      clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverZone = null;
    });

    hitArea.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !readPreference()) return;
      const zone = pointZone(event, canvas);
      if (!zone || Date.now() - lastTapAt < tapCooldown) return;
      lastTapAt = Date.now();
      speak(zones[zone].tap, 4200, 9);
    }, { passive: true });
  };

  const setEnabled = async (enabled) => {
    const next = Boolean(enabled);
    writePreference(next);
    if (preferenceControl) preferenceControl.checked = next;
    emitState(next);

    const waifu = document.getElementById('waifu');
    if (!next) {
      setLoading(false);
      hideWidget();
      document.getElementById('waifu-toggle')?.remove();
    } else if (waifu) {
      showWidget();
    } else if (window.startLive2DWidget) {
      const request = ++enableRequest;
      setLoading(true);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      try {
        await window.startLive2DWidget();
        await waitForWidgetReady();
      } catch (error) {
        console.warn('[Hiyori] Model loading failed.', error);
      } finally {
        if (request === enableRequest) setLoading(false);
      }
    }
  };

  const mountPreference = () => {
    if (preferenceControl) return;
    const a11y = document.querySelector('#a11y');
    const optimizeSR = document.querySelector('#optimizeSR');
    if (!a11y || !optimizeSR) return;

    const section = document.createElement('div');
    section.id = 'live2dPreference';
    section.className = 'live2d-preference';
    section.lang = 'en';
    section.innerHTML = `
      <input id="live2dEnabled" class="toggle" type="checkbox">
      <label for="live2dEnabled">Hiyori</label>
    `;
    optimizeSR.after(section);
    preferenceControl = section.querySelector('#live2dEnabled');
    preferenceControl.checked = readPreference();
    preferenceControl.addEventListener('change', () => {
      setEnabled(preferenceControl.checked);
    });
  };

  const mountWidget = () => {
    const waifu = document.getElementById('waifu');
    if (!waifu) return;
    const firstMount = waifu.dataset.hiyoriMounted !== 'true';
    const tips = document.getElementById('waifu-tips');
    if (tips) tips.lang = 'en';
    ensureQuoteButton(waifu);
    bindInteractions(waifu);
    document.getElementById('waifu-toggle')?.remove();
    if (firstMount) {
      waifu.dataset.hiyoriMounted = 'true';
      if (!readPreference()) {
        waifu.classList.remove('waifu-active');
        waifu.classList.add('waifu-paused');
      }
    }
  };

  window.HiyoriWidget = {
    get enabled() {
      return readPreference();
    },
    setEnabled,
  };

  window.addEventListener('hiyori:statechange', () => {
    if (preferenceControl) preferenceControl.checked = readPreference();
  });

  const observer = new MutationObserver(() => {
    mountPreference();
    mountWidget();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  mountPreference();
  mountWidget();
})();
