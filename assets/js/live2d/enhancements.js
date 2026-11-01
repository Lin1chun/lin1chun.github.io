(() => {
  'use strict';

  const PREFERENCE_KEY = 'hiyori-widget-enabled';
  const HOVER_DELAY = 1100;
  const HOVER_COOLDOWN = 9000;
  const TAP_COOLDOWN = 2400;
  const MOUNT_TIMEOUT = 15000;
  const isStudyPage = Boolean(document.querySelector('[data-study-stage]'));

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

  const studyZones = {
    hair: {
      hover: ['The room is quiet enough to hear every strand move.', 'Headphones? I can only hear the room.'],
      tap: ['You came here to study... or to bother me?', "Careful. The numbers are watching."],
    },
    'face-left': {
      hover: ['You are reading the lyrics again, are you not?'],
      tap: ['The song is doing the talking. Eyes on the screen.'],
    },
    face: {
      hover: ['I know that expression. Too many unfinished equations?'],
      tap: ['No. You do not get to avoid the chorus that easily.', 'Eyes on the screen, engineer.'],
    },
    'face-right': {
      hover: ['Something on your mind? Or just the song?'],
      tap: ['One small break. Then back to work.', 'Poking me will not solve the next equation.'],
    },
    shoulder: {
      hover: ['Lean on me for a minute. This room has no deadline.'],
      tap: ['Do not make procrastinating on me a habit.', 'I will keep watch. You keep going.'],
    },
    waist: {
      hover: ['Hands to yourself. You have a problem to solve.'],
      tap: ['This room is private, not lawless.'],
    },
    skirt: {
      hover: ['Stay focused. That is not the kind of attention you need.'],
      tap: ["Touch the notes instead of my skirt."],
    },
    legs: {
      hover: ['Sit down. Study. I will keep watch.', 'Standing all day will not make the answer come faster.'],
      tap: ['Sit. Breathe. Solve one thing at a time.', 'Poke me again and I will make you start the timer.'],
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
        speak((isStudyPage ? studyZones : zones)[zone].hover, 3800, 8);
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
      speak((isStudyPage ? studyZones : zones)[zone].tap, 4200, 9);
    }, { passive: true });
  };

  const bindStudyDialogue = () => {
    if (!isStudyPage) return;

    window.addEventListener('study:enter', (event) => {
      const messages = event.detail?.sound
        ? [
            'So you found the room behind the numbers.',
            'I saved you a quiet seat. The song can do the talking.',
          ]
        : [
            'No music? Fine. We can listen to the silence.',
            'The room is yours. Make it mean something.',
          ];

      window.setTimeout(() => speak(messages, 6000, 11), 1200);
    });

    window.addEventListener('study:play', () => {
      speak(['Headphones on. One thing at a time.', 'I will keep time. You keep going.'], 5000, 11);
    });

    window.addEventListener('study:pause', () => {
      speak(['Paused. Even a song needs to breathe.', 'Take a breath. Then come back to it.'], 5000, 11);
    });

    window.addEventListener('study:replay', () => {
      speak(['From the top. Maybe it sounds different this time.', 'Again. I am listening.'], 5000, 11);
    });

    window.addEventListener('study:lyrics', (event) => {
      const messages = event.detail?.visible
        ? ['I will give you the words. The video can keep its secrets.', 'Let us see which line gets you this time.']
        : ['Back to the original. The video says it better.', 'The video speaks for itself.'];
      speak(messages, 5000, 11);
    });

    window.addEventListener('study:loop', (event) => {
      const messages = event.detail?.enabled
        ? ['Again. Good. Repetition is a kind of discipline.', 'On repeat until the words stop stinging?']
        : ['One pass, then. No hiding in the chorus.', 'Loop off. The silence is going to notice.'];
      speak(messages, 5000, 11);
    });

    window.addEventListener('study:focus', () => {
      speak(['Twenty-five minutes. I will guard the door.', 'One task. No negotiations.'], 5500, 11);
    });

    window.addEventListener('study:focusstart', () => {
      speak(['Timer running. Stay with it. I am right here.', 'You can stop pretending you are not nervous.'], 5000, 11);
    });

    window.addEventListener('study:focuscomplete', (event) => {
      const messages = event.detail?.mode === 'break'
        ? ['Focus complete. Breathe before the next round.', 'The numbers can wait five minutes.']
        : ['Break over. Return when your mind is ready.', 'One thing. Just one.'];
      speak(messages, 6000, 11);
    });

    window.addEventListener('study:fullscreen', (event) => {
      const messages = event.detail?.active
        ? ['Fullscreen. Good. Let the rest of the page disappear.', 'No distractions. Just us and the numbers.']
        : ['Back to the room. Still here.'];
      speak(messages, 5000, 11);
    });
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

  bindStudyDialogue();

  if (document.body) {
    observer = new MutationObserver(reconcileDom);
    observer.observe(document.body, { childList: true, subtree: true });
    observerTimeout = window.setTimeout(stopObserving, MOUNT_TIMEOUT);
  }

  reconcileDom();
})();
