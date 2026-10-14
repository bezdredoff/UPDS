const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.md'] = (module, filename) => { module.exports = fs.readFileSync(filename, 'utf8'); };
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.endsWith('?raw') ? name.slice(0, -4) : name, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);

const { godotCampaignBundle, godotMatch3Level } = require('../tests/fixtures/godotMatch3.ts');
const level = godotMatch3Level();
fs.writeFileSync(path.join(root, 'godot/data/locker_match3.json'), `${JSON.stringify(level, null, 2)}\n`);
const bundle = godotCampaignBundle();
fs.writeFileSync(path.join(root, 'godot/data/campaign_match3_levels.json'), `${JSON.stringify(bundle, null, 2)}\n`);
const assets = new Set([
  ...Object.values(bundle.assets).flatMap((group) => Object.values(group)),
  ...Object.values(level.assets),
  level.evidence.asset,
]);
for (const asset of assets) {
  if (typeof asset !== 'string' || !asset.startsWith('./assets/') || asset.includes('..')) {
    throw new Error(`Unexpected Match-3 asset: ${asset}`);
  }
  const target = path.join(root, 'godot', asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, 'public', asset), target);
}
console.log(`Exported ${bundle.levels.length} campaign levels, ${assets.size} gameplay assets, and ${Object.keys(level.localized).length} locales.`);
