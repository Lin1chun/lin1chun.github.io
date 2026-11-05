#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ubbToMarkdown } from 'ubb-core/cc98/markdown';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultUrl = 'https://www.cc98.org/topic/6266766';
const defaultApiUrl = 'https://api.cc98.org';
const tokenUrl = 'https://openid.cc98.org/connect/token';
const apiPageSize = 20;
const forumPageSize = 10;
const minimumDelayMs = 2_000;
const schemaVersion = 1;
const cc98ClientId = '9a1fd200-8687-44b1-4c20-08d50a96e5cd';
const cc98ClientSecret = process.env.CC98_CLIENT_SECRET ?? '';

const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

function printHelp() {
  console.log(`Archive one CC98 topic for personal blog migration.

Usage:
  CC98_ACCESS_TOKEN='...' npm run archive:cc98 -- [options]

Options:
  --url <url>               CC98 topic URL (default: ${defaultUrl})
  --out <directory>         Output directory (default: .local/cc98/<topic-id>)
  --delay-seconds <number>  Minimum gap between all network requests (default: 8)
  --max-pages <number>      Stop after this many pages, useful for a partial test
  --no-assets               Do not download images
  --download-attachments    Download non-image [upload]/[attach] files too
  --allow-external-assets   Download images from non-CC98 hosts
  --refresh                 Re-fetch the topic and every page
  --help                    Show this help

Authentication:
  This board cannot be read anonymously. Export a current CC98 access token:
    export CC98_ACCESS_TOKEN='...'
  A full "Bearer ..." value and CC98's localStorage "str-..." wrapper are
  accepted. To refresh an expired access token automatically, also export:
    export CC98_CLIENT_SECRET='...'
    export CC98_REFRESH_TOKEN='...'

The script never writes either token to disk and never sends it to asset hosts.
All API and asset requests share one serial, minimum-delay gate. HTTP 429/5xx
responses use Retry-After when present and exponential backoff otherwise.

Outputs:
  raw/topic.json             Topic metadata exactly as returned by the API
  raw/posts-*.json           Raw API response for each page
  posts.json                 Posts plus normalized metadata and original UBB
  assets.json                Image URL to local-file mapping
  thread.md                  Every floor, suitable for review before publishing
  article.md                 Only posts by the original topic author, with Hugo
                             front matter and draft: true
  assets/                    Downloaded images`);
}

