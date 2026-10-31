import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = resolve(root, 'data/neuro_blog_feed.json');
const feedUrl = process.env.NEURO_FEED_URL ?? 'https://blog.neurosama.com/feed.xml';
const limit = 3;

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function readTag(xml, name) {
  const match = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
  return match ? decodeEntities(match[1]) : '';
}

function plainText(value) {
  return decodeEntities(
    decodeEntities(value)
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEntry(entry) {
  const links = entry.match(/<link\b[^>]*>/gi) ?? [];
  const alternate = links.find((link) => readAttribute(link, 'rel') === 'alternate');
  const title = plainText(readTag(entry, 'title'));
  const content = readTag(entry, 'content') || readTag(entry, 'summary');
  const summary = plainText(content);

  return {
    title,
    url: alternate ? readAttribute(alternate, 'href') : '',
    published: readTag(entry, 'published') || readTag(entry, 'updated'),
    summary: summary.length > 320 ? `${summary.slice(0, 317).trimEnd()}...` : summary,
    author: plainText(readTag(entry, 'name')) || 'Neuro-sama',
  };
}

async function loadPrevious() {
  try {
    return JSON.parse(await readFile(snapshotPath, 'utf8'));
  } catch {
    return null;
  }
}

const previous = await loadPrevious();

try {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with HTTP ${response.status}.`);
  }

  const feed = await response.text();
  const entries = [...feed.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)]
    .slice(0, limit)
    .map((match) => parseEntry(match[1]))
    .filter((entry) => entry.title && entry.url);

  if (!entries.length) {
    throw new Error('No usable entries were found in the feed.');
  }

  const feedUpdated = readTag(feed, 'updated');
  const unchanged = previous
    && previous.feedUpdated === feedUpdated
    && JSON.stringify(previous.items) === JSON.stringify(entries);

  if (unchanged) {
    console.log('Neuro-sama feed snapshot is already current.');
  } else {
    const snapshot = {
      source: 'https://blog.neurosama.com/',
      feedUrl,
      feedUpdated,
      fetchedAt: new Date().toISOString(),
      items: entries,
    };

    await mkdir(dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    console.log(`Updated ${snapshotPath} with ${entries.length} entries.`);
  }
} catch (error) {
  if (!previous) {
    throw error;
  }

  console.warn(`Feed refresh failed; keeping the existing snapshot. ${error.message}`);
}
