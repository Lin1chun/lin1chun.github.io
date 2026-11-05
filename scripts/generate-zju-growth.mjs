#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { copyFile, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { cc98Registry } from 'ubb-core/cc98';
import { ubbMarkdownRenderer } from 'ubb-core/cc98/markdown';

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archiveDirectory = join(root, '.local', 'cc98', '6266766');
const contentDirectory = join(root, 'content', 'en', 'life', 'zju-growth');
const lifeIndexPath = join(root, 'content', 'en', 'life', '_index.md');
const seriesIndexPath = join(root, 'content', 'en', 'series', 'zju-growth', '_index.md');
const publicAssetsDirectory = join(root, 'static', 'cc98', 'zju-growth');
const publicMediaManifestPath = join(archiveDirectory, 'public-media.json');
const generatedMarker = 'generator: zju-growth';
const topicId = 6266766;
const topicUrl = `https://www.cc98.org/topic/${topicId}`;
const topicAuthor = '林1纯';
const topicTitle = '★林1纯的世界★Lincraft《林1纯的ZJU成长 第二集 I don\'t want to be an engineer~🎶》';
const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const englishWeekdays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const themePatterns = [
  ['Online life', /98|论坛|直播|弹幕|B站|bilibili|Neuro|游戏|AI|网络/i],
  ['Everyday food', /吃|饭|奶茶|咖啡|零食|鸡|外卖|食堂|好喝|好吃|甜|辣|饿/],
  ['Making and drawing', /画|写作|代码|程序|设计|剪辑|修图|搭建|折腾/],
  ['Campus life', /课|考试|作业|老师|学校|宿舍|军训|社团|实验|浙大/],
  ['Late-night language', /晚上|凌晨|半夜|熬夜|通宵|晚安|困|睡/],
];

function printHelp() {
  console.log(`Generate the public reading layer for the ZJU Growth archive.

The complete CC98 thread stays in .local/. This command writes:
  content/en/life/zju-growth/          Monthly pages, draft by default
  content/en/life/_index.md            Life section landing page
  content/en/series/zju-growth/        Series term page
  static/cc98/zju-growth/              Web-sized copies of used images

Usage:
  npm run generate:zju-growth
  npm run generate:zju-growth -- --publish

Options:
  --publish   Set generated pages to draft: false
  --help      Show this help`);
}

function parseArgs(argv) {
  const options = { draft: true };
  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      printHelp();
      process.exit(0);
    }
    if (argument === '--publish') {
      options.draft = false;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function fileIsUsable(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

async function writeFileAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, content, 'utf8');
  await rename(temporaryPath, path);
}

