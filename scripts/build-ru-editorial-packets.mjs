import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const outputDir = resolve(root, 'docs/reviews/g5a-ru');
const catalogFiles = [
  ['src/localization/catalogs/ru.ts', 'ruCatalog'],
  ['src/localization/catalogs/match3Guidance.ts', 'match3GuidanceCatalogs.ru'],
  ['src/localization/catalogs/match3Help.ts', 'ru'],
  ['src/localization/catalogs/match3Reactions.ts', 'ru'],
];

function unwrapExpression(expression) {
  let current = expression;
  while (current && (ts.isSatisfiesExpression(current) || ts.isAsExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.expression;
  }
  return current;
}

function objectProperty(object, propertyName) {
  const property = object.properties.find((candidate) => {
    if (!ts.isPropertyAssignment(candidate)) return false;
    const name = ts.isIdentifier(candidate.name) || ts.isStringLiteralLike(candidate.name) ? candidate.name.text : null;
    return name === propertyName;
  });
  return property && ts.isPropertyAssignment(property) ? unwrapExpression(property.initializer) : undefined;
}

function extractObject(sourcePath, variablePath) {
  const absolutePath = resolve(root, sourcePath);
  const sourceText = readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(absolutePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const [variableName, ...propertyPath] = variablePath.split('.');
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((candidate) => ts.isIdentifier(candidate.name) && candidate.name.text === variableName);

  let object = declaration?.initializer ? unwrapExpression(declaration.initializer) : undefined;
  for (const propertyName of propertyPath) {
    if (!object || !ts.isObjectLiteralExpression(object)) break;
    object = objectProperty(object, propertyName);
  }

  if (!object || !ts.isObjectLiteralExpression(object)) {
    throw new Error(`Object ${variablePath} not found in ${sourcePath}`);
  }

  const entries = [];
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = ts.isStringLiteralLike(property.name) ? property.name.text : null;
    const value = ts.isStringLiteralLike(property.initializer) ? property.initializer.text : null;
    if (key !== null && value !== null) entries.push({ key, value, sourcePath });
  }
  return entries;
}

function sceneRanges() {
  const sourcePath = 'src/data/storyGraph.ts';
  const source = readFileSync(resolve(root, sourcePath), 'utf8');
  const pattern = /id:'(VN_SCENE_[^']+)'.+?legacyIndex:(\d+).+?startLineId:'(VN\d{4}[ABC]?)',endLineId:'(VN\d{4}[ABC]?)'/g;
  return [...source.matchAll(pattern)].map((match) => ({
    id: match[1],
    legacyIndex: Number(match[2]),
    startLineId: match[3],
    endLineId: match[4],
  }));
}

function numericLineId(id) {
  return Number(/^VN(\d{4})/.exec(id)?.[1] ?? Number.NaN);
}

function markdownCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

const entries = catalogFiles.flatMap(([sourcePath, variableName]) => extractObject(sourcePath, variableName));
const byKey = new Map(entries.map((entry) => [entry.key, entry]));
const ranges = sceneRanges();
const storyLines = [];

for (const [key, entry] of byKey) {
  const match = /^vn\.line\.(VN\d{4}[ABC]?)\.text$/.exec(key);
  if (!match) continue;
  const id = match[1];
  const scene = ranges.find((candidate) => {
    const number = numericLineId(id);
    return number >= numericLineId(candidate.startLineId) && number <= numericLineId(candidate.endLineId);
  });
  storyLines.push({
    id,
    speaker: byKey.get(`vn.line.${id}.speaker`)?.value ?? '',
    emotion: byKey.get(`vn.line.${id}.emotion`)?.value ?? '',
    text: entry.value,
    sceneId: scene?.id ?? 'UNKNOWN_SCENE',
    sceneIndex: scene?.legacyIndex ?? -1,
    directive: /^\{.+\}$/.test(entry.value),
  });
}

storyLines.sort((left, right) => {
  const numberDifference = numericLineId(left.id) - numericLineId(right.id);
  return numberDifference || left.id.localeCompare(right.id, 'en');
});

