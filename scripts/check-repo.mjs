import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CONTENT_LICENSE.md',
  'LICENSE',
  'SECURITY.md',
  'VERSIONING.md',
  'THIRD_PARTY_NOTICES.md',
  '.editorconfig',
  '.gitattributes',
  '.hugo-version',
  '.nvmrc',
  '.github/workflows/hugo.yaml',
  '.github/workflows/ci.yaml',
  'docs/architecture.md',
  'docs/git-history.md',
  'docs/operations.md',
];
const forbiddenTracked = [
  /^public\//,
  /^resources\//,
  /^node_modules\//,
  /^\.hugo_build\.lock$/,
  /(?:^|\/)__pycache__\//,
];

const failures = [];

for (const file of requiredFiles) {
  try {
    await access(resolve(root, file));
  } catch {
    failures.push(`required file is missing: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
if (packageJson.version !== packageLock.version) {
  failures.push(
    `package.json version ${packageJson.version} does not match package-lock.json ${packageLock.version}`,
  );
}
if (packageJson.version !== packageLock.packages?.['']?.version) {
  failures.push('package-lock.json root package version does not match package.json');
}

const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  cwd: root,
  encoding: 'utf8',
}).split('\0').filter(Boolean);

for (const file of trackedFiles) {
  if (forbiddenTracked.some((pattern) => pattern.test(file))) {
    failures.push(`generated or local file is tracked: ${file}`);
  }
}

let exactTag = '';
try {
  exactTag = execFileSync(
    'git',
    ['describe', '--tags', '--exact-match', '--match', 'v[0-9]*', 'HEAD'],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  ).trim();
} catch {
  exactTag = '';
}

if (exactTag && exactTag !== `v${packageJson.version}`) {
  failures.push(`release tag ${exactTag} does not match package version v${packageJson.version}`);
}

if (failures.length) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Repository checks passed: ${trackedFiles.length} tracked files, version ${packageJson.version}${exactTag ? `, tag ${exactTag}` : ''}.`,
  );
}
