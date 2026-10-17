// Generate cross-language algorithm vectors directly from the production paginator.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const bundle = buildSync({ entryPoints: [path.join(root, 'src/ui/vnDialoguePaging.ts')], bundle: true, platform: 'node', format: 'cjs', write: false });
const runtime = { exports: {} };
vm.runInNewContext(bundle.outputFiles[0].text, { module: runtime, exports: runtime.exports, Intl });
const { paginateDialogueTextMeasured, dialogueContinuationText } = runtime.exports;
const prologue = JSON.parse(fs.readFileSync(path.join(root, 'godot/data/prologue.json'), 'utf8'));
const cases = [];
for (const locale of ['ru', 'be', 'en']) {
  const texts = prologue.lines.map(line => ({ id: line.id, text: line.localized[locale].text }));
  texts.push(...['', 'one two three four five six seven eight nine ten eleven twelve.', 'Hello. A second sentence follows here. Last words stay together.', '«Quoted words» (remain intact), with: punctuation; and a final tail.', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 'a   b\n c\t d e f g h i j k l m n o p q r s t'].map((text, i) => ({ id: `edge-${i}`, text })));
  for (const { id, text } of texts) for (const budget of [34, 58, 90]) {
    const fits = candidate => Array.from(candidate).length <= budget;
    const normalized = text.replace(/\s+/g, ' ').trim();
    const sentences = Array.from(new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(normalized), entry => entry.segment.trim()).filter(Boolean);
    const pages = paginateDialogueTextMeasured(text, fits, locale);
    cases.push({ id: `${locale}-${id}-${budget}`, locale, text, budget, sentences, pages, displayed: pages.map((page, index) => dialogueContinuationText(page, index < pages.length - 1)) });
  }
}
fs.writeFileSync(path.join(root, 'godot/tests/fixtures/dialogue_paging_cases.json'), JSON.stringify({ source: 'src/ui/vnDialoguePaging.ts', cases }, null, 2) + '\n');
console.log(`Exported ${cases.length} production dialogue paging vectors.`);
