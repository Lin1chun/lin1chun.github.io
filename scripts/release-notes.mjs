import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.env.GITHUB_REF_NAME;

if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) {
  throw new Error('GITHUB_REF_NAME must be a semantic version tag such as v0.6.1');
}

const version = tag.slice(1);
const changelog = await readFile(resolve(root, 'CHANGELOG.md'), 'utf8');
const escapedVersion = version.replaceAll('.', '\\.');
const section = changelog.match(
  new RegExp(
    `^## \\[${escapedVersion}\\] - \\d{4}-\\d{2}-\\d{2}\\r?\\n(?<body>[\\s\\S]*?)(?=^## \\[|\\z)`,
    'm',
  ),
);

if (!section?.groups?.body.trim()) {
  throw new Error(`CHANGELOG.md has no release notes for ${version}`);
}

const output = resolve(root, '.release-notes.md');
await writeFile(output, `${section.groups.body.trim()}\n`, 'utf8');
console.log(`Generated release notes for ${tag}.`);
