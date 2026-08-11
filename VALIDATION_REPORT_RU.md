# ANM-016 — Validation Report

Версия: `0.16.0-anm016`  
Фича: Visual Presentation Polish + Match-3 Motion Refresh

## Scope

ANM-016 — polish-итерация поверх принятого ANM-015. Канон, stable VN IDs, `CHOICE_00`, основной save key, level data и production rig contract не меняются.

### VN presentation

- стабильный grid shell: top controls → stage → dialogue → VN controls;
- dialogue row имеет стабильную высоту, длинный текст скроллится внутри карточки;
- production portraits масштабируются по высоте stage вместо width-driven overflow;
- authored 9:16 background показывается полностью через `contain` foreground поверх мягкого `cover` fill;
- тот же background contract используется на `CHOICE_00`;
- preload текущих/следующих portrait layers и background уменьшает flash при переходах;
- regression audit покрывает 9 сцен, A/B/C branches, background cut на `VN0048`, четыре VN→Match3→VN перехода и финал до `VN0249`.

### Match-3 motion/input

- drag source следует за пальцем;
- соседняя клетка реагирует до commit threshold;
- drag / swipe / tap→tap совместимы;
- valid swap физически перемещает обе фишки;
- invalid no-match: forward swap → readable reject → return без расхода хода;
- blocked/ingredient reject не показывает fake swap;
- clear frame содержит pre-clear board + точные `clearedIndices`;
- settle frame содержит индивидуальные `fall/spawn` motions и расстояние в строках;
- motion применяется к `.tile-stack`, поэтому blocker/socket остаётся на месте;
- reduced-motion убирает декоративные длительные движения, сохраняя readable feedback;
- Match-3 assets preloaded на intro.

## Реально выполненные проверки в этой сессии

- Global TypeScript 5.8.3 strict source compile — **PASS** (`types: []` использован только во временном локальном tsconfig, чтобы повреждённый sandbox `node_modules/@types` не влиял на source check).
- TypeScript syntax/transpile для `src/**/*.ts` и `tests/**/*.ts` — **PASS**, 37 файлов без `.d.ts`.
- Version contract: `package.json`, `package-lock.json` root/packages и `APP_VERSION` = `0.16.0-anm016` — **PASS**.
- Поиск stale pinned app-version literals `0.10–0.15` в `src/tests` — **PASS**, совпадений нет.
- VN screenplay/static sequence audit — **PASS**: 262 authored rows; 9 scene ranges; `VN0040 → VN0041A/B/C`; cut на `VN0048`; runtime finale `VN0246–VN0249`.
- Match-3 motion metadata smoke — **PASS**: 100 deterministic games, 157 clear frames, 157 settle frames, 1386 fall/spawn motions; индексы/дистанции валидны.
- Gameplay-equivalence probe against exact ANM-015 engine — **PASS**: 100 deterministic seeds, 1168 moves; initial states, objective-aware hints, move results и final gameplay states идентичны ANM-015. Изменился только presentation trace.
- Protected-file byte comparison against accepted ANM-015 baseline — **PASS**.
- `.github/workflows/{ci,pages,import-zip}.yml` byte-for-byte совпадают с сохранёнными exact-current-main copies — **PASS**.

## `npm run check`

**NOT VERIFIED locally.** Clean `npm ci --offline --ignore-scripts` в sandbox завершается `ENOTCACHED`: локальный npm cache не содержит `why-is-node-running@2.3.0.tgz`.

GitHub mobile importer остаётся authoritative clean runner и должен выполнить `npm ci --ignore-scripts` → `npm run check` до создания candidate branch.

## Защищённые контракты

Byte-for-byte относительно принятого ANM-015 не изменены:

- `.github/workflows/ci.yml`
- `.github/workflows/pages.yml`
- `.github/workflows/import-zip.yml`
- `scripts/validate-upload-zip.py`
- `src/data/narrative.ts`
- `src/data/levels.ts`
- `src/data/characterRigs.ts`
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`
- `src/engine/CampaignStore.ts`

Основной save key остаётся `seiran-detectives-anm009-v1`.

`src/engine/Match3Game.ts` **намеренно изменён** только для presentation trace (`clearedIndices` / `fall|spawn motions`). Gameplay-equivalence probe подтверждает отсутствие изменения состояния игры на проверенных 1168 ходах.

## Известные ограничения / что проверяет GitHub preview

1. Финальная визуальная оценка portrait framing, background fit и отсутствия layout jumps требует реального browser/iPhone preview.
2. Полный Vitest/Vite build выполняет GitHub Actions из-за неполного локального npm cache.
3. Blocker damage пока не получает отдельную сложную hit-animation; его визуальное состояние обновляется в settle frame.
4. Haptics/audio из ANM-015 не менялись этой итерацией.

## Ручной QA

См. `docs/ANM016_VISUAL_MOTION_RU.md`.

## ANM-016 R2 — исправление GitHub Quality Gate

Первый candidate run выявил `ReferenceError: Image is not defined` в `src/platform/AssetPreloader.ts` при `UiSmoke.test.ts` под Vitest/Node. Исправление внесено в production preloader, а не в test-only mock: при отсутствии DOM `Image` preload безопасно становится no-op и не изменяет diagnostics counters; при отсутствии `window` scheduled preload также не запускается. Добавлен отдельный `AssetPreloader.test.ts`, проверяющий headless no-op и browser-like successful preload.
