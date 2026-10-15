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
const { godotMatch3ParityScenarios, godotMatch3SpecialActionScenario, godotMatch3ReshuffleScenario } = require('../tests/fixtures/godotMatch3Parity.ts');
const { match3ReactionRulesByLevel } = require('../src/data/match3Reactions.ts');
const { match3ReactionPolicies } = require('../src/ui/match3ReactionPresentation.ts');
const { enCatalog } = require('../src/localization/catalogs/en.ts');
const { ruCatalog } = require('../src/localization/catalogs/ru.ts');
const { beCatalog } = require('../src/localization/catalogs/be.ts');
const { characterProductionManifest } = require('../src/data/characterProduction.ts');
const { guestWitnessManifest } = require('../src/data/guestWitnesses.ts');
const level = godotMatch3Level();
fs.writeFileSync(path.join(root, 'godot/data/locker_match3.json'), `${JSON.stringify(level, null, 2)}\n`);
const bundle = godotCampaignBundle();
fs.writeFileSync(path.join(root, 'godot/data/campaign_match3_levels.json'), `${JSON.stringify(bundle, null, 2)}\n`);
const parityCases = [...godotMatch3ParityScenarios(), godotMatch3SpecialActionScenario(), godotMatch3ReshuffleScenario()];
fs.writeFileSync(path.join(root, 'godot/tests/fixtures/match3_parity_cases.json'), `${JSON.stringify(parityCases, null, 2)}\n`);
const assets = new Set([
  ...Object.values(bundle.assets).flatMap((group) => Object.values(group)),
  ...Object.values(level.assets),
  ...bundle.levels.map((campaignLevel) => campaignLevel.evidence.asset),
]);
const catalogs = { en: enCatalog, ru: ruCatalog, be: beCatalog };
const speakerIds = [...new Set(Object.values(match3ReactionRulesByLevel).flatMap((rules) => rules.map((rule) => rule.speaker)))].sort();
const speakerAssets = Object.fromEntries(speakerIds.map((speaker) => {
  const productionAsset = characterProductionManifest.characters[speaker]?.assets.medallion;
  const guestAsset = guestWitnessManifest.guests[speaker]?.assets?.medallion;
  const asset = productionAsset ?? guestAsset;
  if (!asset) throw new Error(`Missing Godot Match-3 reaction medallion: ${speaker}`);
  return [speaker, asset];
}));
for (const asset of Object.values(speakerAssets)) assets.add(asset);
for (const asset of assets) {
  if (typeof asset !== 'string' || !asset.startsWith('./assets/') || asset.includes('..')) {
    throw new Error(`Unexpected Match-3 asset: ${asset}`);
  }
  const target = path.join(root, 'godot', asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, 'public', asset), target);
}
const speakerNames = Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale,
  Object.fromEntries(speakerIds.map((speaker) => {
    const name = catalog[`character.${speaker}`];
    if (typeof name !== 'string' || !name) throw new Error(`Missing ${locale} Match-3 reaction speaker name: ${speaker}`);
    return [speaker, name];
  })),
]));
const reactionCopy = Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale,
  Object.fromEntries(Object.entries(catalog).filter(([key]) => key.startsWith('match3.reaction.') || key.startsWith('match3.bark.'))),
]));
const reactions = { schemaVersion: 1, rulesByLevel: match3ReactionRulesByLevel, policies: match3ReactionPolicies,
  localized: reactionCopy, speakerNames, speakerAssets };
fs.writeFileSync(path.join(root, 'godot/data/match3_reactions.json'), `${JSON.stringify(reactions, null, 2)}\n`);
console.log(`Exported ${bundle.levels.length} campaign levels, ${assets.size} gameplay/evidence/speaker assets, ${parityCases.length} gameplay parity cases, and ${speakerIds.length} Match-3 reaction speakers.`);