async function writeJsonAtomic(path, value) {
  await writeFileAtomic(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function assertGeneratedFile(path) {
  try {
    const existing = await readFile(path, 'utf8');
    if (!existing.includes(generatedMarker) && !existing.includes('generator: "zju-growth"')) {
      throw new Error(`Refusing to overwrite hand-written file: ${path}`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim(), 'https://www.cc98.org/');
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    if (url.protocol === 'http:' && (url.hostname === 'cc98.org' || url.hostname.endsWith('.cc98.org'))) {
      url.protocol = 'https:';
    }
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function normalizeHugoDate(value) {
  const match = String(value ?? '').match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d+)?([+-]\d{2}:\d{2}|Z)$/);
  return match ? `${match[1]}${match[2]}` : value;
}

function yamlFrontMatter(values) {
  const lines = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n`;
}

function sanitizeReadingMarkdown(markdown) {
  let content = String(markdown ?? '')
    .replace(/\[hr\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  content = content
    .replace(/<(script|style|iframe|object|embed|form|svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?(?:script|style|iframe|object|embed|form|svg)\b[^>]*>/gi, '')
    .replace(/<https?:\/\/[^>]+>/gi, (match) => `\u0000${Buffer.from(match).toString('base64')}\u0000`)
    .replace(/<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/gi, (tag) => escapeHtml(tag))
    .replace(/\u0000([A-Za-z0-9+/=]+)\u0000/g, (_, encoded) => Buffer.from(encoded, 'base64').toString('utf8'))
    .replace(/\]\((\/(?:topic|board|user|post)\/[^)\s]+)\)/gi, '](https://www.cc98.org$1)')
    .replace(/(!?\[[^\]]*\]\()\s*(?:javascript|vbscript|file|data):[^)]*(\))/gi, '$1#$2')
    .replace(/\\\[/g, '&#91;')
    .replace(/\\\]/g, '&#93;')
    .replace(/\\\(/g, '&#40;')
    .replace(/\\\)/g, '&#41;')
    .replace(/\$/g, '&#36;')
    .replace(/\]\((BV[0-9A-Za-z]+|av\d+)\)/g, '](https://www.bilibili.com/video/$1)')
    .replace(/\{\{/g, '&#123;&#123;')
    .replace(/\}\}/g, '&#125;&#125;');

  return content.trim();
}

function normalizeMalformedQuoteClosers(value) {
  return String(value).replace(/\[\/quote(?!\])/gi, '[/quote]');
}

function splitMarkdownQuote(markdown) {
  const quoteLines = [];
  const bodyLines = [];
  for (const line of String(markdown).split('\n')) {
    if (line.trimStart().startsWith('>')) {
      quoteLines.push(line.replace(/^\s*>\s?/, ''));
    } else {
      bodyLines.push(line);
    }
  }
  return {
    quoteMarkdown: quoteLines.join('\n').trim(),
    bodyMarkdown: bodyLines.join('\n').trim(),
  };
}

function splitPostContent(post) {
  if (Number(post.contentType) === 1) {
    return splitMarkdownQuote(post.content);
  }

  const normalized = normalizeMalformedQuoteClosers(post.content);
  const nodes = cc98Registry.parse(normalized);
  const quoteNodes = nodes.filter((node) => (
    node.type === 'tag' && (node.tag === 'quote' || node.tag === 'quotex')
  ));
  const bodyNodes = nodes.filter((node) => (
    node.type !== 'tag' || (node.tag !== 'quote' && node.tag !== 'quotex')
  ));
  return {
    quoteMarkdown: ubbMarkdownRenderer.renderNodes(quoteNodes).trim(),
    bodyMarkdown: ubbMarkdownRenderer.renderNodes(bodyNodes).trim(),
  };
}

function quotedAuthor(post, quoteMarkdown) {
  const source = `${post.content}\n${quoteMarkdown}`;
  const match = source.match(/以下是引用\s*\d+\s*楼[：:]\s*用户(.+?)在\s*\d{4}-\d{2}-\d{2}/s);
  return match?.[1]?.trim() || '';
}

function markdownImageUrls(markdown) {
  return [...String(markdown).matchAll(/!\[[^\]]*\]\((?:<)?([^)\s>]+)(?:>)?\)/g)]
    .map((match) => normalizeUrl(match[1]))
    .filter(Boolean);
}

function visibleTextLength(markdown) {
  return [...String(markdown ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_`>\-\s]/g, '')].length;
}

function percentage(part, total) {
  return total ? `${((part / total) * 100).toFixed(1)}%` : '0%';
}

function inclusiveDaySpan(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

function longestDailyStreak(dates) {
  let best = dates.length ? 1 : 0;
  let current = best;
  let bestEnd = dates.at(-1) ?? '';
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00Z`);
    const currentDate = new Date(`${dates[index]}T00:00:00Z`);
    current = currentDate - previous === 86_400_000 ? current + 1 : 1;
    if (current > best) {
      best = current;
      bestEnd = dates[index];
    }
  }
  return { days: best, endDate: bestEnd };
}

function hasMeaningfulContent(markdown) {
  const withoutImages = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[-*_~\s]/g, '');
  return Boolean(withoutImages || /!\[[^\]]*\]\([^)]*\)/.test(markdown));
}

function sourcePostUrl(floor) {
  const page = Math.ceil(floor / 10);
  const anchor = ((floor - 1) % 10) + 1;
  return `${topicUrl}/${page}#${anchor}`;
}

function dateParts(timestamp) {
  const match = String(timestamp).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) {
    return { date: '1970-01-01', year: '1970', month: '01', day: '01', time: '00:00' };
  }
  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    year: match[1],
    month: match[2],
    day: match[3],
    time: `${match[4]}:${match[5]}`,
  };
}

function dayHeading(date) {
  const weekday = new Date(`${date}T12:00:00+08:00`).getUTCDay();
  const [year, month, day] = date.split('-').map(Number);
  return `${englishWeekdays[weekday]}, ${day} ${englishMonths[month - 1]} ${year}`;
}

function publicFileName(asset) {
  const sourceExtension = extname(asset.localFile).toLowerCase();
  if (sourceExtension === '.gif' || sourceExtension === '.svg') {
    return basename(asset.localFile);
  }
  return `${basename(asset.localFile, sourceExtension)}.webp`;
}