const packetSceneGroups = [
  [0, 5], [6, 11], [12, 17], [18, 23], [24, 29], [30, 35], [36, 40], [41, 44],
];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const generatedFiles = [];
for (const [packetIndex, [firstScene, lastScene]] of packetSceneGroups.entries()) {
  const lines = storyLines.filter((line) => line.sceneIndex >= firstScene && line.sceneIndex <= lastScene);
  const chunks = [
    `# Пакет ${packetIndex + 1}: VN-сцены ${firstScene}–${lastScene}`,
    '',
    '> Проверять русскую речь и связность. ID, speaker и строки в фигурных скобках не переписывать. Emotion показывается игроку: английские и внутренние production-пометки в нём нужно отмечать отдельно.',
    '',
  ];
  let currentScene = '';
  for (const line of lines) {
    if (line.sceneId !== currentScene) {
      currentScene = line.sceneId;
      chunks.push(`## ${line.sceneId}`, '');
    }
    chunks.push(`- **${line.id} · ${line.speaker} · ${line.emotion}** — ${line.text}`);
  }
  chunks.push('');
  const filename = `packet-${String(packetIndex + 1).padStart(2, '0')}-vn-scenes-${String(firstScene).padStart(2, '0')}-${String(lastScene).padStart(2, '0')}.md`;
  const content = chunks.join('\n');
  writeFileSync(resolve(outputDir, filename), content, 'utf8');
  generatedFiles.push({ filename, kind: 'story', entries: lines.length, sha256: sha256(content) });
}

const qaPrefixes = ['levelLab.', 'sceneStudio.', 'saveDiagnostics.'];
const runtimeEntries = entries.filter(({ key }) => !key.startsWith('vn.line.') && !qaPrefixes.some((prefix) => key.startsWith(prefix)));
const qaEntries = entries.filter(({ key }) => qaPrefixes.some((prefix) => key.startsWith(prefix)));
const playerShellEntries = runtimeEntries.filter(({ key }) => !key.startsWith('match3.'));
const match3CoreEntries = runtimeEntries.filter(({ key }) => key.startsWith('match3.') && !key.startsWith('match3.level.') && !key.startsWith('match3.reaction.'));
const match3LevelEntries = runtimeEntries.filter(({ key }) => key.startsWith('match3.level.'));
const match3ReactionEntries = runtimeEntries.filter(({ key }) => key.startsWith('match3.reaction.'));
const match3LevelNumber = (key) => Number(/^match3\.level\.M3_(\d{2})_/.exec(key)?.[1] ?? Number.NaN);

for (const [filename, title, selectedEntries] of [
  ['packet-09-player-ui.md', 'Пакет 9: интерфейс игрока', playerShellEntries],
  ['packet-10-match3-core.md', 'Пакет 10: основной интерфейс и справка Match-3', match3CoreEntries],
  ['packet-11-match3-levels-00-10.md', 'Пакет 11: Match-3, уровни 00–10', match3LevelEntries.filter(({ key }) => match3LevelNumber(key) <= 10)],
  ['packet-12-match3-levels-11-21.md', 'Пакет 12: Match-3, уровни 11–21', match3LevelEntries.filter(({ key }) => match3LevelNumber(key) >= 11)],
  ['packet-13-match3-reactions.md', 'Пакет 13: реакции во время Match-3', match3ReactionEntries],
  ['appendix-qa-tools.md', 'Приложение: служебные QA-инструменты', qaEntries],
]) {
  const content = [
    `# ${title}`,
    '',
    '| Ключ | Русский текст |',
    '|---|---|',
    ...selectedEntries.map(({ key, value }) => `| ${markdownCell(key)} | ${markdownCell(value)} |`),
    '',
  ].join('\n');
  writeFileSync(resolve(outputDir, filename), content, 'utf8');
  generatedFiles.push({ filename, kind: filename.startsWith('appendix') ? 'qa' : 'runtime', entries: selectedEntries.length, sha256: sha256(content) });
}

