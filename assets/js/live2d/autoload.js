(() => {
  'use strict';

  const ASSET_ROOT = '/live2d-widget/';
  const PREFERENCE_KEY = 'hiyori-widget-enabled';
  const MIN_VIEWPORT_WIDTH = 768;

  const readPreference = () => {
    try {
      return localStorage.getItem(PREFERENCE_KEY) === 'true';
    } catch {
      return false;
    }
  };

  const migrateLegacyPreference = () => {
    try {
      if (
        localStorage.getItem(PREFERENCE_KEY) === null &&
        localStorage.getItem('waifu-disabled') === 'true'
      ) {
        localStorage.setItem(PREFERENCE_KEY, 'false');
      }
      localStorage.removeItem('waifu-disabled');
      localStorage.removeItem('waifu-display');
    } catch (error) {
      console.warn('[Hiyori] Could not migrate stored preferences.', error);
    }
  };

  const loadStylesheet = (href) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.live2dResource = 'stylesheet';
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => {
      link.remove();
      reject(new Error(`Failed to load stylesheet: ${href}`));
    }, { once: true });
    document.head.appendChild(link);
  });

  const loadModule = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.dataset.live2dResource = 'module';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => {
      script.remove();
      reject(new Error(`Failed to load module: ${src}`));
    }, { once: true });
    document.head.appendChild(script);
  });

  let startPromise = null;

  const startLive2DWidget = async () => {
    if (startPromise) return startPromise;
    if (!window.matchMedia(`(min-width: ${MIN_VIEWPORT_WIDTH}px)`).matches) {
      return false;
    }

    startPromise = (async () => {
      await Promise.all([
        loadStylesheet(`${ASSET_ROOT}waifu.css`),
        loadModule(`${ASSET_ROOT}waifu-tips.js`),
      ]);

      if (typeof window.initWidget !== 'function') {
        throw new Error('Live2D widget runtime did not initialize.');
      }

      window.initWidget({
        waifuPath: `${ASSET_ROOT}waifu-tips.json`,
        cdnPath: '/live2d-models/',
        cubism2Path: `${ASSET_ROOT}live2d.min.js`,
        cubism5Path: `${ASSET_ROOT}live2dcubismcore.min.js`,
        tools: [],
        logLevel: 'warn',
        drag: false,
      });
      return true;
    })();

    try {
      return await startPromise;
    } catch (error) {
      startPromise = null;
      throw error;
    }
  };

  window.startLive2DWidget = startLive2DWidget;

  migrateLegacyPreference();
  if (readPreference()) {
    startLive2DWidget().catch((error) => {
      console.warn('[Hiyori] Model failed to load.', error);
    });
  }
})();
