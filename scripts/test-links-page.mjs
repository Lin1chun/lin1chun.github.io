import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let destination;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

before(async () => {
  destination = await mkdtemp(join(tmpdir(), 'lin1chun-links-test-'));
  execFileSync(
    'hugo',
    ['--environment', 'production', '--minify', '--destination', destination],
    { cwd: root, stdio: 'pipe' },
  );
});

after(async () => {
  if (!destination) return;

  const temporaryRoot = resolve(tmpdir());
  const resolvedDestination = resolve(destination);
  if (!resolvedDestination.startsWith(`${temporaryRoot}${sep}`)) {
    throw new Error(`Refusing to remove unexpected test directory: ${resolvedDestination}`);
  }

  await rm(resolvedDestination, { recursive: true, force: true });
});

test('links page separates friends from sites the author follows', async () => {
  const pagePath = join(destination, 'links', 'index.html');
  assert.ok(await exists(pagePath), 'Links page should be generated');

  const html = await readFile(pagePath, 'utf8');
  const friendsStart = html.indexOf('>Friend links</h2>');
  const sitesStart = html.indexOf('>Sites I enjoy</h2>');
  const commentsStart = html.indexOf('>Leave a friend link</h2>');

  assert.ok(friendsStart >= 0, 'Friend links heading should be present');
  assert.ok(sitesStart > friendsStart, 'Sites I enjoy should follow Friend links');
  assert.ok(commentsStart > sitesStart, 'Friend link invitation should follow both groups');

  const friends = html.slice(friendsStart, sitesStart);
  const sites = html.slice(sitesStart, commentsStart);

  assert.match(friends, /https:\/\/savia7582\.github\.io\/Exterior\//);
  assert.match(friends, /https:\/\/jiuchengovo\.github\.io\//);
  assert.doesNotMatch(friends, /https:\/\/vedal\.ai\//);
  assert.doesNotMatch(friends, /https:\/\/blog\.neurosama\.com\//);

  assert.match(sites, /https:\/\/vedal\.ai\//);
  assert.match(sites, /https:\/\/blog\.neurosama\.com\//);
  assert.doesNotMatch(sites, /https:\/\/savia7582\.github\.io\/Exterior\//);
});

test('legacy friends URL redirects to the links page', async () => {
  const redirectPath = join(destination, 'friends', 'index.html');
  assert.ok(await exists(redirectPath), 'Legacy Friends redirect should be generated');

  const html = await readFile(redirectPath, 'utf8');
  assert.match(html, /url=https:\/\/lin1chun\.github\.io\/links\//);
});
