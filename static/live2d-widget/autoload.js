/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */

// Recommended to use absolute path for live2d_path parameter
// live2d_path 参数建议使用绝对路径
const live2d_path = '/live2d-widget/';
const preferenceKey = 'hiyori-widget-enabled';

// Migrate the old quit state without forcing the model back on for anyone who
// deliberately dismissed it.
try {
  if (
    localStorage.getItem(preferenceKey) === null &&
    localStorage.getItem('waifu-disabled') === 'true'
  ) {
    localStorage.setItem(preferenceKey, 'false');
  }
  localStorage.removeItem('waifu-disabled');
  localStorage.removeItem('waifu-display');
} catch (error) {
  console.warn('[Live2D Widget] Preferences are unavailable.', error);
}

// Method to encapsulate asynchronous resource loading
// 封装异步加载资源的方法
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.type = 'module';
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

let startPromise = null;

async function startLive2DWidget() {
  if (startPromise) return startPromise;

  // If you are concerned about display issues on mobile devices, you can use screen.width to determine whether to load
  // 如果担心手机上显示效果不佳，可以根据屏幕宽度来判断是否加载
  if (screen.width < 768) return false;

  startPromise = (async () => {
    // Avoid cross-origin issues with image resources
    // 避免图片资源跨域问题
    const OriginalImage = window.Image;
    window.Image = function(...args) {
      const img = new OriginalImage(...args);
      img.crossOrigin = "anonymous";
      return img;
    };
    window.Image.prototype = OriginalImage.prototype;
    // Load waifu.css and waifu-tips.js
    // 加载 waifu.css 和 waifu-tips.js
    await Promise.all([
      loadExternalResource(live2d_path + 'waifu.css', 'css'),
      loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
    ]);
    // For detailed usage of configuration options, see README.en.md
    // 配置选项的具体用法见 README.md
    initWidget({
      waifuPath: live2d_path + 'waifu-tips.json',
      cdnPath: '/live2d-models/',
      cubism2Path: live2d_path + 'live2d.min.js',
      cubism5Path: live2d_path + 'live2dcubismcore.min.js',
      tools: ['photo'],
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
}

window.startLive2DWidget = startLive2DWidget;

try {
  if (localStorage.getItem(preferenceKey) !== 'false') {
    startLive2DWidget();
  }
} catch {
  startLive2DWidget();
}

console.log(`\n%cLive2D%cWidget%c\n`, 'padding: 8px; background: #cd3e45; font-weight: bold; font-size: large; color: white;', 'padding: 8px; background: #ff5450; font-size: large; color: #eee;', '');

/*
く__,.ヘヽ.        /  ,ー､ 〉
         ＼ ', !-─‐-i  /  /´
         ／｀ｰ'       L/／｀ヽ､
       /   ／,   /|   ,   ,       ',
     ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
      ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
        !,/7 '0'     ´0iソ|    |
        |.从"    _     ,,,, / |./    |
        ﾚ'| i＞.､,,__  _,.イ /   .i   |
          ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
            | |/i 〈|/   i  ,.ﾍ |  i  |
           .|/ /  ｉ：    ﾍ!    ＼  |
            kヽ>､ﾊ    _,.ﾍ､    /､!
            !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
            ﾚ'ヽL__|___i,___,ンﾚ|ノ
                ﾄ-,/  |___./
                'ｰ'    !_,.:
*/
