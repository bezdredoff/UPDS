const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const bundled = esbuild.buildSync({
  stdin: { contents: "export { audioCueNames, getCueDefinition } from './src/audio/AudioCues'; export { getMusicTheme } from './src/audio/MusicTheme';", resolveDir: root },
  bundle: true, platform: 'node', format: 'cjs', write: false,
});
const runtime = { exports: {} };
require('node:vm').runInNewContext(bundled.outputFiles[0].text, { module: runtime, exports: runtime.exports });
const { audioCueNames, getCueDefinition, getMusicTheme } = runtime.exports;
const definitions = { menu: getMusicTheme('menu'), vn: getMusicTheme('vn'), ending: getMusicTheme('ending') };
for (const cue of audioCueNames) definitions[cue] = getCueDefinition(cue);
fs.writeFileSync(path.join(root, 'godot/data/menu_audio.json'), `${JSON.stringify(definitions, null, 2)}\n`);