function parseInteger(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be an integer from ${min} to ${max}.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = {
    url: defaultUrl,
    out: null,
    delayMs: Number.parseInt(process.env.CC98_DELAY_MS ?? '', 10) || 8_000,
    maxPages: Number.POSITIVE_INFINITY,
    downloadAssets: true,
    downloadAttachments: false,
    allowExternalAssets: false,
    refresh: false,
    apiUrl: process.env.CC98_API_URL || defaultApiUrl,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const takeValue = () => {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value.`);
      }
      index += 1;
      return value;
    };

    switch (argument) {
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      case '--url':
        options.url = takeValue();
        break;
      case '--out':
        options.out = takeValue();
        break;
      case '--delay-seconds':
        options.delayMs = Math.round(Number.parseFloat(takeValue()) * 1_000);
        break;
      case '--max-pages':
        options.maxPages = parseInteger(takeValue(), '--max-pages', { min: 1 });
        break;
      case '--no-assets':
        options.downloadAssets = false;
        break;
      case '--download-attachments':
        options.downloadAttachments = true;
        break;
      case '--allow-external-assets':
        options.allowExternalAssets = true;
        break;
      case '--refresh':
        options.refresh = true;
        break;
      default:
        if (argument.startsWith('-')) {
          throw new Error(`Unknown option: ${argument}`);
        }
        if (options.url !== defaultUrl) {
          throw new Error(`Unexpected argument: ${argument}`);
        }
        options.url = argument;
    }
  }

  if (!Number.isFinite(options.delayMs) || options.delayMs < minimumDelayMs) {
    throw new Error(`The request delay must be at least ${minimumDelayMs / 1_000} seconds.`);
  }

  const topicId = extractTopicId(options.url);
  const outputDirectory = resolve(root, options.out ?? join('.local', 'cc98', String(topicId)));
  const apiUrl = new URL(options.apiUrl);
  if (apiUrl.protocol !== 'https:' && apiUrl.hostname !== '127.0.0.1' && apiUrl.hostname !== 'localhost') {
    throw new Error('CC98_API_URL must use HTTPS unless it points at localhost.');
  }

  return {
    ...options,
    topicId,
    sourceUrl: `https://www.cc98.org/topic/${topicId}`,
    outputDirectory,
    apiUrl: apiUrl.toString().replace(/\/$/, ''),
  };
}

function extractTopicId(value) {
  const match = String(value).match(/(?:^|\/topic\/)(\d+)(?:\D|$)/i);
  if (!match) {
    throw new Error(`Could not find a topic ID in "${value}".`);
  }
  return Number.parseInt(match[1], 10);
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

function normalizeBearerToken(value) {
  let token = String(value ?? '').trim().replace(/^["']|["']$/g, '');
  if (token.startsWith('str-')) {
    token = token.slice(4);
  }
  try {
    token = decodeURIComponent(token);
  } catch {
    // Keep the original value when it is not URI encoded.
  }
  return token.replace(/^Bearer\s+/i, '').trim();
}

class RequestGate {
  constructor(delayMs) {
    this.delayMs = delayMs;
    this.nextRequestAt = 0;
  }

  async run(task) {
    const waitMs = Math.max(0, this.nextRequestAt - Date.now());
    if (waitMs) {
      await sleep(waitMs);
    }
    try {
      return await task();
    } finally {
      this.nextRequestAt = Date.now() + this.delayMs;
    }
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class HttpError extends Error {
  constructor(status, statusText, body, url) {
    const detail = String(body ?? '').replace(/\s+/g, ' ').trim().slice(0, 240);
    super(`HTTP ${status}${statusText ? ` ${statusText}` : ''}${detail ? `: ${detail}` : ''}`);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

class AuthSession {
  constructor(gate, requestTimeoutMs) {
    this.gate = gate;
    this.requestTimeoutMs = requestTimeoutMs;
    const accessToken = normalizeBearerToken(
      process.env.CC98_ACCESS_TOKEN
        ?? process.env.CC98_AUTHORIZATION
        ?? '',
    );
    this.authorization = accessToken ? `Bearer ${accessToken}` : '';
    this.refreshToken = normalizeBearerToken(process.env.CC98_REFRESH_TOKEN ?? '');
  }

  get canRefresh() {
    return Boolean(this.refreshToken);
  }

  async ensureAvailable() {
    if (!this.authorization && this.refreshToken) {
      await this.refreshAccessToken();
    }
    if (!this.authorization) {
      throw new AuthenticationError(
        'CC98_ACCESS_TOKEN is required. See --help for the safe setup instructions.',
      );
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new AuthenticationError('No CC98_ACCESS_TOKEN or CC98_REFRESH_TOKEN was provided.');
    }
    if (!cc98ClientSecret) {
      throw new AuthenticationError(
        'CC98_CLIENT_SECRET is required to refresh an expired access token.',
      );
    }

    const body = new URLSearchParams({
      client_id: cc98ClientId,
      client_secret: cc98ClientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    const response = await fetchWithRetries(this.gate, tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': getUserAgent(),
      },
      body,
    }, { timeoutMs: this.requestTimeoutMs });
    const responseText = await response.text();
    if (!response.ok) {
      throw new AuthenticationError(
        `CC98 token refresh failed with HTTP ${response.status}: ${responseText.slice(0, 240)}`,
      );
    }

    let tokenResponse;
    try {
      tokenResponse = JSON.parse(responseText);
    } catch {
      throw new AuthenticationError('CC98 token refresh returned invalid JSON.');
    }
    const accessToken = normalizeBearerToken(tokenResponse.access_token);
    if (!accessToken) {
      throw new AuthenticationError('CC98 token refresh did not return an access token.');
    }
    this.authorization = `Bearer ${accessToken}`;
    if (tokenResponse.refresh_token) {
      this.refreshToken = normalizeBearerToken(tokenResponse.refresh_token);
    }
  }
}

function getUserAgent() {
  return process.env.CC98_USER_AGENT
    || 'lin1chun-blog-cc98-archive/1.0 (low-rate personal archive)';
}

function retryAfterMs(response, attempt) {
  const value = response.headers.get('retry-after');
  if (value) {
    const seconds = Number.parseFloat(value);
    if (Number.isFinite(seconds)) {
      return Math.max(0, Math.round(seconds * 1_000));
    }
    const date = Date.parse(value);
    if (Number.isFinite(date)) {
      return Math.max(0, date - Date.now());
    }
  }
  return 2 ** attempt * 1_000 + Math.floor(Math.random() * 750);
}

async function fetchWithRetries(
  gate,
  url,
  init,
  { attempts = 5, timeoutMs, redirect = 'follow' } = {},
) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const { signal: _ignoredSignal, ...requestInit } = init;
      const response = await gate.run(() => fetch(url, {
        ...requestInit,
        redirect,
        cache: 'no-store',
        ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
      }));
      if (!retryableStatuses.has(response.status) || attempt === attempts - 1) {
        return response;
      }
      await response.body?.cancel();
      const delay = retryAfterMs(response, attempt);
      console.warn(
        `CC98 returned HTTP ${response.status}; retrying in ${(delay / 1_000).toFixed(1)} seconds.`,
      );
      await sleep(delay);
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) {
        break;
      }
      const delay = 2 ** attempt * 1_000 + Math.floor(Math.random() * 750);
      console.warn(`Request failed; retrying in ${(delay / 1_000).toFixed(1)} seconds.`);
      await sleep(delay);
    }
  }
  throw lastError ?? new Error(`Request failed after ${attempts} attempts: ${url}`);
}

async function requestApi({ gate, auth, url, referer, timeoutMs, attempts = 5 }) {
  await auth.ensureAvailable();
  let refreshed = false;

  while (true) {
    const headers = {
      Accept: 'application/json',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Authorization: auth.authorization,
      Referer: referer,
      'User-Agent': getUserAgent(),
    };
    const response = await fetchWithRetries(gate, url, {
      headers,
    }, { attempts, timeoutMs });

    if (response.status === 401 && !refreshed && auth.canRefresh) {
      await response.body?.cancel();
      await auth.refreshAccessToken();
      refreshed = true;
      continue;
    }

    const body = await response.text();
    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthenticationError(
          `CC98 rejected the token or board access (HTTP 401): ${body.slice(0, 240)}`,
        );
      }
      throw new HttpError(response.status, response.statusText, body, url);
    }
    return { body, response };
  }
}

async function requestJson(context, path) {
  const url = new URL(path, `${context.apiUrl}/`).toString();
  const { body, response } = await requestApi({ ...context, url });
  let data;
  try {
    data = JSON.parse(body.replace(/^\uFEFF/, ''));
  } catch {
    throw new Error(`CC98 returned invalid JSON for ${url} (${response.status}).`);
  }
  return data;
}

async function fileIsUsable(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
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

function manifestPath(outputDirectory) {
  return join(outputDirectory, 'manifest.json');
}

function rawTopicPath(outputDirectory) {
  return join(outputDirectory, 'raw', 'topic.json');
}

function rawPagePath(outputDirectory, from) {
  return join(outputDirectory, 'raw', `posts-${String(from).padStart(6, '0')}.json`);
}

function pageCount(topic) {
  const replies = Number(topic?.replyCount);
  const posts = Number.isFinite(replies) ? Math.max(1, replies + 1) : null;
  return posts === null ? null : Math.ceil(posts / apiPageSize);
}

async function fetchTopic(context, outputDirectory) {
  const topic = await requestJson(context, `/topic/${context.topicId}`);
  if (!topic || typeof topic !== 'object' || Array.isArray(topic)) {
    throw new Error('CC98 returned an unexpected topic metadata shape.');
  }
  await writeJsonAtomic(rawTopicPath(outputDirectory), topic);
  return topic;
}

async function fetchPage(context, outputDirectory, from) {
  const posts = await requestJson(
    context,
    `/Topic/${context.topicId}/post?from=${from}&size=${apiPageSize}`,
  );
  if (!Array.isArray(posts)) {
    throw new Error(`CC98 returned an unexpected post page shape at offset ${from}.`);
  }
  await writeJsonAtomic(rawPagePath(outputDirectory, from), posts);
  return posts;
}

function mergeManifestPages(existingPages, removedFrom) {
  return existingPages.filter((page) => page.from < removedFrom);
}

async function collectArchive(context, options) {
  const { outputDirectory } = options;

  let manifest = await readJsonIfExists(manifestPath(outputDirectory));
  if (manifest && manifest.schemaVersion !== schemaVersion) {
    throw new Error(
      `Unsupported archive manifest version ${manifest.schemaVersion}; expected ${schemaVersion}.`,
    );
  }
  if (manifest && Number(manifest.topicId) !== options.topicId) {
    throw new Error('The output directory contains a different topic.');
  }
  if (manifest && manifest.pageSize !== apiPageSize && !options.refresh) {
    const pagesUseCurrentSize = manifest.pages.length > 0
      && manifest.pages.every((page) => page.size === apiPageSize);
    if (!pagesUseCurrentSize) {
      throw new Error('The archive uses an older API page size; rerun with --refresh.');
    }
  }

  if (!options.refresh && manifest?.complete) {
    const topic = await readJsonIfExists(rawTopicPath(outputDirectory));
    if (!topic) {
      throw new Error('The archive manifest is complete, but raw/topic.json is missing.');
    }
    console.log('The archive is already complete. Use --refresh to check for changes.');
    return { topic, manifest };
  }

  await context.auth.ensureAvailable();
  await mkdir(join(outputDirectory, 'raw'), { recursive: true });

  manifest ??= {
    schemaVersion,
    sourceUrl: options.sourceUrl,
    apiUrl: options.apiUrl,
    topicId: options.topicId,
    pageSize: apiPageSize,
    createdAt: new Date().toISOString(),
    complete: false,
    pages: [],
    assets: [],
  };
  if (options.refresh) {
    manifest.pages = [];
    manifest.assets = [];
    manifest.complete = false;
  }
  manifest.pageSize = apiPageSize;

  console.log(`Fetching topic ${options.topicId} metadata.`);
  const topic = await fetchTopic(context, outputDirectory);

  const expectedPageCount = pageCount(topic);
  const expectedPosts = Number(topic.replyCount) + 1;
  if (
    !options.refresh
    && manifest.expectedPosts
    && Number(topic.replyCount) + 1 > manifest.expectedPosts
  ) {
    const lastPage = manifest.pages.at(-1);
    if (lastPage && lastPage.count < apiPageSize) {
      manifest.pages = mergeManifestPages(manifest.pages, lastPage.from);
      console.log('The final cached page may have gained replies and will be fetched again.');
    }
  }

  manifest.expectedPosts = Number.isFinite(expectedPosts) ? expectedPosts : null;
  manifest.topicFetchedAt = new Date().toISOString();
  manifest.updatedAt = manifest.topicFetchedAt;
  manifest.complete = false;
  await writeJsonAtomic(manifestPath(outputDirectory), manifest);

  const pagesByOffset = new Map(manifest.pages.map((page) => [page.from, page]));
  let terminalPage = false;

  for (let pageIndex = 0; pageIndex < (expectedPageCount ?? options.maxPages); pageIndex += 1) {
    if (pageIndex >= options.maxPages) {
      break;
    }
    const from = pageIndex * apiPageSize;
    let posts;
    const cached = pagesByOffset.get(from);
    const cachedFile = rawPagePath(outputDirectory, from);
    if (!options.refresh && cached && await fileIsUsable(cachedFile)) {
      posts = JSON.parse(await readFile(cachedFile, 'utf8'));
      if (!Array.isArray(posts) || posts.length !== cached.count) {
        console.warn(`Cached page at offset ${from} is inconsistent; fetching it again.`);
        posts = null;
      }
    }

    if (!posts) {
      console.log(`Fetching floor page ${pageIndex + 1}${expectedPageCount ? `/${expectedPageCount}` : ''}.`);
      posts = await fetchPage(context, outputDirectory, from);
      const page = {
        from,
        size: apiPageSize,
        count: posts.length,
        fetchedAt: new Date().toISOString(),
      };
      const existingIndex = manifest.pages.findIndex((entry) => entry.from === from);
      if (existingIndex >= 0) {
        manifest.pages[existingIndex] = page;
      } else {
        manifest.pages.push(page);
      }
      manifest.pages.sort((left, right) => left.from - right.from);
      pagesByOffset.set(from, page);
      manifest.updatedAt = new Date().toISOString();
      await writeJsonAtomic(manifestPath(outputDirectory), manifest);
    }

    if (!posts.length) {
      terminalPage = true;
      break;
    }
    if (posts.length < apiPageSize) {
      terminalPage = true;
      if (expectedPageCount === null) {
        break;
      }
    }
  }

  const expectedFetched = expectedPageCount === null
    ? terminalPage
    : manifest.pages.length >= expectedPageCount;
  manifest.complete = expectedFetched;
  manifest.updatedAt = new Date().toISOString();
  await writeJsonAtomic(manifestPath(outputDirectory), manifest);

  if (!manifest.complete) {
    console.log('Archive checkpoint saved. Run the same command again to continue.');
  }
  return { topic, manifest };
}

function decodeHtml(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function normalizeHttpUrl(value) {
  let raw = decodeHtml(String(value ?? '')).trim().replace(/^["']|["']$/g, '');
  if (!raw) {
    return null;
  }
  if (raw.startsWith('//')) {
    raw = `https:${raw}`;
  }
  try {
    const url = new URL(raw, 'https://www.cc98.org/');
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    if (url.protocol === 'http:' && isCc98Host(url.hostname)) {
      url.protocol = 'https:';
    }
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function hasImageExtension(url) {
  return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
}

function collectUrlsFromContent(content) {
  const images = [];
  const attachments = [];
  const links = [];
  const add = (list, value) => {
    const url = normalizeHttpUrl(value);
    if (url && !list.some((entry) => entry.href === url.href)) {
      list.push({ href: url.href });
    }
  };

  const source = String(content ?? '');
  for (const match of source.matchAll(/<img\b[^>]*\bsrc=["']?([^"'\s>]+)["']?[^>]*>/gi)) {
    add(images, match[1]);
  }
  for (const match of source.matchAll(/\[img(?:=[^\]]*)?\]([\s\S]*?)\[\/img\]/gi)) {
    add(images, match[1]);
  }
  for (const match of source.matchAll(/\[(upload|attach)(?:=[^\]]*)?\]([\s\S]*?)\[\/(?:upload|attach)\]/gi)) {
    const url = normalizeHttpUrl(match[2]);
    if (url && hasImageExtension(url)) {
      add(images, match[2]);
    } else {
      add(attachments, match[2]);
    }
  }
  for (const match of source.matchAll(/\[url(?:=([^\]]+))?\]([\s\S]*?)\[\/url\]/gi)) {
    const url = normalizeHttpUrl(match[1] || match[2]);
    if (!url) {
      continue;
    }
    if (hasImageExtension(url)) {
      add(images, url.href);
    } else {
      add(links, url.href);
    }
  }
  for (const match of source.matchAll(/https?:\/\/[^\s<>"'\]\[）)]+/gi)) {
    const url = normalizeHttpUrl(match[0]);
    if (!url) {
      continue;
    }
    if (hasImageExtension(url)) {
      add(images, url.href);
    } else {
      add(links, url.href);
    }
  }

  const imageUrls = images.map((entry) => entry.href);
  const attachmentUrls = attachments.map((entry) => entry.href);
  const excludedLinks = new Set([...imageUrls, ...attachmentUrls]);
  return {
    images: imageUrls,
    attachments: attachmentUrls,
    links: links.map((entry) => entry.href).filter((url) => !excludedLinks.has(url)),
  };
}

function collectMarkdownImageUrls(markdown) {
  const images = [];
  for (const match of String(markdown ?? '').matchAll(/!\[[^\]]*\]\((?:<)?([^)\s>]+)(?:>)?\)/g)) {
    const url = normalizeHttpUrl(match[1]);
    if (url && !images.includes(url.href)) {
      images.push(url.href);
    }
  }
  return images;
}

function postFloor(post, fallback) {
  const value = Number(post.floor ?? post.postBasicInfo?.floor);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function postTime(post) {
  return post.time ?? post.replyTime ?? post.postBasicInfo?.time ?? '';
}

function mergeUniqueUrls(...lists) {
  return [...new Set(lists.flat().filter(Boolean))];
}

function collectMediaContent(mediaContent) {
  const images = [];
  const attachments = [];
  const links = [];
  const visit = (value, key = '') => {
    if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry, key));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        visit(childValue, childKey);
      }
      return;
    }
    if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) {
      return;
    }
    const url = normalizeHttpUrl(value);
    if (!url) {
      return;
    }
    if (hasImageExtension(url) || /thumbnail|image|cover|poster/i.test(key)) {
      images.push(url.href);
    } else if (/audio|video|file|attachment|media/i.test(key)) {
      attachments.push(url.href);
    } else {
      links.push(url.href);
    }
  };
  visit(mediaContent);
  return {
    images: [...new Set(images)],
    attachments: [...new Set(attachments)],
    links: [...new Set(links)],
  };
}

function normalizePost(post, fallbackFloor, fallbackMediaContent = null) {
  const author = String(
    post.userName
      ?? post.user?.name
      ?? post.userInfo?.name
      ?? post.postBasicInfo?.userName
      ?? '匿名',
  );
  const collectedUrls = collectUrlsFromContent(post.content);
  const mediaUrls = collectMediaContent(post.mediaContent ?? fallbackMediaContent);
  const contentType = Number(post.contentType ?? 0);
  const contentMarkdown = contentType === 1
    ? String(post.content ?? '')
    : ubbToMarkdown(String(post.content ?? ''));
  const renderedImages = collectMarkdownImageUrls(contentMarkdown);
  return {
    id: post.id ?? null,
    floor: postFloor(post, fallbackFloor),
    author,
    userId: post.userId ?? post.postBasicInfo?.userId ?? null,
    time: postTime(post),
    isAnonymous: post.isAnonymous ?? post.postBasicInfo?.isAnonymous ?? false,
    isDeleted: post.isDeleted ?? post.postBasicInfo?.isDeleted ?? false,
    likeCount: post.likeCount ?? null,
    dislikeCount: post.dislikeCount ?? null,
    rating: post.rating ?? null,
    ratings: post.ratings ?? null,
    contentType,
    mediaContent: post.mediaContent ?? fallbackMediaContent ?? null,
    content: String(post.content ?? ''),
    contentMarkdown,
    images: mergeUniqueUrls(collectedUrls.images, mediaUrls.images, renderedImages),
    attachments: mergeUniqueUrls(collectedUrls.attachments, mediaUrls.attachments),
    links: mergeUniqueUrls(collectedUrls.links, mediaUrls.links),
    raw: post,
  };
}

function isPrivateHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    normalized === 'localhost'
    || normalized === '0.0.0.0'
    || normalized === '::1'
    || normalized.endsWith('.localhost')
  ) {
    return true;
  }
  if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(normalized)) {
    return true;
  }
  if (/^169\.254\./.test(normalized) || /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(normalized)) {
    return true;
  }
  return /^(?:fc|fd|fe80):/i.test(normalized);
}

