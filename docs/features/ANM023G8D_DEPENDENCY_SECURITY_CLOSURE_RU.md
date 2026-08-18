# ANM-023G8D — Dependency Security Closure

Status: R1 candidate.
Base: `main` at `7d48d86f4d445355e7d20f3d8eccc7a23f242e14` after merged ANM-023G8C1 / PR #166.

## Цель

Закрыть security debt, обнаруженный в Browser Gate: `npm ci` на текущем root lockfile сообщает **5 vulnerable packages** — 2 moderate, 2 high и 1 critical — и при этом обычный `npm run check` не делает audit blocking gate.

G8D обновляет только build/test tooling и его lockfile. **Production runtime не меняется**: gameplay, VN, Match-3 logic, saves, assets, QA routes и Browser Gate workflow остаются прежними.

## Обновление toolchain

- Vite `5.4.10 → 6.4.3`.
  - G8D не останавливается на позднем 5.x: актуальный Vite advisory `GHSA-fx2h-pf6j-xcff` затрагивает 6.x до 6.4.2 включительно; 6.4.3 является исправленной точкой в 6.x-линейке.
  - Vite 6.4.3 переводит собственную esbuild dependency на `^0.25.0`, поэтому старый locked `esbuild 0.21.5` уходит из root toolchain.
- Vitest `3.2.4 → 3.2.7`.
  - `GHSA-5xrq-8626-4rwp` исправлен начиная с 3.2.6.
  - `GHSA-p63j-vcc4-9vmv` исправлен в 3.2.7, поэтому конечная pinned версия — 3.2.7, без ненужного перехода на новый major Vitest.
- Biome `2.5.7` и TypeScript `5.5.4` не меняются: G8D не является общим dependency-refresh.

## Audit-clean lock

Новый `package-lock.json` генерируется настоящим npm registry resolution в Node 24 / npm 11 GitHub CI environment, а не ручным редактированием lockfile.

Preflight обязан подтвердить одновременно:

- Vite resolved ровно в `6.4.3`;
- Vitest resolved ровно в `3.2.7`;
- root esbuild resolved в `0.25.12` вместо `0.21.5`;
- `npm audit --json` для сгенерированного lockfile возвращает **0 vulnerabilities**.

## Постоянный security gate

Чтобы новый advisory high/critical severity больше не оставался только предупреждением из `npm ci`, package scripts получают:

- `security:audit = npm audit --audit-level=high`;
- `precheck = npm run security:audit`.

Npm выполняет `pre<name>` перед пользовательским `npm run <name>`, поэтому существующие importer и PR quality gates, которые уже вызывают `npm run check`, автоматически получают security gate.

Сам `check` намеренно остаётся прежним:

`npm run lint && npm run test && npm run build`

Это сохраняет durable tooling/Playwright contracts и не смешивает browser execution с fast quality lane.

## Regression gate

Vite меняется между major versions, поэтому приемка G8D требует не только unit/build gate:

1. importer read-only validation с новым `precheck` audit;
2. independent `UPDS CI` на candidate PR;
3. полный Browser Gate Chromium;
4. Mobile WebKit critical lane;
5. candidate Pages preview sanity check.

Изменять Golden Samples не ожидается: production DOM/CSS/assets G8D не трогает. Любое визуальное отличие считается регрессией, а не baseline update.

## Не входит

- runtime/gameplay changes;
- Match-3 Campaign progression;
- VN/story changes;
- save migrations;
- Browser Gate workflow changes;
- Playwright version/image update;
- массовое обновление остальных dependencies.

После security closure следующий функциональный audited slice — **ANM-023G8C2: Campaign Completion & Progression Flow**.