async function optimizeImage(asset, destination) {
  const source = join(archiveDirectory, asset.localFile);
  const sourceExtension = extname(source).toLowerCase();
  await mkdir(dirname(destination), { recursive: true });

  if (await fileIsUsable(destination)) {
    return;
  }

  if (sourceExtension === '.gif' || sourceExtension === '.svg') {
    await copyFile(source, destination);
    return;
  }

  const temporaryPath = `${destination}.${process.pid}.tmp.webp`;
  try {
    await execFileAsync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      source,
      '-vf',
      "scale=w='min(1600,iw)':h='min(1600,ih)':force_original_aspect_ratio=decrease",
      '-c:v',
      'libwebp',
      '-quality',
      '82',
      '-compression_level',
      '4',
      '-frames:v',
      '1',
      '-an',
      '-map_metadata',
      '-1',
      temporaryPath,
    ], { timeout: 90_000 });
    await rename(temporaryPath, destination);
  } catch {
    await copyFile(source, destination.replace(/\.webp$/i, sourceExtension));
    throw new Error(`__COPY_FALLBACK__:${destination.replace(/\.webp$/i, sourceExtension)}`);
  }
}

async function mapWithConcurrency(values, concurrency, task) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) {
        return;
      }
      results[index] = await task(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

async function preparePublicMedia(usedUrls) {
  const [assetsDocument, previousManifest] = await Promise.all([
    readJson(join(archiveDirectory, 'assets.json')),
    readJson(publicMediaManifestPath).catch(() => null),
  ]);
  const previousByUrl = new Map((previousManifest?.items ?? []).map((item) => [item.url, item]));
  const assetsByUrl = new Map(assetsDocument.assets.map((asset) => [asset.url, asset]));
  const urls = [...usedUrls].filter((url) => assetsByUrl.has(url)).sort();
  const items = [];
  let completed = 0;

  await mapWithConcurrency(urls, 4, async (url) => {
    const asset = assetsByUrl.get(url);
    if (asset.status !== 'downloaded' || !asset.localFile || !(asset.bytes > 0)) {
      items.push({ url, status: 'missing-source' });
      return;
    }

    const previous = previousByUrl.get(url);
    if (
      previous?.publicPath
      && previous.bytes > 0
      && await fileIsUsable(join(root, 'static', previous.publicPath.replace(/^\//, '')))
    ) {
      items.push(previous);
      completed += 1;
      return;
    }

    const filename = publicFileName(asset);
    const destination = join(publicAssetsDirectory, filename);
    let publicPath = `/cc98/zju-growth/${filename}`;
    try {
      await optimizeImage(asset, destination);
    } catch (error) {
      if (!error.message.startsWith('__COPY_FALLBACK__:')) {
        items.push({ url, status: 'error', reason: error.message });
        return;
      }
      const fallbackPath = error.message.slice('__COPY_FALLBACK__:'.length);
      publicPath = `/cc98/zju-growth/${basename(fallbackPath)}`;
    }
    const outputPath = join(root, 'static', publicPath.replace(/^\//, ''));
    if (!await fileIsUsable(outputPath)) {
      items.push({
        url,
        status: 'error',
        reason: 'Image optimization produced an empty file.',
      });
      return;
    }
    items.push({
      url,
      status: 'downloaded',
      source: asset.localFile,
      publicPath,
      sourceUrl: asset.url,
      bytes: (await stat(outputPath)).size,
    });
    completed += 1;
    if (completed % 25 === 0 || completed === urls.length) {
      console.log(`Optimized ${completed}/${urls.length} images.`);
    }
  });

  items.sort((left, right) => left.url.localeCompare(right.url));
  const manifest = {
    sourceUrl: topicUrl,
    generatedAt: new Date().toISOString(),
    items,
  };
  await writeJsonAtomic(publicMediaManifestPath, manifest);
  return manifest;
}

function imageMarkup(alt, originalUrl, mediaByUrl, fallbackAlt) {
  const normalizedUrl = normalizeUrl(originalUrl);
  const media = normalizedUrl ? mediaByUrl.get(normalizedUrl) : null;
  if (!media?.publicPath) {
    return `![${escapeHtml(alt)}](${originalUrl})`;
  }
  const isEmoji = /^https:\/\/www\.cc98\.org\/static\/images\//i.test(media.sourceUrl);
  const accessibleAlt = alt.trim() || fallbackAlt;
  const className = isEmoji ? 'zju-growth__emoji' : 'zju-growth__image';
  const image = `<img class="${className}" src="${escapeHtml(media.publicPath)}" alt="${escapeHtml(accessibleAlt)}" loading="lazy" decoding="async">`;
  if (isEmoji) {
    return image;
  }
  return `<a class="zju-growth__image-link" href="${escapeHtml(media.sourceUrl)}">${image}</a>`;
}

function rewriteImages(markdown, mediaByUrl, fallbackAlt) {
  return markdown.replace(/!\[([^\]]*)\]\((?:<)?([^)\s>]+)(?:>)?\)/g, (_, alt, url) => (
    imageMarkup(alt, url, mediaByUrl, fallbackAlt)
  ));
}

function renderPost(post, mediaByUrl) {
  const parts = dateParts(post.time);
  const source = sourcePostUrl(post.floor);
  const body = rewriteImages(
    post.bodyMarkdown,
    mediaByUrl,
    `CC98 image from ${parts.date} at ${parts.time}`,
  );
  const quote = rewriteImages(
    post.quoteMarkdown,
    mediaByUrl,
    `Quoted CC98 image from ${parts.date} at ${parts.time}`,
  );
  const quoteLabel = post.quoteAuthor
    ? `Quoted post from ${post.quoteAuthor}`
    : 'Quoted post';
  const quoteBlock = quote
    ? `{{< zju-quote label="${escapeHtml(quoteLabel)}" >}}\n${quote}\n{{< /zju-quote >}}`
    : '';
  return [
    `### <a id="floor-${post.floor}" href="${source}" aria-label="Open the original CC98 post from ${parts.date} at ${parts.time}">${parts.time}</a>`,
    '',
    quoteBlock,
    body,
    '',
  ].filter((part) => part !== '').join('\n');
}

function monthTitle(year, month) {
  return `${englishMonths[Number(month) - 1]} ${year}`;
}

function renderMonth(page, mediaByUrl, draft) {
  const days = new Map();
  for (const post of page.posts) {
    const parts = dateParts(post.time);
    if (!days.has(parts.date)) {
      days.set(parts.date, []);
    }
    days.get(parts.date).push(post);
  }

  const body = [ '{{< zju-growth >}}', '' ];
  for (const [date, posts] of [...days].sort(([left], [right]) => left.localeCompare(right))) {
    body.push(`## ${dayHeading(date)}`, '');
    for (const post of posts) {
      body.push(renderPost(post, mediaByUrl));
    }
  }
  body.push('{{< /zju-growth >}}', '');

  const firstTime = normalizeHugoDate(page.posts[0].time);
  const lastTime = normalizeHugoDate(page.posts.at(-1).time);
  const entryLabel = page.posts.length === 1 ? 'entry' : 'entries';
  const description = `${page.posts.length} ${entryLabel} · ${postsSpanLabel(page.posts)}`;
  return [
    yamlFrontMatter({
      title: monthTitle(page.year, page.month),
      date: firstTime,
      lastmod: lastTime,
      type: 'post',
      draft,
      author: ['Lin1chun'],
      description,
      series: ['ZJU Growth'],
      categories: ['Life and culture'],
      tags: ['journal', 'zju-growth'],
      toc: false,
      [generatedMarker.split(':')[0]]: generatedMarker.split(': ')[1],
    }),
    '',
    body.join('\n'),
  ].join('\n');
}

function postsSpanLabel(posts) {
  const first = dateParts(posts[0].time);
  const last = dateParts(posts.at(-1).time);
  if (first.date === last.date) {
    return `${Number(first.day)} ${englishMonths[Number(first.month) - 1]} ${first.year}, ${first.time}–${last.time}`;
  }
  if (first.year === last.year && first.month === last.month) {
    return `${Number(first.day)}–${Number(last.day)} ${englishMonths[Number(first.month) - 1]} ${first.year}`;
  }
  if (first.year === last.year) {
    return `${Number(first.day)} ${englishMonths[Number(first.month) - 1]}–${Number(last.day)} ${englishMonths[Number(last.month) - 1]} ${first.year}`;
  }
  return `${Number(first.day)} ${englishMonths[Number(first.month) - 1]} ${first.year}–${Number(last.day)} ${englishMonths[Number(last.month) - 1]} ${last.year}`;
}

function renderDonutChart(entryFormats, total) {
  let offset = 0;
  const segments = entryFormats.map((item, index) => {
    const share = (item.count / total) * 100;
    const segment = `<circle class="zju-donut__segment zju-donut__segment--${index + 1}" cx="100" cy="100" r="70" pathLength="100" stroke-dasharray="${share.toFixed(3)} ${(100 - share).toFixed(3)}" stroke-dashoffset="${(-offset).toFixed(3)}"></circle>`;
    offset += share;
    return segment;
  }).join('\n      ');
  const legend = entryFormats.map((item, index) => `
        <li>
          <span class="zju-chart__swatch zju-chart__swatch--${index + 1}" aria-hidden="true"></span>
          <span>${escapeHtml(item.label)}</span>
          <strong>${item.count.toLocaleString('en-GB')}</strong>
          <small>${percentage(item.count, total)}</small>
        </li>`).join('');
  return `
<figure class="zju-chart zju-chart--wide zju-chart--donut">
  <figcaption>How entries are written</figcaption>
  <div class="zju-donut-layout">
    <svg class="zju-donut" viewBox="0 0 200 200" role="img" aria-labelledby="zju-donut-title zju-donut-desc">
      <title id="zju-donut-title">Entry formats</title>
      <desc id="zju-donut-desc">${entryFormats.map((item) => `${item.label}: ${item.count} entries`).join('. ')}.</desc>
      <circle class="zju-donut__track" cx="100" cy="100" r="70"></circle>
      ${segments}
      <text class="zju-donut__total" x="100" y="98">${total.toLocaleString('en-GB')}</text>
      <text class="zju-donut__unit" x="100" y="118">entries</text>
    </svg>
    <ul class="zju-chart__legend">${legend}</ul>
  </div>
</figure>`;
}

function renderMonthChart(monthlyActivity) {
  const maximum = Math.max(...monthlyActivity.map((item) => item.count), 1);
  const peak = monthlyActivity.reduce((best, item) => item.count > best.count ? item : best);
  const bars = monthlyActivity.map((item) => {
    const size = (item.count / maximum) * 100;
    return `<span class="zju-month-bar" role="img" aria-label="${escapeHtml(item.label)}: ${item.count} entries" title="${escapeHtml(item.label)} — ${item.count} entries" style="--bar-size:${size.toFixed(3)}%"></span>`;
  }).join('');
  const labelIndexes = new Map([
    [0, 'Aug 25'],
    [4, 'Dec 25'],
    [7, 'Mar 26'],
    [11, 'Jul 26'],
    [14, 'Nov 26'],
  ]);
  const labels = [...labelIndexes].map(([index, label]) => (
    `<span style="grid-column:${index + 1}">${label}</span>`
  )).join('');
  return `
<figure class="zju-chart zju-chart--months">
  <figcaption>Entries by month · peak ${escapeHtml(peak.label)} (${peak.count})</figcaption>
  <div class="zju-month-chart">
    <div class="zju-month-bars">${bars}</div>
    <div class="zju-month-axis" aria-hidden="true">${labels}</div>
  </div>
</figure>`;
}

function renderHourChart(hours) {
  const maximum = Math.max(...hours.map((item) => item.count), 1);
  const bars = hours.map(({ hour, count }) => {
    const size = (count / maximum) * 100;
    const late = hour >= 22 || hour <= 2 ? ' is-late' : '';
    return `<span class="zju-hour-bar${late}" style="--bar-size:${size.toFixed(3)}%" title="${String(hour).padStart(2, '0')}:00 — ${count} entries"></span>`;
  }).join('');
  const peak = [...hours].sort((left, right) => right.count - left.count)[0];
  return `
<figure class="zju-chart zju-chart--wide zju-chart--hours">
  <figcaption>Posting times · peak ${String(peak.hour).padStart(2, '0')}:00</figcaption>
  <div class="zju-hour-chart" role="img" aria-label="Number of entries by hour of day. Peak is ${String(peak.hour).padStart(2, '0')}:00 with ${peak.count} entries.">
    <div class="zju-hour-bars">${bars}</div>
    <div class="zju-hour-axis" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
  </div>
</figure>`;
}

function renderThemeChart(themes) {
  const maximum = Math.max(...themes.map((item) => item.count), 1);
  const rows = themes.map((item) => {
    const size = (item.count / maximum) * 100;
    return `<li aria-label="${escapeHtml(item.label)}: ${item.count} entries">
      <span>${escapeHtml(item.label)}</span>
      <span class="zju-bar-track" aria-hidden="true"><span style="--bar-size:${size.toFixed(3)}%"></span></span>
      <strong>${item.count}</strong>
    </li>`;
  }).join('');
  return `
<figure class="zju-chart zju-chart--themes">
  <figcaption>What the text keeps returning to</figcaption>
  <ol class="zju-bar-list">${rows}</ol>
</figure>`;
}

function readableDate(value) {
  const parts = dateParts(value);
  return `${Number(parts.day)} ${englishMonths[Number(parts.month) - 1]} ${parts.year}`;
}

function renderLanding({
  firstDate,
  lastDate,
  postCount,
  dayCount,
  monthCount,
  spanDays,
  activeDayPercentage,
  longestStreak,
  medianLength,
  p90Length,
  imageEntries,
  quotedEntries,
  entryFormats,
  monthlyActivity,
  hours,
  themes,
  topTenDayShare,
  busiestMonthShare,
  medianEntriesPerActiveDay,
  nightEntries,
  nightPercentage,
  busiestDay,
  busiestMonth,
  busiestHour,
  busiestHourCount,
  imageCount,
  draft,
}) {
  const span = `${readableDate(firstDate)} to ${readableDate(lastDate)}`;
  const busiestMonthLabel = `${englishMonths[Number(busiestMonth.month) - 1]} ${busiestMonth.year}`;
  const busiestDayLabel = readableDate(`${busiestDay.date}T00:00:00+08:00`);
  const streakEnd = readableDate(`${longestStreak.endDate}T00:00:00+08:00`);
  const onlineLife = themes.find((theme) => theme.label === 'Online life')?.count ?? 0;
  const food = themes.find((theme) => theme.label === 'Everyday food')?.count ?? 0;
  const campus = themes.find((theme) => theme.label === 'Campus life')?.count ?? 0;
  const making = themes.find((theme) => theme.label === 'Making and drawing')?.count ?? 0;
  const lateNight = themes.find((theme) => theme.label === 'Late-night language')?.count ?? 0;
  const chartGrid = [
    renderDonutChart(entryFormats, postCount),
    renderMonthChart(monthlyActivity),
    renderThemeChart(themes),
    renderHourChart(hours),
  ].join('\n');
  return [
    yamlFrontMatter({
      title: 'ZJU Growth',
      date: normalizeHugoDate(firstDate),
      lastmod: normalizeHugoDate(lastDate),
      type: 'life',
      layout: 'zju-growth',
      draft,
      description: "Lin1chun's CC98 journal, arranged by month.",
      [generatedMarker.split(':')[0]]: generatedMarker.split(': ')[1],
    }),
    '',
    'This reading edition collects Lin1chun’s own entries from a long CC98 thread.',
    '',
    `${postCount.toLocaleString('en-GB')} entries on ${dayCount.toLocaleString('en-GB')} days with at least one entry, across a ${spanDays.toLocaleString('en-GB')}-day span.`,
    '',
    '## Archive at a glance',
    '',
    '| Measure | Figure |',
    '|:--|--:|',
    `| Period | ${span} |`,
    `| Calendar days | ${spanDays.toLocaleString('en-GB')} |`,
    `| Days with an entry | ${dayCount.toLocaleString('en-GB')} (${activeDayPercentage}) |`,
    `| Monthly pages | ${monthCount} |`,
    `| Longest daily streak | ${longestStreak.days} days, ending ${streakEnd} |`,
    `| Unique images | ${imageCount.toLocaleString('en-GB')} |`,
    '',
    '## How the archive behaves',
    '',
    '<div class="zju-chart-grid">',
    chartGrid,
    '</div>',
    '',
    '<!-- zju-analysis -->',
    '',
    '## Reading the charts',
    '',
    `Monthly activity is concentrated. The busiest 10% of active days hold ${topTenDayShare} of all entries, and ${busiestMonthLabel} accounts for ${busiestMonthShare}. On a typical active day, there are ${medianEntriesPerActiveDay} entries.`,
    '',
    `Most entries are text notes: ${entryFormats.find((item) => item.key === 'text').count.toLocaleString('en-GB')} (${percentage(entryFormats.find((item) => item.key === 'text').count, postCount)}). Another ${quotedEntries.toLocaleString('en-GB')} (${percentage(quotedEntries, postCount)}) are quoted conversations, ${entryFormats.find((item) => item.key === 'images').count.toLocaleString('en-GB')} (${percentage(entryFormats.find((item) => item.key === 'images').count, postCount)}) lead with a photo or screenshot, and ${entryFormats.find((item) => item.key === 'media').count.toLocaleString('en-GB')} (${percentage(entryFormats.find((item) => item.key === 'media').count, postCount)}) centre on a video or link. The median original note is ${medianLength} characters; 90% are ${p90Length} or shorter.`,
    '',
    `Posting peaks at ${busiestHour}:00 with ${busiestHourCount} entries, and ${nightPercentage} of all entries fall between 22:00 and 02:59. Online life (${onlineLife}) and food (${food}) are the two largest themes. Late-night language appears in ${lateNight} entries, campus life in ${campus}, and making or drawing in ${making}. The counts overlap because one entry can mention more than one theme.`,
    '',
    '### Archive persona: the after-hours scrapbooker',
    '',
    `The playful result is an after-hours scrapbooker: someone who leaves short, picture-heavy notes and often replies late at night. It describes posting habits, not a psychological diagnosis.`,
    '',
  ].join('\n');
}

function renderLifeIndex(draft) {
  return [
    yamlFrontMatter({
      title: 'Life',
      type: 'life',
      draft,
      description: 'Personal records and everyday archives.',
      [generatedMarker.split(':')[0]]: generatedMarker.split(': ')[1],
    }),
    '',
    'Notes and personal archives, arranged by subject.',
    '',
  ].join('\n');
}

function renderSeriesIndex(draft) {
  return [
    yamlFrontMatter({
      title: 'ZJU Growth',
      type: 'life',
      draft,
      description: "Lin1chun's CC98 journal, arranged by month.",
      [generatedMarker.split(':')[0]]: generatedMarker.split(': ')[1],
    }),
    '',
    'A monthly reading edition of a long CC98 thread. Source floors and the complete discussion remain in the local archive.',
    '',
  ].join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [postsDocument, assetsDocument] = await Promise.all([
    readJson(join(archiveDirectory, 'posts.json')),
    readJson(join(archiveDirectory, 'assets.json')),
  ]);

  if (postsDocument.topic?.replyCount !== 4487 || postsDocument.posts?.length !== 4488) {
    throw new Error('The local CC98 archive is incomplete or changed; refusing to generate a partial site.');
  }
  if (assetsDocument.assets?.some((asset) => asset.status === 'error')) {
    console.warn('The archive contains one known upstream image error; it will remain a source link if used.');
  }

  const readingPosts = postsDocument.posts
    .filter((post) => post.author === topicAuthor)
    .map((post) => {
      const parts = splitPostContent(post);
      const quoteMarkdown = sanitizeReadingMarkdown(parts.quoteMarkdown);
      const bodyMarkdown = sanitizeReadingMarkdown(parts.bodyMarkdown);
      return {
        ...post,
        quoteMarkdown,
        bodyMarkdown,
        quoteAuthor: quoteMarkdown ? quotedAuthor(post, quoteMarkdown) : '',
      };
    })
    .filter((post) => hasMeaningfulContent(post.bodyMarkdown) || hasMeaningfulContent(post.quoteMarkdown));
  const usedUrls = new Set(readingPosts.flatMap((post) => [
    ...markdownImageUrls(post.bodyMarkdown),
    ...markdownImageUrls(post.quoteMarkdown),
  ]));
  const publicMedia = await preparePublicMedia(usedUrls);
  const mediaByUrl = new Map(
    publicMedia.items
      .filter((item) => item.status === 'downloaded' && item.publicPath)
      .map((item) => [item.url, item]),
  );

  const months = new Map();
  for (const post of readingPosts) {
    const parts = dateParts(post.time);
    const key = `${parts.year}-${parts.month}`;
    if (!months.has(key)) {
      months.set(key, { year: parts.year, month: parts.month, posts: [] });
    }
    months.get(key).posts.push(post);
  }

  await mkdir(contentDirectory, { recursive: true });
  for (const [key, page] of [...months].sort(([left], [right]) => left.localeCompare(right))) {
    page.posts.sort((left, right) => left.time.localeCompare(right.time));
    const path = join(contentDirectory, `${key}.md`);
    await assertGeneratedFile(path);
    await writeFileAtomic(path, renderMonth(page, mediaByUrl, options.draft));
  }

  const allDates = readingPosts.map((post) => dateParts(post.time).date).sort();
  const uniqueDates = [...new Set(allDates)];
  const dayCounts = new Map();
  const hourCounts = new Map();
  let nightEntries = 0;
  for (const post of readingPosts) {
    const parts = dateParts(post.time);
    const hour = Number(parts.time.slice(0, 2));
    dayCounts.set(parts.date, (dayCounts.get(parts.date) || 0) + 1);
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    if (hour >= 22 || hour <= 2) {
      nightEntries += 1;
    }
  }
  const busiestDay = [...dayCounts]
    .sort((left, right) => right[1] - left[1])
    .map(([date, count]) => ({ date, count }))[0];
  const lengths = readingPosts
    .map((post) => visibleTextLength(post.bodyMarkdown))
    .sort((left, right) => left - right);
  const medianLength = lengths[Math.floor((lengths.length - 1) / 2)] ?? 0;
  const p90Length = lengths[Math.floor((lengths.length - 1) * 0.9)] ?? 0;
  const hasSubstantiveImage = (post) => (
    [...markdownImageUrls(post.bodyMarkdown), ...markdownImageUrls(post.quoteMarkdown)]
      .some((url) => !url.startsWith('https://www.cc98.org/static/images/'))
  );
  const imageEntries = readingPosts.filter(hasSubstantiveImage).length;
  const quotedEntries = readingPosts.filter((post) => Boolean(post.quoteMarkdown)).length;
  const entryFormats = [
    {
      key: 'quotes',
      label: 'Quoted conversations',
      count: readingPosts.filter((post) => Boolean(post.quoteMarkdown)).length,
    },
    {
      key: 'images',
      label: 'Photo or screenshot-led',
      count: readingPosts.filter((post) => !post.quoteMarkdown && hasSubstantiveImage(post)).length,
    },
    {
      key: 'media',
      label: 'Video or link-led',
      count: readingPosts.filter((post) => (
        !post.quoteMarkdown
        && !hasSubstantiveImage(post)
        && /\[(?:video|bili|audio|mp3)\]/i.test(post.content)
      )).length,
    },
    {
      key: 'text',
      label: 'Text notes',
      count: 0,
    },
  ];
  entryFormats.at(-1).count = readingPosts.length
    - entryFormats.slice(0, -1).reduce((sum, item) => sum + item.count, 0);
  const themes = themePatterns.map(([label, pattern]) => ({
    label,
    count: readingPosts.filter((post) => pattern.test(
      post.bodyMarkdown
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'),
    )).length,
  }));
  const busiestMonth = [...months.values()]
    .sort((left, right) => right.posts.length - left.posts.length)[0];
  const [busiestHour, busiestHourCount] = [...hourCounts]
    .sort((left, right) => right[1] - left[1])[0];
  const monthlyActivity = [...months.values()]
    .sort((left, right) => `${left.year}-${left.month}`.localeCompare(`${right.year}-${right.month}`))
    .map((month) => ({
      label: `${englishMonths[Number(month.month) - 1].slice(0, 3)} ${month.year.slice(-2)}`,
      count: month.posts.length,
    }));
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourCounts.get(hour) ?? 0,
  }));
  const dayValues = [...dayCounts.values()].sort((left, right) => right - left);
  const topDayCount = Math.ceil(dayValues.length * 0.1);
  const topTenDayShare = percentage(
    dayValues.slice(0, topDayCount).reduce((sum, count) => sum + count, 0),
    readingPosts.length,
  );
  const medianEntriesPerActiveDay = [...dayValues].reverse()[Math.floor((dayValues.length - 1) / 2)];
  const busiestMonthShare = percentage(busiestMonth.posts.length, readingPosts.length);
  const spanDays = inclusiveDaySpan(uniqueDates[0], uniqueDates.at(-1));
  const longestStreak = longestDailyStreak(uniqueDates);
  const landingPath = join(contentDirectory, '_index.md');
  await assertGeneratedFile(landingPath);
  await writeFileAtomic(landingPath, renderLanding({
    firstDate: readingPosts[0].time,
    lastDate: readingPosts.at(-1).time,
    postCount: readingPosts.length,
    dayCount: new Set(allDates).size,
    spanDays,
    activeDayPercentage: percentage(uniqueDates.length, spanDays),
    monthCount: months.size,
    longestStreak,
    medianLength,
    p90Length,
    imageEntries,
    quotedEntries,
    entryFormats,
    monthlyActivity,
    hours,
    themes,
    topTenDayShare,
    busiestMonthShare,
    medianEntriesPerActiveDay,
    nightEntries,
    nightPercentage: percentage(nightEntries, readingPosts.length),
    busiestDay,
    busiestMonth,
    busiestHour,
    busiestHourCount,
    imageCount: mediaByUrl.size,
    draft: options.draft,
  }));
  await assertGeneratedFile(lifeIndexPath);
  await writeFileAtomic(lifeIndexPath, renderLifeIndex(options.draft));
  await assertGeneratedFile(seriesIndexPath);
  await writeFileAtomic(seriesIndexPath, renderSeriesIndex(options.draft));

  const totalBytes = publicMedia.items
    .filter((item) => item.status === 'downloaded')
    .reduce((sum, item) => sum + (item.bytes ?? 0), 0);
  console.log(
    `Generated ${months.size} monthly pages from ${readingPosts.length} records, `
    + `${new Set(allDates).size} active days, and ${mediaByUrl.size} images `
    + `(${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`,
  );
  console.log(`Reading layer: ${contentDirectory}`);
  console.log(`Public media: ${publicAssetsDirectory}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
