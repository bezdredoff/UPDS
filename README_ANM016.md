# ANM-016 — Visual Presentation Polish + Match-3 Motion Refresh

Версия: `0.16.0-anm016`.

ANM-016 — polish-итерация поверх ANM-015. Она не меняет канон, VN line IDs, `CHOICE_00`, основной save key, level data/move budgets или production rig contract.

## VN presentation

- VN shell переведён на стабильную четырёхрядную grid-композицию: top controls → stage → dialogue → VN controls.
- Высота dialogue row больше не зависит от длины конкретной реплики; длинный текст прокручивается внутри самой карточки вместо изменения размера stage.
- Production portraits масштабируются по высоте stage и больше не должны случайно обрезаться сверху/снизу на коротких iPhone viewport.
- 9:16 authored backgrounds показываются полностью через `contain` foreground поверх мягкого `cover` fill; тот же принцип применён к `CHOICE_00`.
- Текущие speaking/blink face overlays и следующий VN portrait/background preloaded заранее для уменьшения flash при смене реплики/эмоции.
- Добавлен regression audit всей последовательности 9 VN scenes, всех A/B/C branches, `CHOICE_00`, VN→Match3→VN переходов и background cut на `VN0048`.

## Match-3 motion

Адаптирован актуальный Raven Manor motion/input pattern без переноса его content/UI/assets:

- tile follows finger во время drag;
- соседняя фишка визуально реагирует до commit threshold;
- drag/swipe/tap-to-tap остаются совместимыми;
- успешный swap физически перемещает обе фишки;
- invalid no-match показывает forward swap → readable reject hold → return;
- clear frame хранит pre-clear board + точные `clearedIndices`, поэтому исчезают только реально очищаемые тайлы;
- settle frame хранит индивидуальные `fall/spawn` motions с расстоянием в строках;
- новые тайлы появляются сверху, существующие падают на вычисленную дистанцию;
- blockers/socket не двигаются вместе с tile: motion применяется к отдельному `.tile-stack`;
- reduced-motion сохраняет читаемость reject/feedback, но убирает декоративные длительные движения;
- Match-3 assets preloaded на level intro до нажатия Start.

## Защищённые контракты

Без изменений остаются:

- Story Bible / 22 Episode Plot / screenplay content;
- stable `VN....` IDs;
- `CHOICE_00` semantics;
- save key `seiran-detectives-anm009-v1`;
- `src/data/narrative.ts`, `src/data/levels.ts`, `src/data/characterRigs.ts`;
- `base-neutral + 512×512 face overlay` production rig;
- GitHub phone pipeline workflows/validator.

`src/engine/Match3Game.ts` изменён только для presentation trace (`clearedIndices`/`motions`); match rules, level objectives and move budgets остаются прежними.

## R2 pipeline fix — headless AssetPreloader

После первого GitHub candidate run обнаружено, что `renderVN()` вызывает image preload во время Vitest smoke tests, а Node test environment не определяет browser global `Image`. R2 делает `AssetPreloader` platform-safe: preload является no-op без `Image`, scheduled preload является no-op без `window`, а browser path остаётся прежним. Добавлен `tests/AssetPreloader.test.ts` с regression coverage для headless и browser-like paths.
