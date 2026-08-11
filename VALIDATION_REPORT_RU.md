# ANM-012 — Validation Report

Дата: 11 августа 2026
Версия: `0.12.0-anm012`
Feature: Mobile UX Foundation

## Scope

- mobile viewport/safe-area hardening;
- compact layout для `320×568` и низких экранов;
- Pointer Events swipe input для Match-3 с сохранением tap input;
- board scroll containment;
- transaction input lock и защита от pointerup/click double activation;
- landscape recovery;
- mobile regression tests и QA matrix.

## Выполнено в этой сессии

### PASS — TypeScript strict

```bash
tsc -p tsconfig.json
```

Exit code: `0`.

### PASS — protected contracts byte-for-byte

Не изменены относительно post-ANM-010A / ANM-011 baseline:

- `src/data/narrative.ts`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`;
- `src/data/levels.ts`;
- `src/engine/Match3Game.ts`;
- `src/data/characterRigs.ts`;
- `.github/workflows/ci.yml`;
- `.github/workflows/pages.yml`;
- `.github/workflows/import-zip.yml`;
- `scripts/validate-upload-zip.py`.

Save key остаётся `seiran-detectives-anm009-v1`.

### PASS — static mobile contract

Проверено:

- старого `min-height: 640px` больше нет;
- `.board` содержит `touch-action: none`;
- page root содержит `overscroll-behavior: none`;
- compact media profile существует;
- landscape recovery media profile существует;
- non-board navigation contract использует 44 px minimum target.

### NOT VERIFIED LOCAL — полный `npm run check`

Локальный sandbox не имеет полного npm cache и сетевого доступа к registry. `npm ci --ignore-scripts --offline` завершился `ENOTCACHED` на `why-is-node-running@2.3.0`.

Поэтому Vitest/Vite production build не объявляются PASS локально. Они должны быть первой обязательной проверкой read-only job `Import mobile ZIP candidate` в GitHub Actions.

После добавления ANM-012 test suite ожидает 9 test-файлов и 39 фактических test cases с учётом `it.each` parameterization.

## Ручной QA после `/preview/`

Обязателен реальный Safari/iPhone pass по `docs/ANM012_MOBILE_UX_RU.md`, особенно:

- `320×568`/маленький viewport;
- отсутствие document scroll;
- tap swap;
- swipe swap во всех направлениях;
- отсутствие page scroll во время swipe;
- edge swipe;
- invalid swap + следующий input;
- dossier return;
- portrait → landscape → portrait recovery.

## Известные ограничения

- ANM-012 не добавляет покадровую cascade/swap animation; это отдельный Match-3 polish этап.
- Board cells физически меньше 44 px на узком 8×8 поле; 44 px minimum применяется к non-board controls. Увеличение board cells потребовало бы zoom/scroll или иной board layout и не входит в scope.
- Portrait остаётся целевым режимом; landscape — recovery/return mode.
- Полный browser DOM/mobile automation пока не добавлен; финальный acceptance — реальный GitHub Pages preview на iPhone.
