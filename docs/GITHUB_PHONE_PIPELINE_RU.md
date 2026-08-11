# ANM-010 — GitHub / iPhone pipeline

## Цель

После одноразовой настройки репозитория обычная кодовая итерация не требует компьютера:

`ChatGPT ZIP → GitHub incoming → read-only validation → candidate branch + PR → GitHub Pages /preview/ → ручная проверка на iPhone → approve CI → merge → stable Pages`.

StackBlitz не используется.

## Почему Pages устроен как stable + preview

У одного репозитория GitHub Pages один активный Pages deployment. Поэтому ANM-010 использует два пути внутри одного сайта:

- `/` — production build текущего `main`;
- `/preview/` — последний успешно провалидированный ZIP-кандидат.

После merge workflow `pages.yml` снова публикует чистый `main`; старый `/preview/` исчезает как уже ненужный.

## Одноразовая настройка GitHub

1. Создать репозиторий UPDS и положить ANM-010 в `main`.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Actions → General → Workflow permissions:
   - оставить минимальные default permissions;
   - включить **Allow GitHub Actions to create and approve pull requests**. Workflow создаёт PR, но сам его не approve/merge.
4. Создать ветку `incoming` как копию `main`. Ветка не должна быть protected: workflow после каждого успешного импорта и каждого deploy `main` force-sync'ит её обратно на `main`, удаляя ZIP из достижимой истории.
5. Settings → Environments → `github-pages` → Deployment branches and tags → **Selected branches and tags**. Разрешить только:
   - `main`;
   - `incoming`.
   Не добавлять `candidate/*`: candidate не должен самостоятельно деплоить Pages. Preview публикуется из `incoming` workflow как `/preview/`.
6. Защитить `main` ruleset/branch protection:
   - Require a pull request before merging;
   - Require status checks to pass;
   - required check: **Quality gate**;
   - block force pushes;
   - block deletions.
7. После первого запуска `pages.yml` сохранить две ссылки в Safari:
   - stable: `https://<owner>.github.io/<repo>/`;
   - preview: `https://<owner>.github.io/<repo>/preview/`.
8. По желанию сохранить прямую страницу GitHub Upload для `incoming/incoming/` как bookmark на Home Screen.

## Каждая следующая итерация с iPhone

1. Получить от ChatGPT полный ZIP проекта без `node_modules` и `dist`.
2. Открыть ветку `incoming`, каталог `incoming/` → Add file → Upload files.
3. Выбрать **ровно один** ZIP и commit в `incoming`.
4. `Import mobile ZIP candidate` автоматически:
   - проверяет безопасную структуру ZIP;
   - запрещает `.git`, `node_modules`, `dist`, symlinks и path traversal;
   - запрещает ZIP-кандидату менять `.github/workflows` или сам ZIP-validator; такие инфраструктурные изменения делаются отдельным ручным PR;
   - запускает `npm ci --ignore-scripts` и `npm run check` в read-only job;
   - отдельно проверяет/собирает текущий `main`;
   - создаёт `candidate/*` branch;
   - создаёт PR в `main`;
   - публикует `main` на `/` и candidate на `/preview/`;
   - пишет preview link в PR;
   - force-reset ветки `incoming` на текущий `main`, чтобы ZIP не накапливались в её достижимой истории и inbox всегда сохранял рабочие workflows.
5. Открыть `/preview/` на iPhone и пройти критический путь задачи.
6. Открыть PR. PR, созданный `GITHUB_TOKEN`, запускает независимый `pull_request` CI в approval-required состоянии; нажать **Approve workflows to run**.
7. Дождаться зелёного **Quality gate**.
8. Проверить Files changed и merge вручную.
9. Push в `main` автоматически запускает `pages.yml`; `/` становится новой стабильной версией.

## Rerun и ручной fallback

`Import mobile ZIP candidate` имеет `workflow_dispatch`. Его можно запустить из Actions для ZIP, который уже лежит в выбранной ветке/commit, передав `archive_path` и необязательный `candidate_label`.

ANM-010A делает повторный запуск одного и того же import-run идемпотентным:

- имя candidate-ветки остаётся детерминированным и содержит `GITHUB_RUN_ID`;
- если ветка уже существует и её tree совпадает с повторно провалидированным candidate, workflow переиспользует её;
- если ветка с тем же именем содержит другое дерево, workflow останавливается и не перезаписывает её;
- если открытый PR для candidate уже существует, workflow переиспользует его;
- closed/merged PR с тем же head не создаётся повторно автоматически.

`pages.yml` можно запускать вручную как recovery только на `main`. Если `workflow_dispatch` случайно запустить на `candidate/*` или другой ветке, все stable Pages jobs будут пропущены main-only guard'ом.

## Ограничения ANM-010

- Browser upload GitHub рассчитан на файлы до 25 MiB; validator использует тот же предел для ZIP.
- Одновременно существует один публичный Pages preview slot `/preview/`; новая кандидатура заменяет предыдущую.
- Этот pipeline не делает auto-merge и не должен делать его в следующих итерациях без отдельного решения владельца проекта.
- Первый bootstrap репозитория — одноразовая операция; после него обычный цикл рассчитан на телефон.
