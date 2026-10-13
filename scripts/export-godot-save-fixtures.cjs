// Refresh the native save contract and parity vectors from the web implementation.
// Uses the repository's pinned TypeScript compiler; no fetched executables.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(compiled.outputText, filename);
};

const { saveContract, godotSaveCases } = require('../tests/fixtures/godotSaveCases.ts');
const fixtures = godotSaveCases();
fs.writeFileSync(path.join(root, 'godot/data/save_contract.json'), `${JSON.stringify(saveContract(), null, 2)}\n`);
fs.writeFileSync(path.join(root, 'godot/tests/save_format_cases.json'),
  `{\n  "timestamp": ${JSON.stringify(fixtures.timestamp)},\n  "cases": [\n${fixtures.cases.map((entry) => `    ${JSON.stringify(entry)}`).join(',\n')}\n  ]\n}\n`);
console.log(`Exported Godot save contract and ${fixtures.cases.length} web parity cases.`);
