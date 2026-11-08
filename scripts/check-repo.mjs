import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTENT_LICENSE.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'LICENSING.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md',
  'VERSIONING.md',
  '.editorconfig',
  '.gitattributes',
  '.hugo-version',
  '.nvmrc',
  '.github/CODEOWNERS',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/content_correction.yml',
  '.github/workflows/hugo.yaml',
  '.github/workflows/ci.yaml',
  '.github/workflows/release.yaml',
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
const changelog = await readFile(resolve(root, 'CHANGELOG.md'), 'utf8');
if (packageJson.version !== packageLock.version) {
  failures.push(
    `package.json version ${packageJson.version} does not match package-lock.json ${packageLock.version}`,
  );
}
if (packageJson.version !== packageLock.packages?.['']?.version) {
  failures.push('package-lock.json root package version does not match package.json');
}
if (!changelog.includes(`## [${packageJson.version}]`)) {
  failures.push(`CHANGELOG.md has no section for version ${packageJson.version}`);
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

if (failures.length) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Repository checks passed: ${trackedFiles.length} tracked files.`,
  );
}
