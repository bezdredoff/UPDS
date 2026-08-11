# ANM-017 · Playtest & Distribution Foundation

## Цель

Сделать vertical slice удобным для дальнейшей раздачи и измеряемых плейтестов до production-art и balance pass.

## 1. Локальная telemetry

Telemetry хранится отдельно от campaign save:

- key: `seiran-detectives-playtest-v1`;
- schema: `1`;
- cap: 2500 последних событий;
- данные пишутся best-effort и не блокируют gameplay при проблемах storage.

События не содержат текста реплик, email, имени игрока или другой пользовательской анкеты. Для VN сохраняются только технические line IDs / scene indices / режимы отображения.

### События

- session_start / session_end;
- screen_view;
- vn_line / vn_paging / vn_skip / vn_auto / vn_log_open;
- choice_selected;
- match_start / match_move / match_hint / match_end;
- vertical_slice_complete;
- pwa_registered / pwa_offline_ready / pwa_update_available / pwa_update_applied / pwa_installed / connectivity_changed.

### Match-3 balance payload

На попытке фиксируются:

- levelId / attempt;
- move budget;
- duration;
- valid/invalid moves;
- moves left / moves used;
- hints;
- reshuffles;
- specials created;
- max cascade;
- win / loss / abandon;
- final objective progress.

### Export

Diagnostics → `Экспорт playtest report`.

JSON содержит:

- metadata/build;
- summary;
- raw events.

Summary рассчитывает sessions/completions/choices/VN counters и per-level:

- starts;
- wins/losses/abandons;
- win rate;
- median duration;
- median moves used;
- median moves left on win;
- hints;
- valid/invalid moves;
- reshuffles;
- specials;
- max cascade.

`Очистить playtest data` удаляет только telemetry и начинает новую локальную test-session. Campaign save остаётся неизменным.

## 2. Installable PWA

Добавлены:

- `public/manifest.webmanifest`;
- 180 / 192 / 512 app icons на базе существующего approved Miku medallion;
- `public/sw.js`;
- registration/update controller;
- offline/install/update status в Settings и Diagnostics.

Manifest использует относительные `start_url: ./` и `scope: ./`, поэтому один и тот же build корректно работает как в stable root, так и в `/preview/`.

## 3. Offline warm cache

После регистрации service worker приложение передаёт worker список:

- текущий app shell;
- manifest/icons;
- все runtime assets из `runtimeAssetCatalog`;
- фактически загруженные build resources из Performance API (hashed JS/CSS).

Worker сообщает `CACHE_READY` только после завершения warmup. `Offline ready` становится true только если все запрошенные ресурсы были успешно закэшированы.

## 4. Stable / preview isolation

Это критический контракт текущего GitHub Pages pipeline.

### Stable

- scope: repository root;
- cache prefix: `upds-stable-*`;
- stable worker НЕ вызывает `respondWith` для `/preview/*`.

### Candidate preview

- scope: `/preview/`;
- cache prefix: `upds-preview-*`;
- при наличии сети preview использует network-first даже для assets;
- cache используется как offline fallback.

Таким образом candidate QA не должен получать stale stable responses.

## 5. Update flow

При установленном новом worker:

- появляется компактный banner `Доступно обновление игры`;
- `Позже` не меняет текущую сессию;
- `Обновить` отправляет `SKIP_WAITING`;
- reload происходит только после `controllerchange`;
- если активен Match-3, перед обновлением требуется confirmation.

Никакого автоматического reload посреди VN/Match-3 нет.

## 6. Не меняется

- story canon;
- stable VN IDs;
- `CHOICE_00` semantics;
- campaign save key/schema;
- Match-3 rules/balance;
- character rig contract;
- production assets under `public/assets/**`;
- GitHub workflow/validator files.


## Maintenance note

Repository organization and test/documentation policy are defined by ANM-018; see `docs/README.md` and `docs/process/AI_DEVELOPMENT_RU.md`.
