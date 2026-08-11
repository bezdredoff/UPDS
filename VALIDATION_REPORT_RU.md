# ANM-010 — отчёт валидации

**Версия:** `0.10.0-anm010`  
**Дата:** 2026-08-11  
**Результат:** PARTIAL — infrastructure/static checks PASS; полный `npm run check` в этой сессии не подтверждён из-за недоступности npm registry и неполного локального npm cache.

## Что изменено

ANM-010 — инфраструктурная итерация поверх игрового baseline ANM-009. Игровой канон, стабильные VN line IDs, save key, art direction и production rig contract не менялись.

Добавлены:

- `.github/workflows/ci.yml` — read-only `Quality gate` для PR/main;
- `.github/workflows/pages.yml` — stable GitHub Pages из `main` + синхронизация `incoming`;
- `.github/workflows/import-zip.yml` — phone ZIP import → validation → candidate branch → PR → `/preview/`;
- `scripts/validate-upload-zip.py` — ZIP safety contract;
- `tests/GitHubPipeline.test.ts` — regression contract инфраструктуры;
- `docs/GITHUB_PHONE_PIPELINE_RU.md` — точный iPhone workflow;
- `.github/PULL_REQUEST_TEMPLATE.md`, `README.md`, `README_ANM010.md`, `incoming/README.md`.

Версия/видимый build label обновлены до ANM-010. Save key намеренно остаётся `seiran-detectives-anm009-v1`.

## Выполненные проверки в этой сессии

### PASS — workflow YAML parse

Все три workflow-файла успешно разобраны YAML parser:

- `ci.yml`;
- `pages.yml`;
- `import-zip.yml`.

### PASS — ZIP validator happy path

Validator принял полный проектный ZIP с `package.json` в корне и без `node_modules`/`dist`.

### PASS — ZIP traversal rejection

Контрольный ZIP с записью `../escape.txt` был отклонён с ошибкой `unsafe path is forbidden`.

### PASS — защищённые игровые контракты

Byte-for-byte не изменены:

- `src/data/narrative.ts`;
- `src/data/characterRigs.ts`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`.

В `src/engine/CampaignStore.ts` сохранён ключ:

`seiran-detectives-anm009-v1`

### NOT VERIFIED — полный npm gate

Попытка установить зависимости в sandbox не смогла завершиться:

- sandbox не имеет DNS-доступа к `registry.npmjs.org`;
- offline npm cache неполный;
- конкретно отсутствовал tarball `why-is-node-running-2.3.0.tgz`.

Поэтому `npm run check` не помечается PASS в этом отчёте. Это ограничение среды, а не обнаруженный failure тестов/сборки.

На GitHub первый push должен выполнить реальный clean check через GitHub-hosted runner.

## Что обязательно проверить после bootstrap GitHub

1. `UPDS CI / Quality gate` проходит на `main`.
2. `Deploy stable UPDS to GitHub Pages` публикует корень сайта.
3. Создана ветка `incoming` от `main`.
4. С iPhone загрузить один ZIP в `incoming/incoming/`.
5. `Import mobile ZIP candidate`:
   - валидирует ZIP;
   - создаёт `candidate/*`;
   - создаёт PR;
   - публикует candidate на `/preview/`;
   - оставляет `main` в корне Pages;
   - пишет preview URL в PR;
   - force-reset'ит `incoming` на `main`.
6. В PR нажать `Approve workflows to run`, затем дождаться зелёного `Quality gate`.
7. После merge проверить, что корень Pages обновился на новый `main`, а `incoming` синхронизирован.

## Известные ограничения ANM-010

- GitHub Pages имеет один активный deployment на репозиторий, поэтому используется один candidate slot `/preview/`, а не независимый preview для каждого PR.
- Browser-upload contract ограничен ZIP до 25 MiB.
- Mobile ZIP import намеренно запрещает изменение `.github/workflows` и `scripts/validate-upload-zip.py`; инфраструктурные изменения делаются отдельным ручным PR.
- Auto-merge отсутствует намеренно.
- Игровые ограничения ANM-009 (четыре portrait placeholder, отсутствие audio/haptics, статичная Pose B, непроверенный человеческими плейтестами баланс) остаются без изменений.
