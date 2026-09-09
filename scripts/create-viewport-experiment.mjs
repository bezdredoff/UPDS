// Build-artifact-only status-bar experiment. Never rewrites source or production metadata.
// Usage: node scripts/create-viewport-experiment.mjs <built-dist> <new-output-dir> <black-translucent|black|default>
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [input, output, statusBar] = process.argv.slice(2);
if (!input || !output || !['black-translucent', 'black', 'default'].includes(statusBar)) {
  throw new Error('Expected built-dist, new-output-dir, and black-translucent|black|default');
}
const source = resolve(input);
const target = resolve(output);
if (target === source || target.startsWith(`${source}\\`) || target.startsWith(`${source}/`)) throw new Error('Output must be outside the source build');
const html = await readFile(resolve(source, 'index.html'), 'utf8');
const pattern = /(<meta name="apple-mobile-web-app-status-bar-style" content=")[^"]+("\s*\/>)/;
if (!pattern.test(html)) throw new Error('Missing status-bar meta; refusing an uncontrolled experiment');
// Exclusive mkdir refuses to overwrite an earlier experiment.
await mkdir(target);
for (const name of await readdir(source)) {
  await cp(resolve(source, name), resolve(target, name), { recursive: true, force: false, errorOnExist: true });
}
await writeFile(resolve(target, 'index.html'), html.replace(pattern, `$1${statusBar}$2`));
await writeFile(resolve(target, 'viewport-experiment.json'), `${JSON.stringify({ statusBar, baseline: 'db6568ddb97bbd9773dafeff1d5cbc8585ae9c5c', policy: 'Serve each variant on a separate test origin, fresh install. Same JS/CSS/assets. This is not a production fix.' }, null, 2)}\n`);
process.stdout.write(`Created ${target} (${statusBar})\n`);
