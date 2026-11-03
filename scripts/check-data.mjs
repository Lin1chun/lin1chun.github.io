import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = [
  join(root, 'data'),
  join(root, 'static', 'live2d-models'),
  join(root, 'static', 'live2d-widget'),
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path));
    } else if (entry.isFile() && extname(entry.name) === '.json') {
      files.push(path);
    }
  }

  return files;
}

const files = (await Promise.all(sourceRoots.map((directory) => walk(directory)))).flat().sort();
const failures = [];

for (const file of files) {
  try {
    JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    failures.push({
      file: relative(root, file),
      message: error.message,
    });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.file}: ${failure.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} JSON files.`);
}
