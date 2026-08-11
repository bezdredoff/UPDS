# ANM-013 — Validation Report

**Build:** `0.13.0-anm013`  
**Feature:** VN Pre-release UX + Golden Sample Alignment

## Реально выполнено в этой сессии

- TypeScript strict для `src` (`tsc -p tsconfig.json --noEmit`) — **PASS**.
- TypeScript syntax transpile всех `tests/*.test.ts` — **PASS**.
- ANM-013 static/runtime-contract smoke — **PASS**:
  - authored screenplay rows: 262;
  - runtime finale включает `VN0246–VN0249`;
  - optional teaser `VN0250` остаётся authored и не входит в runtime scene 8;
  - save key не изменён;
  - тесты не фиксируют literal текущей/старой версии приложения;
  - Golden Sample UI реализован нативно без включения reference PNG в runtime.
- Byte-for-byte protected contract against known-good ANM-012 R2 baseline — **PASS** для 8 файлов:
  - `.github/workflows/ci.yml`;
  - `.github/workflows/pages.yml`;
  - `.github/workflows/import-zip.yml`;
  - `scripts/validate-upload-zip.py`;
  - `src/content/ANM-003_Vertical_Slice_Screenplay.md`;
  - `src/data/levels.ts`;
  - `src/engine/Match3Game.ts`;
  - `src/data/characterRigs.ts`.

ANM-012 R2 — это архив, который уже прошёл mobile importer и был смержен; сохранение его защищённых файлов побайтно предотвращает повтор проблемы с финальным переводом строки в workflow YAML.

## Полный npm gate

`npm run check` **НЕ объявляется локальным PASS** в этой сессии: sandbox не имеет полного установленного dependency tree, а offline `npm ci` блокируется отсутствующим cached tarball `why-is-node-running@2.3.0`. GitHub mobile importer должен выполнить authoritative clean `npm ci --ignore-scripts` + `npm run check` перед созданием candidate branch.

## Добавленные/изменённые runtime-функции

- LOG/backlog прочитанных VN-строк;
- SKIP только прочитанного с остановкой на unread/choice checkpoint;
- AUTO + slow/normal/fast session config;
- normal/large text session config;
- отдельный manual VN save slot при неизменном основном save key;
- resume `CHOICE_00` после выхода на прочитанном `VN0040`;
- priority preload следующего фона/portrait;
- runtime finale `VN0246–VN0249`;
- Golden Sample aligned top/dialogue/bottom control composition.

## Ручная проверка после GitHub `/preview/`

См. `docs/ANM013_VN_PRE_RELEASE_UX_RU.md`.
