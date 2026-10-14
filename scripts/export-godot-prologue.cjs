const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.endsWith('?raw') ? name.slice(0, -4) : name, ...args);
};
require.extensions['.md'] = (module, filename) => { module.exports = fs.readFileSync(filename, 'utf8'); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const { godotPrologue, godotLockerScene, godotPostMatchScene, godotStoryScene, godotVnAudio } = require('../tests/fixtures/godotPrologue.ts');
const prologue = godotPrologue();
fs.writeFileSync(path.join(root, 'godot/data/prologue.json'), `${JSON.stringify(prologue, null, 2)}\n`);
const lockerScene = godotLockerScene();
fs.writeFileSync(path.join(root, 'godot/data/locker_scene.json'), `${JSON.stringify(lockerScene, null, 2)}\n`);
const postMatchScene = godotPostMatchScene();
fs.writeFileSync(path.join(root, 'godot/data/post_match_scene.json'), `${JSON.stringify(postMatchScene, null, 2)}\n`);
const photoScene = godotStoryScene(3);
fs.writeFileSync(path.join(root, 'godot/data/photo_scene.json'), `${JSON.stringify(photoScene, null, 2)}\n`);
const postPhotoScene = godotStoryScene(4);
fs.writeFileSync(path.join(root, 'godot/data/post_photo_scene.json'), `${JSON.stringify(postPhotoScene, null, 2)}\n`);
const audioPath = path.join(root, 'godot/data/menu_audio.json');
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));
fs.writeFileSync(audioPath, `${JSON.stringify({ ...audio, ...godotVnAudio() }, null, 2)}\n`);
const assets = new Set([prologue.background, ...prologue.lines.flatMap((line) => line.actors.map((actor) => actor.asset))]);
for (const line of postMatchScene.lines) {
  assets.add(line.background);
  for (const actor of line.actors) assets.add(actor.asset);
}
for (const scene of [photoScene, postPhotoScene]) {
  assets.add(scene.background);
  for (const line of scene.lines) {
    assets.add(line.background);
    for (const actor of line.actors) assets.add(actor.asset);
  }
}
for (const lines of Object.values(lockerScene.variants)) {
  for (const line of lines) {
    assets.add(line.background);
    for (const actor of line.actors) assets.add(actor.asset);
  }
}
for (const asset of assets) {
  if (!asset.startsWith('./assets/') || asset.includes('..')) throw new Error(`Unexpected asset: ${asset}`);
  const target = path.join(root, 'godot', asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, 'public', asset), target);
}
console.log(`Exported ${prologue.lines.length} prologue lines, 3 locales, ${assets.size} original assets.`);
