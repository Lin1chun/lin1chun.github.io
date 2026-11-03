import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = [
  join(root, 'assets', 'js'),
  join(root, 'scripts'),
];
const extensions = new Set(['.js', '.mjs']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (entry.isFile() && extensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

const files = (await Promise.all(sourceRoots.map((directory) => walk(directory)))).flat().sort();
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    failures.push({
      file: relative(root, file),
      output: result.stderr.trim(),
    });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.file}: ${failure.output}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} JavaScript files.`);
}
