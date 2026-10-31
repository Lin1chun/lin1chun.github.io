import { access, readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const entryPage = await readFile(join(publicDir, 'en', 'index.html'), 'utf8');
const canonicalMatch = entryPage.match(/rel=["']?canonical["']?[^>]+href=(["']?)([^"'\s>]+)\1/i);
const siteOrigin = canonicalMatch ? new URL(canonicalMatch[2]).origin : null;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (entry.isFile() && extname(entry.name) === '.html') {
      files.push(path);
    }
  }

  return files;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function localTarget(sourceFile, rawTarget) {
  const href = rawTarget.replaceAll('&amp;', '&');
  if (!href || href.startsWith('#')) return null;

  if (/^(?:[a-z]+:|\/\/)/i.test(href)) {
    const url = new URL(href, `${siteOrigin ?? 'http://localhost'}/`);
    if (!siteOrigin || url.origin !== siteOrigin) return null;
    return localPath(sourceFile, url.pathname);
  }

  return localPath(sourceFile, href);
}

function localPath(sourceFile, rawTarget) {
  const target = rawTarget.split('#', 1)[0].split('?', 1)[0];
  if (!target) return null;
  const decoded = decodeURIComponent(target);
  const path = decoded.startsWith('/')
    ? join(publicDir, decoded)
    : resolve(dirname(sourceFile), decoded);

  return extname(path) ? path : join(path, 'index.html');
}

const files = await walk(publicDir);
const broken = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const links = html.matchAll(/(?:href|src)=["']([^"']+)["']/gi);

  for (const match of links) {
    const target = localTarget(file, match[1]);
    if (target && !(await exists(target))) {
      broken.push({
        page: relative(publicDir, file),
        target: match[1],
      });
    }
  }
}

if (broken.length) {
  for (const item of broken) {
    console.error(`${item.page}: broken internal link ${item.target}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} HTML files; no broken internal links.`);
}
