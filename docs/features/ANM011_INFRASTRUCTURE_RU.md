# ANM-011 — инфраструктурный контракт

## Цель

Сделать vertical slice устойчивым к ограничениям мобильного браузера и пригодным для внешнего плейтеста без backend: безопасные сохранения, перенос прогресса, диагностический JSON, runtime error log и graceful asset fallback.

## 1. SafeStorage

`src/platform/SafeStorage.ts` сначала пробует реальный `localStorage` через write/remove probe. Если браузер запрещает storage, runtime переключается на общий in-memory fallback. Игра остаётся работоспособной, но прогресс живёт только в текущей вкладке/сессии.

Сервисный экран показывает `persistent` или `memory fallback`.

## 2. Save schema и совместимость preview ↔ stable

Save key не меняется:

`seiran-detectives-anm009-v1`

ANM-011 добавляет к сохранению только дополнительные top-level metadata:

- `schemaVersion: 1`;
- `savedAt`;
- `appVersion`.

Игровые поля остаются на том же уровне JSON. Поэтому ANM-010 продолжает читать save, игнорируя новые metadata.

Это обязательное решение для ANM-010 GitHub Pages topology: стабильный `/` и candidate `/preview/` находятся на одном origin и используют один `localStorage`.

## 3. Corrupt save recovery

Если stored JSON невозможно разобрать или корень save имеет неверный тип:

1. исходная строка сохраняется под recovery key;
2. runtime возвращает fresh playable save;
3. для обычной corruption fresh save записывается обратно, чтобы не повторять ошибку на каждом старте;
4. recovery backup доступен из сервисного экрана и включается в diagnostics export.

Future schema обрабатывается консервативно: исходник сохраняется в recovery, но намеренно не перезаписывается автоматически старой схемой.

## 4. Save export/import

Экспорт создаёт JSON:

- format `upds-campaign-save`;
- exportVersion;
- текущий save key;
- schemaVersion;
- appVersion;
- timestamp;
- normalized gameplay state.

Импорт:

- требует явного выбора JSON-файла;
- просит подтверждение перед заменой прогресса;
- принимает ANM-011 envelope и legacy flat UPDS save;
- отвергает чужой save key;
- отвергает future schema;
- сохраняет предыдущий current save как recovery backup перед успешной заменой.

## 5. Runtime diagnostics

`ErrorLog` хранит максимум 50 последних записей и никогда не должен ломать игру при недоступном storage.

Автоматически фиксируются:

- `window.error`;
- `unhandledrejection`;
- application errors, которые явно записывает runtime;
- runtime image failures.

Diagnostics JSON включает:

- APP_VERSION / build label / build ID / build timestamp;
- save key/schema/storage mode/load report/current state/recovery;
- error log;
- preload и asset failure state;
- pathname/URL/user agent/language/online/viewport/DPR/reduced-motion.

Cookies, IP, account data и другие внешние персональные данные не собираются.

## 6. Build identity

Vite injects:

- `BUILD_ID`: первые 12 символов `GITHUB_SHA`, если build идёт в Actions; иначе `VITE_BUILD_ID` или `local`;
- `BUILD_TIMESTAMP`: timestamp конкретной production build.

Для candidate preview `GITHUB_SHA` соответствует upload/incoming run, который произвёл validated Pages artifact. Это позволяет связать присланный diagnostics JSON с конкретным pipeline run.

## 7. Asset preload и fallback

Runtime catalog строится из фактических UPDS data contracts: backgrounds, finished character rigs, match-3 assets, clues и используемые UI icons.

После первого render preload запускается в idle time и не блокирует старт игры.

При runtime image error:

- face overlay скрывается, оставляя корректный base-neutral;
- другие изображения получают встроенный neutral fallback SVG;
- failure записывается в asset health и error log.

## 8. GitHub pipeline acceptance для ANM-011

ANM-011 ZIP не изменяет `.github/workflows/*` или `scripts/validate-upload-zip.py`, поэтому должен проходить self-modification protection ANM-010.

Ожидаемый первый реальный mobile cycle:

1. ANM-010 уже находится в `main`, Pages и `incoming` настроены.
2. Загрузить `ANM-011_Infrastructure_Hardening_FULL_PROJECT.zip` в `incoming/incoming/` с iPhone.
3. Дождаться read-only validation + `npm run check`.
4. Открыть автоматически созданный PR.
5. Открыть Pages `/preview/` на iPhone.
6. Выполнить актуальный manual regression из `docs/process/TESTING_RU.md`; исторический README_ANM011 хранится только в архиве.
7. Нажать `Approve workflows to run` для независимого PR CI.
8. Merge только после green Quality gate и ручной проверки preview.