const manifest = {
  sourceFiles: catalogFiles.map(([sourcePath]) => sourcePath),
  counts: {
    storyLines: storyLines.length,
    storyDirectives: storyLines.filter((line) => line.directive).length,
    playerUiAndMatch3: runtimeEntries.length,
    qaTools: qaEntries.length,
  },
  files: generatedFiles,
};
writeFileSync(resolve(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const readme = `# G5a · русская редакторская вычитка

Материалы собраны напрямую из runtime-каталогов. Они предназначены для редакторской проверки, а не для прямого импорта ответов модели.

Мой первичный разбор находится рядом: \`../G5A_RU_EDITORIAL_AUDIT_2026-09-12.md\`. Он не генерируется скриптом и хранит подтверждённые замечания и вопросы автору.

## Как передать Gemini

1. Откройте \`GEMINI_PROMPT_RU.md\` и отправьте его первым сообщением.
2. Прикладывайте по одному файлу \`packet-01…packet-13\`.
3. Для следующего пакета используйте короткую команду: «Продолжай по тем же правилам. Не повторяй замечания из прошлых пакетов».
4. Сохраните ответы отдельно. Любая предложенная правка должна пройти ручное подтверждение и затем вноситься по стабильному ключу/ID.
5. \`appendix-qa-tools.md\` проверяйте отдельно: английские технические термины там часто намеренны.

## Состав

- Пакеты 01–08: полный сценарий, сгруппированный по runtime-сценам.
- Пакет 09: видимый игроку интерфейс вне Match-3.
- Пакеты 10–13: основной Match-3, уровни 00–21 и контекстные реакции.
- Приложение: QA-инструменты, исключённые из основной вычитки.
- \`manifest.json\`: количество строк и SHA-256 каждого пакета для воспроизводимости.

## Ограничения

- Не менять ID, ключи, плейсхолдеры вида \`{count}\` и системные директивы в фигурных скобках.
- Не унифицировать голоса персонажей механически.
- Не принимать стилистическую правку без объяснения, что именно она улучшает.
- Отмечать противоречия между сценами с обеими ссылками на ID.
`;
writeFileSync(resolve(outputDir, 'README.md'), readme, 'utf8');

const prompt = `# Промпт для Gemini: редакторская вычитка русской версии

Ты — литературный редактор русскоязычной сюжетной игры: комедийной детективной visual novel с Match-3. Я буду присылать текст пакетами. Выполни именно редакторский аудит; не переписывай всё подряд.

Проверяй:

1. орфографию, пунктуацию, грамматику и управление;
2. неестественные, канцелярские или машинно звучащие формулировки;
3. смысловые провалы, нелогичные выводы и несвязные переходы;
4. противоречия в фактах, времени, уликах, мотивах и отношениях;
5. устойчивость имён, терминов и обращения на «ты/вы»;
6. голос персонажа, неуместные повторы, слабые или непонятные шутки;
7. чрезмерно длинные реплики, которые разумно сократить без потери смысла;
8. для UI — ясность действия, единообразие терминов и сохранность плейсхолдеров.

Жёсткие правила:

- Не меняй и не придумывай ID/ключи.
- Не редактируй speaker и системные строки в фигурных скобках; используй их как контекст.
- Поле emotion сейчас видно игроку. Если оно содержит английскую или внутреннюю production-пометку, предложи отдельную русскую экранную формулировку, не удаляя технический смысл постановки.
- Сохраняй имена, сюжетные факты, степень откровенности и авторский тон.
- Не заменяй удачные живые реплики на нейтральный литературный язык.
- Не считай английское название бренда или игровой термин ошибкой автоматически.
- Если контекста недостаточно, ставь «нужно решение автора», а не выдумывай факт.
- Не выдавай полный переписанный пакет.

Ответ дай одной таблицей:

| ID/ключ | Приоритет | Тип | Было | Предлагается | Почему | Связанный ID |
|---|---|---|---|---|---|---|

Приоритеты:

- P0 — фактическое противоречие, потеря смысла или поломка UI/плейсхолдера;
- P1 — объективная языковая ошибка или явно неестественная формулировка;
- P2 — полезная, но спорная стилистическая правка;
- AUTHOR — требуется решение автора.

Включай только строки, где правка или авторское решение действительно нужны. После таблицы добавь не более пяти общих наблюдений о связности и голосах персонажей. Если ошибок нет, скажи это прямо.
`;
writeFileSync(resolve(outputDir, 'GEMINI_PROMPT_RU.md'), prompt, 'utf8');

const resultTemplate = `# Шаблон сводки замечаний Gemini

Скопируйте сюда только подтверждённые замечания из ответов Gemini. Одна строка — одна будущая правка.

| Пакет | ID/ключ | Приоритет | Тип | Было | Предлагается | Почему | Решение автора |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  | принять / отклонить / обсудить |

Проверка перед переносом в runtime:

- ID или ключ существует в актуальном \`manifest.json\`.
- Плейсхолдеры и системные директивы сохранены.
- Замечание не дублирует уже принятую правку.
- Для сюжетного противоречия проверены оба связанных ID.
- Стилистическая правка сохраняет голос персонажа.
`;
writeFileSync(resolve(outputDir, 'GEMINI_RESULT_TEMPLATE.md'), resultTemplate, 'utf8');

console.log(`Generated ${storyLines.length} story lines and ${runtimeEntries.length} runtime UI/Match-3 entries in ${outputDir}`);