function isCc98Host(hostname) {
  const normalized = hostname.toLowerCase();
  return normalized === 'cc98.org' || normalized.endsWith('.cc98.org');
}

function contentDispositionFilename(value) {
  if (!value) {
    return null;
  }
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return encoded[1];
    }
  }
  const plain = value.match(/filename="?([^";]+)"?/i);
  return plain?.[1] ?? null;
}

function extensionForContentType(contentType) {
  const normalized = String(contentType ?? '').split(';', 1)[0].trim().toLowerCase();
  return {
    'image/avif': '.avif',
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
    'image/webp': '.webp',
  }[normalized] ?? null;
}

function safeAssetName(url, filenameHint, contentType) {
  const candidate = filenameHint || basename(url.pathname);
  let extension = extname(candidate).toLowerCase();
  if (!/^\.[a-z0-9]{1,8}$/i.test(extension)) {
    extension = extensionForContentType(contentType) || '.bin';
  }
  const stem = basename(candidate, extname(candidate))
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'image';
  const hash = createHash('sha256').update(url.href).digest('hex').slice(0, 12);
  return `${hash}-${stem}${extension}`;
}

function assetTargetError(url, options) {
  if (isPrivateHostname(url.hostname)) {
    return 'Private or local network address.';
  }
  if (!isCc98Host(url.hostname) && !options.allowExternalAssets) {
    return 'Non-CC98 host; use --allow-external-assets to download it.';
  }
  return null;
}

