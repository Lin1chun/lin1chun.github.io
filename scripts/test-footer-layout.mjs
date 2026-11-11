import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import {
  access,
  mkdtemp,
  readFile,
  rm,
} from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import {
  dirname,
  extname,
  join,
  resolve,
  sep,
} from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const chromePath = chromeCandidates.find(existsSync);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

async function removeTemporaryDirectory(path) {
  if (!path) return;

  const temporaryRoot = resolve(tmpdir());
  const resolvedPath = resolve(path);
  if (!resolvedPath.startsWith(`${temporaryRoot}${sep}`)) {
    throw new Error(`Refusing to remove unexpected test directory: ${resolvedPath}`);
  }

  await rm(resolvedPath, {
    recursive: true,
    force: true,
    maxRetries: 20,
    retryDelay: 50,
  });
}

function createStaticServer(destination) {
  return createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const requestedPath = pathname.endsWith('/') ? join(pathname, 'index.html') : pathname;
      const filePath = resolve(destination, `.${requestedPath}`);

      if (!filePath.startsWith(`${resolve(destination)}${sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      await access(filePath);
      response.writeHead(200, {
        'content-type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

async function connectToChrome(port, browserPath) {
  const endpoint = `ws://127.0.0.1:${port}${browserPath}`;
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  let nextId = 1;

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;

    pending.delete(message.id);
    if (message.error) {
      request.reject(new Error(message.error.message));
    } else {
      request.resolve(message.result);
    }
  });

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  return {
    close: () => socket.close(),
    send(method, params = {}, sessionId) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitForFooter(client) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(client, "document.readyState === 'complete' && Boolean(document.querySelector('#main-footer'))")) {
      return;
    }
    await delay(50);
  }
  throw new Error('Footer did not render before the browser test timed out');
}

async function footerLayoutAt(client, width) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await client.send('Page.reload', { ignoreCache: true });
  await waitForFooter(client);

  return evaluate(client, `(() => {
    const groups = [
      ...document.querySelectorAll('#main-footer-primary, #main-footer-secondary > div'),
    ];
    return groups.map((group) => {
      const list = group.querySelector('ul');
      const links = [...group.querySelectorAll('a')];
      return {
        display: getComputedStyle(list).display,
        flexWrap: getComputedStyle(list).flexWrap,
        labels: links.map((link) => link.textContent.trim()),
        rows: new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size,
      };
    });
  })()`);
}

test(
  'footer links use compact wrapping rows and corrected social names',
  { skip: chromePath ? false : 'Chrome or Edge is required for the layout test' },
  async () => {
    const destination = await mkdtemp(join(tmpdir(), 'lin1chun-footer-test-'));
    const profile = await mkdtemp(join(tmpdir(), 'lin1chun-footer-chrome-'));
    let server;
    let chrome;
    let client;

    try {
      server = createStaticServer(destination);
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      const { port } = server.address();

      execFileSync(
        'hugo',
        [
          '--environment',
          'production',
          '--minify',
          '--destination',
          destination,
          '--baseURL',
          `http://127.0.0.1:${port}/`,
        ],
        { cwd: root, stdio: 'pipe' },
      );

      chrome = spawn(
        chromePath,
        [
          '--headless=new',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--remote-debugging-port=0',
          '--remote-allow-origins=*',
          `--user-data-dir=${profile}`,
          'about:blank',
        ],
        { stdio: 'ignore' },
      );

      const activePortPath = join(profile, 'DevToolsActivePort');
      let debugPort;
      let browserPath;
      for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
          const [portLine, pathLine] = (await readFile(activePortPath, 'utf8')).split('\n');
          debugPort = Number(portLine);
          browserPath = pathLine.trim();
          break;
        } catch {
          await delay(50);
        }
      }
      assert.ok(debugPort, 'Chrome should expose a DevTools port');
      assert.ok(browserPath, 'Chrome should expose a browser DevTools path');

      client = await connectToChrome(debugPort, browserPath);
      const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await client.send('Target.attachToTarget', {
        targetId,
        flatten: true,
      });
      const pageClient = {
        close: () => {},
        send(method, params = {}) {
          return client.send(method, params, sessionId);
        },
      };
      await pageClient.send('Page.enable');
      await pageClient.send('Runtime.enable');

      await pageClient.send('Page.navigate', {
        url: `http://127.0.0.1:${port}/`,
      });
      await waitForFooter(pageClient);

      const desktop = await footerLayoutAt(pageClient, 1440);
      const mobile = await footerLayoutAt(pageClient, 390);

      for (const group of [...desktop, ...mobile]) {
        assert.equal(group.display, 'flex');
        assert.equal(group.flexWrap, 'wrap');
      }
      assert.ok(
        desktop.every((group) => group.rows <= 2),
        `Desktop groups should use at most two rows: ${JSON.stringify(desktop)}`,
      );
      assert.ok(
        mobile.every((group) => group.rows <= 3),
        `Mobile groups should use at most three rows: ${JSON.stringify(mobile)}`,
      );

      assert.deepEqual(desktop[0].labels, [
        'Twitch',
        'Blog',
        'Reddit',
        'X.com',
        'Discord',
        'Official Website',
      ]);
      assert.deepEqual(desktop[1].labels, [
        'GitHub',
        'Bilibili',
        'ZJUDancer',
        'YouTube',
        'X.com',
        'Douyin',
        'Reddit',
      ]);
    } finally {
      client?.close();
      chrome?.kill();
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
      await Promise.all([
        removeTemporaryDirectory(destination),
        removeTemporaryDirectory(profile),
      ]);
    }
  },
);
