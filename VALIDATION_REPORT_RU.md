# ANM-011 — отчёт валидации

**Версия:** `0.11.0-anm011`  
**Дата:** 2026-08-11  
**Scope:** Infrastructure Hardening поверх ANM-010.  
**Результат локальной сессии:** PARTIAL PASS — TypeScript strict и узкие executable/static проверки PASS; полный `npm run check` должен быть подтверждён GitHub Actions, потому что sandbox не может установить npm dependencies из registry.

## Что реализовано

ANM-011 добавляет production-oriented runtime foundation без изменения игрового канона и механики:

- `src/platform/SafeStorage.ts` — probe реального `localStorage` и memory fallback;
- `src/platform/ErrorLog.ts` — persistent capped runtime error log + global error handlers;
- `src/platform/Download.ts` — browser JSON download helper;
- `src/platform/AssetHealth.ts` — asset failure monitoring + graceful image fallback;
- `src/platform/AssetPreloader.ts` — idle preload без блокирования первого render;
- `src/platform/RuntimeAssets.ts` — data-driven runtime asset catalog;
- `src/platform/Diagnostics.ts` — diagnostics JSON snapshot;
- `src/platform/RuntimeServices.ts` — единая сборка storage/store/error/assets services;
- `CampaignStore` получил schema metadata, corrupt-save recovery, recovery backup и export/import;
- главное меню получило QA-экран `Сохранения и диагностика`;
- Vite build injects build ID и build timestamp;
- добавлены regression tests и документация ANM-011.

## Save compatibility contract

Save key намеренно не изменён:

`seiran-detectives-anm009-v1`

Stored save остаётся плоским объектом с прежними gameplay fields. ANM-011 добавляет только top-level metadata:

- `schemaVersion: 1`;
- `savedAt`;
- `appVersion`.

Такой save остаётся читаемым normalize-контрактом ANM-010. Это необходимо, потому что stable `/` и candidate `/preview/` GitHub Pages используют один origin/localStorage.

Внешний export имеет отдельный envelope `upds-campaign-save`; import принимает его и legacy flat UPDS saves, но отвергает foreign save key и schema новее поддерживаемой.

## Выполненные проверки в этой сессии

### PASS — TypeScript strict

Выполнено:

```bash
tsc -p tsconfig.json
```

Результат: exit code 0.

Примечание: используется установленный в sandbox TypeScript; project `npm run build` всё равно обязан повторно выполнить pinned TypeScript `5.5.4` в GitHub Actions.

### PASS — executable platform logic smoke

Отдельно скомпилированы и реально выполнены новые platform/save модули. Проверено:

- fallback на memory storage при blocked persistent storage;
- schema metadata сохраняется flat и не заворачивает gameplay state;
- save export/import round-trip;
- corrupt JSON создаёт recovery backup и возвращает playable fresh save;
- error log ограничен 50 последними entries.

Результат:

`ANM-011 platform logic smoke: PASS`

### PASS — protected gameplay/canon contracts unchanged

Byte-for-byte совпадают с ANM-010:

- `src/data/narrative.ts`;
- `src/data/characterRigs.ts`;
- `src/data/levels.ts`;
- `src/engine/Match3Game.ts`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`.

Следовательно ANM-011 не меняет authored narrative, stable VN IDs, four-level gameplay data, move budgets, match-3 rules или character rig definitions.

### PASS — ANM-010 pipeline self-modification boundary unchanged

Byte-for-byte совпадают с ANM-010:

- `.github/workflows/ci.yml`;
- `.github/workflows/pages.yml`;
- `.github/workflows/import-zip.yml`;
- `scripts/validate-upload-zip.py`.

Это означает, что ANM-011 candidate ZIP должен пройти установленную ANM-010 проверку `Reject pipeline self-modification from mobile ZIP`.

### PASS — static runtime assets + workflow YAML

Проверены literal runtime asset paths, полный ожидаемый набор трёх layered character rigs и парсинг всех `.github/workflows/*.yml`.

Результат:

`STATIC_ASSET_AND_YAML_CHECK: PASS`

В `public/assets` остаётся 69 runtime-файлов.

### STATIC — test-suite size

После ANM-011 suite содержит 8 test-файлов и ожидаемо 34 test cases:

- baseline ANM-009: 22;
- ANM-010 pipeline contract: +4;
- ANM-011 platform tests: +6;
- ANM-011 runtime asset catalog test: +1;
- ANM-011 support UI smoke: +1.

Полный Vitest run локально не заявляется PASS без фактического запуска.

## NOT VERIFIED LOCALLY — `npm run check`

Sandbox не имеет DNS-доступа к `registry.npmjs.org`; `npm ci` не может надёжно установить pinned project dependencies. Поэтому `vitest run` и `vite build` в этой сессии не помечаются PASS.

Это намеренно становится первым реальным acceptance gate нового GitHub/phone pipeline:

1. ANM-010 должен уже находиться в `main`.
2. ANM-011 ZIP загружается с телефона в `incoming/incoming/`.
3. read-only importer выполняет `npm ci --ignore-scripts` и `npm run check`.
4. только после PASS создаются candidate branch/PR и GitHub Pages `/preview/`.
5. независимый PR `Quality gate` должен быть отдельно approved и снова пройти.

## Ручной QA для Pages `/preview/`

### Critical infrastructure path

1. До открытия preview создать или иметь существующий ANM-010 progress.
2. Открыть ANM-011 `/preview/` → `Продолжить`; позиция должна сохраниться.
3. Продвинуться минимум на одну VN line и вернуться на stable `/`; ANM-010 должен продолжить читать тот же save.
4. `Сохранения и диагностика` → проверить `STORAGE`, `BUILD`, `SAVE SCHEMA`, `RUNTIME`.
5. `Экспорт сохранения` → убедиться, что iPhone создаёт JSON в Files/Downloads.
6. Изменить progress → `Импорт сохранения` → подтвердить замену → Continue должен вернуться к экспортированной позиции.
7. `Экспорт диагностики` → проверить наличие build/save/errors/assets/device sections.
8. Если recovery backup присутствует, проверить отдельный `Экспорт recovery backup`.

### Asset/error resilience

1. Обычная игра не должна показывать broken-image icon.
2. Face overlay failure должен скрыть overlay и оставить base-neutral.
3. Non-face image failure должен показать встроенный neutral fallback.
4. Ошибка должна появиться в diagnostics/error count.

### Regression path

1. Новая игра → scene 0.
2. Choice A/B/C → `Начать поиск`.
3. M3_00–M3_03 по-прежнему доступны без изменения data contract.
4. Dossier/retry/Continue остаются рабочими.
5. Production rigs Мику/Оноэ/Аюки и четыре утверждённых portrait placeholders остаются прежними.

## Известные ограничения ANM-011

- full Vitest/Vite gate должен подтвердить GitHub-hosted runner;
- diagnostics и error log локальны браузеру, remote backend telemetry ещё отсутствует;
- memory fallback сохраняет progress только на время жизни вкладки/страницы;
- asset preloader улучшает последующие переходы, но не является offline/PWA cache — это отдельный будущий этап;
- save import intentionally replaces current progress только после browser confirmation;
- future schema не переписывается автоматически старым runtime;
- игровые ограничения ANM-009 (portrait placeholders, отсутствие audio/haptics, статичная Pose B, human balance playtests) остаются вне scope ANM-011.