async function requestAsset(context, options, initialUrl) {
  let url = initialUrl;
  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    const targetError = assetTargetError(url, options);
    if (targetError) {
      throw new Error(targetError);
    }
    const response = await fetchWithRetries(context.gate, url, {
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.5',
        Referer: options.sourceUrl,
        'User-Agent': getUserAgent(),
      },
    }, { attempts: 4, timeoutMs: context.timeoutMs, redirect: 'manual' });
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: url };
    }
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) {
      throw new Error(`Asset redirect ${response.status} did not include a Location header.`);
    }
    const redirected = normalizeHttpUrl(new URL(location, url).href);
    if (!redirected) {
      throw new Error('Asset redirect used an unsupported URL.');
    }
    url = redirected;
  }
  throw new Error('Asset exceeded the redirect limit.');
}

async function downloadAssets(context, options, posts, manifest) {
  if (!options.downloadAssets) {
    return [];
  }

  const existingByUrl = new Map((manifest.assets ?? []).map((asset) => [asset.url, asset]));
  const allAssets = new Map();
  for (const post of posts) {
    for (const urlValue of post.images) {
      const url = normalizeHttpUrl(urlValue);
      if (!url) {
        continue;
      }
      if (!isCc98Host(url.hostname) && !options.allowExternalAssets) {
        allAssets.set(url.href, {
          url: url.href,
          status: 'external',
          reason: 'Non-CC98 host; use --allow-external-assets to download it.',
        });
        continue;
      }
      if (isPrivateHostname(url.hostname)) {
        allAssets.set(url.href, {
          url: url.href,
          status: 'blocked',
          reason: 'Private or local network address.',
        });
        continue;
      }
      if (!allAssets.has(url.href)) {
        const existing = existingByUrl.get(url.href);
        const shouldRetry = existing?.status === 'error'
          || (existing?.status === 'external' && options.allowExternalAssets);
        allAssets.set(url.href, shouldRetry
          ? { ...existing, status: 'pending' }
          : existing ?? { url: url.href, status: 'pending' });
      }
    }
  }

  if (options.downloadAttachments) {
    for (const post of posts) {
      for (const urlValue of post.attachments) {
        const url = normalizeHttpUrl(urlValue);
        if (!url || (!isCc98Host(url.hostname) && !options.allowExternalAssets)) {
          continue;
        }
        if (!allAssets.has(url.href)) {
          const existing = existingByUrl.get(url.href);
          allAssets.set(url.href, existing?.status === 'error' ? {
            ...existing,
            status: 'pending',
          } : existing ?? {
            url: url.href,
            status: 'pending',
            attachment: true,
          });
        }
      }
    }
  }

  const assetDirectory = join(options.outputDirectory, 'assets');
  await mkdir(assetDirectory, { recursive: true });
  const existingFiles = new Set(await readdir(assetDirectory));
  const assets = [];
  let index = 0;

  for (const asset of allAssets.values()) {
    index += 1;
    if (asset.status !== 'pending') {
      assets.push(asset);
      continue;
    }
    const hashPrefix = createHash('sha256').update(asset.url).digest('hex').slice(0, 12);
    const existingName = [...existingFiles].find((name) => name.startsWith(`${hashPrefix}-`));
    if (
      existingName
      && await fileIsUsable(join(assetDirectory, existingName))
    ) {
      assets.push({
        ...asset,
        status: 'downloaded',
        localFile: join('assets', existingName),
        bytes: (await stat(join(assetDirectory, existingName))).size,
      });
      continue;
    }

    const url = new URL(asset.url);
    console.log(`Downloading asset ${index}/${allAssets.size}: ${url.host}${url.pathname}`);
    try {
      const { response, finalUrl } = await requestAsset(context, options, url);
      if (!response.ok) {
        await response.body?.cancel();
        assets.push({
          ...asset,
          status: 'error',
          httpStatus: response.status,
          reason: response.statusText,
        });
        continue;
      }

      const contentType = response.headers.get('content-type') ?? '';
      const normalizedContentType = contentType.toLowerCase().split(';', 1)[0].trim();
      const isImage = normalizedContentType.startsWith('image/')
        || (
          hasImageExtension(finalUrl)
          && ['', 'application/octet-stream', 'binary/octet-stream'].includes(normalizedContentType)
        );
      if (!asset.attachment && !isImage) {
        await response.body?.cancel();
        assets.push({
          ...asset,
          status: 'skipped',
          reason: `Unexpected content type: ${contentType || 'unknown'}`,
        });
        continue;
      }

      const contentLength = Number(response.headers.get('content-length'));
      const configuredMaxMiB = Number(process.env.CC98_MAX_ASSET_MB);
      const maxMiB = Number.isFinite(configuredMaxMiB) && configuredMaxMiB > 0
        ? Math.min(configuredMaxMiB, 500)
        : 50;
      const maxBytes = maxMiB * 1024 * 1024;
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        await response.body?.cancel();
        assets.push({
          ...asset,
          status: 'skipped',
          reason: `Asset is larger than ${maxBytes / 1024 / 1024} MiB.`,
        });
        continue;
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > maxBytes) {
        assets.push({
          ...asset,
          status: 'skipped',
          reason: `Asset is larger than ${maxBytes / 1024 / 1024} MiB.`,
        });
        continue;
      }
      const filename = safeAssetName(
        finalUrl,
        contentDispositionFilename(response.headers.get('content-disposition')),
        contentType,
      );
      const localFile = join('assets', filename);
      await writeFile(join(options.outputDirectory, localFile), bytes, { flag: 'wx' }).catch(async (error) => {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        await writeFile(join(options.outputDirectory, localFile), bytes);
      });
      existingFiles.add(filename);
      assets.push({
        ...asset,
        status: 'downloaded',
        localFile,
        contentType: contentType || null,
        bytes: bytes.length,
      });
    } catch (error) {
      assets.push({ ...asset, status: 'error', reason: error.message });
    }
    if (index % 10 === 0) {
      manifest.assets = assets;
      manifest.updatedAt = new Date().toISOString();
      await writeJsonAtomic(manifestPath(options.outputDirectory), manifest);
    }
  }

  manifest.assets = assets;
  manifest.updatedAt = new Date().toISOString();
  await writeJsonAtomic(manifestPath(options.outputDirectory), manifest);
  return assets;
}

function escapeMarkdown(value) {
  return String(value ?? '').replace(/([\\`*_[\]<>])/g, '\\$1');
}

function plainTextFromMarkdown(markdown) {
  return String(markdown)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rewriteAssetLinks(markdown, assets) {
  const downloaded = assets.filter((asset) => asset.status === 'downloaded' && asset.localFile);
  let result = String(markdown);
  for (const asset of downloaded) {
    const variants = new Set([asset.url]);
    const parsed = new URL(asset.url);
    if (parsed.protocol === 'https:') {
      parsed.protocol = 'http:';
      variants.add(parsed.href);
    }
    for (const variant of variants) {
      result = result.replaceAll(variant, asset.localFile);
      result = result.replaceAll(variant.replaceAll('&', '&amp;'), asset.localFile);
    }
  }
  return result;
}

function topicAuthor(topic, posts) {
  const name = topic.userName ?? topic.user?.name ?? topic.postBasicInfo?.userName;
  const userId = topic.userId ?? topic.user?.id ?? topic.postBasicInfo?.userId;
  const firstPost = posts[0];
  return {
    name: String(name ?? firstPost?.author ?? '未知用户'),
    userId: userId ?? firstPost?.userId ?? null,
  };
}

function sourcePostUrl(topicId, floor) {
  const page = Math.max(1, Math.ceil(floor / forumPageSize));
  const anchor = ((floor - 1) % forumPageSize) + 1;
  return `https://www.cc98.org/topic/${topicId}/${page}#${anchor}`;
}

function renderPostContent(post, assets) {
  let content = rewriteAssetLinks(post.contentMarkdown, assets).trim();
  const missingImages = post.images.filter((url) => !content.includes(url));
  if (missingImages.length) {
    const localImages = missingImages.map((url) => {
      const asset = assets.find((entry) => entry.url === url && entry.status === 'downloaded');
      return `![](${asset?.localFile ?? url})`;
    });
    content = [content, ...localImages].filter(Boolean).join('\n\n');
  }
  const missingAttachments = post.attachments.filter((url) => !content.includes(url));
  if (missingAttachments.length) {
    const attachmentLinks = missingAttachments.map((url) => `[附件](${url})`);
    content = [content, ...attachmentLinks].filter(Boolean).join('\n\n');
  }
  return content;
}

function yamlFrontMatter(values) {
  const lines = Object.entries(values)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function renderPost(post, topicId, assets) {
  const content = renderPostContent(post, assets);
  const details = [];
  if (post.likeCount) {
    details.push(`赞 ${post.likeCount}`);
  }
  if (post.dislikeCount) {
    details.push(`踩 ${post.dislikeCount}`);
  }
  if (post.rating) {
    details.push(`评分 ${post.rating}`);
  }
  if (post.isDeleted) {
    details.push('已删除');
  }

  const header = [
    `## ${post.floor} 楼 · ${escapeMarkdown(post.author)}${post.time ? ` · ${post.time}` : ''}`,
    '',
    `[原帖](${sourcePostUrl(topicId, post.floor)})${details.length ? ` · ${details.join(' · ')}` : ''}`,
  ].join('\n');
  return `${header}\n\n${content || '_（原帖没有正文）_'}\n`;
}

function renderThread(topic, topicId, posts, assets) {
  const author = topicAuthor(topic, posts);
  const firstTime = posts[0]?.time;
  const lastTime = posts.at(-1)?.time;
  const metadata = [
    topic.boardName ? `版面：${topic.boardName}` : null,
    Number.isFinite(Number(topic.replyCount)) ? `回复：${topic.replyCount}` : null,
    Number.isFinite(Number(topic.hitCount)) ? `浏览：${topic.hitCount}` : null,
  ].filter(Boolean).join(' · ');

  return [
    yamlFrontMatter({
      title: topic.title ?? `CC98 主题 ${topicId}`,
      author: author.name,
      date: firstTime,
      lastmod: lastTime,
      source: `https://www.cc98.org/topic/${topicId}`,
      board: topic.boardName,
      draft: true,
    }),
    '',
    `> [CC98 原帖](https://www.cc98.org/topic/${topicId})${metadata ? ` · ${metadata}` : ''}`,
    '',
    ...posts.map((post) => renderPost(post, topicId, assets)),
  ].join('\n');
}

function renderArticle(topic, topicId, posts, assets) {
  const author = topicAuthor(topic, posts);
  const authoredPosts = posts.filter((post) => (
    author.userId !== null
      ? String(post.userId) === String(author.userId) && !post.isAnonymous
      : post.author === author.name
  ));
  const selectedPosts = authoredPosts.length ? authoredPosts : posts.slice(0, 1);
  const description = plainTextFromMarkdown(selectedPosts[0]?.contentMarkdown ?? '').slice(0, 180);
  const body = selectedPosts.map((post) => {
    const intro = [
      `## ${post.floor} 楼${post.time ? ` · ${post.time}` : ''}`,
      '',
      `[原帖](${sourcePostUrl(topicId, post.floor)})`,
    ].join('\n');
    return `${intro}\n\n${renderPostContent(post, assets) || '_（原帖没有正文）_'}`;
  }).join('\n\n');

  return [
    yamlFrontMatter({
      title: topic.title ?? `CC98 主题 ${topicId}`,
      author: author.name,
      date: selectedPosts[0]?.time,
      lastmod: selectedPosts.at(-1)?.time,
      description,
      source: `https://www.cc98.org/topic/${topicId}`,
      board: topic.boardName,
      draft: true,
    }),
    '',
    `> 来源：[CC98 原帖](https://www.cc98.org/topic/${topicId})`,
    '',
    body,
    '',
  ].join('\n');
}

async function assembleOutputs(context, options, topic, manifest) {
  const pages = [];
  for (const page of [...manifest.pages].sort((left, right) => left.from - right.from)) {
    const path = rawPagePath(options.outputDirectory, page.from);
    if (!await fileIsUsable(path)) {
      if (!manifest.complete) {
        return null;
      }
      throw new Error(`Missing raw page for offset ${page.from}.`);
    }
    pages.push(...JSON.parse(await readFile(path, 'utf8')));
  }

  const seenPostIds = new Set();
  const posts = pages.map((post, index) => {
    const normalized = normalizePost(
      post,
      index + 1,
      index === 0 ? topic.mediaContent : null,
    );
    if (normalized.id !== null) {
      const key = String(normalized.id);
      if (seenPostIds.has(key)) {
        normalized.duplicate = true;
      }
      seenPostIds.add(key);
    }
    return normalized;
  });

  const assets = await downloadAssets(context, options, posts, manifest);
  const links = posts.flatMap((post) => post.links.map((href) => ({
    href,
    postId: post.id,
    floor: post.floor,
  })));
  const source = {
    url: options.sourceUrl,
    apiUrl: options.apiUrl,
    topicId: options.topicId,
  };
  const postsOutput = {
    schemaVersion,
    source,
    fetchedAt: new Date().toISOString(),
    topic,
    posts,
  };

  await writeJsonAtomic(join(options.outputDirectory, 'posts.json'), postsOutput);
  await writeJsonAtomic(join(options.outputDirectory, 'assets.json'), {
    source,
    fetchedAt: new Date().toISOString(),
    assets,
  });
  await writeJsonAtomic(join(options.outputDirectory, 'links.json'), {
    source,
    fetchedAt: new Date().toISOString(),
    links,
  });
  await writeFileAtomic(
    join(options.outputDirectory, 'thread.md'),
    renderThread(topic, options.topicId, posts, assets),
  );
  await writeFileAtomic(
    join(options.outputDirectory, 'article.md'),
    renderArticle(topic, options.topicId, posts, assets),
  );

  const downloaded = assets.filter((asset) => asset.status === 'downloaded').length;
  const assetErrors = assets.filter((asset) => asset.status === 'error').length;
  console.log(
    `Wrote ${posts.length} floors, ${downloaded} local assets, and ${links.length} links to ${options.outputDirectory}.`,
  );
  if (assetErrors) {
    console.warn(`${assetErrors} assets failed to download; see assets.json.`);
  }
  return postsOutput;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const gate = new RequestGate(options.delayMs);
  const timeoutMs = Number(process.env.CC98_REQUEST_TIMEOUT_MS) || 45_000;
  const auth = new AuthSession(gate, timeoutMs);

  const context = {
    apiUrl: options.apiUrl,
    gate,
    auth,
    timeoutMs,
    topicId: options.topicId,
    referer: options.sourceUrl,
  };
  const { topic, manifest } = await collectArchive(context, options);
  const result = await assembleOutputs(context, options, topic, manifest);
  if (result && manifest.complete) {
    const assetProblems = (manifest.assets ?? []).filter(
      (asset) => ['error', 'skipped', 'blocked'].includes(asset.status),
    );
    console.log(`Archive complete. Output: ${options.outputDirectory}`);
    if (assetProblems.length) {
      console.log(`${assetProblems.length} assets need review in assets.json.`);
    }
  }
}

export {
  collectUrlsFromContent,
  extractTopicId,
  normalizeBearerToken,
  normalizePost,
  renderArticle,
  renderThread,
  rewriteAssetLinks,
};

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof AuthenticationError ? error.message : error.stack ?? error.message);
    process.exitCode = 1;
  });
}
