# ANM-023G8E1 — PWA Update Reliability

Status: R1 candidate.  
Base: `main` at `0f42a8e52c2d483ec65dec97dcf211f50fa82284` after merged ANM-023G8D / PR #168.

## Причина

Ручная проверка preview/stable на iPhone выявила повторяемый дефект:

- при первом открытии иногда появляется banner «Доступно обновление игры»;
- нажатие «Обновить» визуально ничего не делает;
- ручной reload после этого загружает актуальную версию, и banner исчезает.

Старый runtime считал `ServiceWorkerRegistration.waiting` достаточным сигналом новой версии и выставлял отдельный sticky `updateAvailable`. При этом `applyUpdate()` умел действовать только если `waiting` worker всё ещё существовал. Это создавало race: UI мог обещать update, а кнопка уже не имела действия.

## Новый source of truth

Каждый Vite production build теперь эмитит в собственный `dist`:

`build.json`

с теми же `buildId` и `buildTimestamp`, которые зашиты в application JS.

Поскольку stable и candidate preview собираются отдельно и публикуются как `/` и `/preview/`, относительный `./build.json` автоматически остаётся lane-local. Workflow менять не требуется.

Runtime выполняет cache-busted `no-store` fetch этого файла и показывает update banner только если:

`published buildId !== running BUILD_ID`.

Состояние `registration.waiting` больше не является пользовательским доказательством того, что running application устарел.

## Service worker

`build.json` является network-only identity endpoint:

- worker не добавляет его в offline warm cache;
- fetch handler отдаёт его напрямую из сети с `cache: no-store`;
- runtime дополнительно использует уникальный query parameter для совместимости с предыдущим уже активным worker, который ещё не знает нового правила.

Если identity fetch недоступен/offline, runtime не производит ложный update banner.

## Кнопка «Обновить»

Если published build отличается:

1. если есть waiting worker — отправляется `SKIP_WAITING`;
2. `controllerchange` вызывает reload;
3. дополнительно существует короткий fallback reload, если controller change не пришёл;
4. если waiting worker уже исчез — reload происходит сразу.

Таким образом кнопка больше не может быть silent no-op.

## «Позже»

Dismiss хранится только в памяти текущей сессии и привязан к конкретному `publishedBuild`.

Повторные PWA/cache events не возвращают banner для той же версии. Если позднее published build изменится ещё раз, новая версия снова будет показана.

## Границы

G8E1 не меняет:

- VN rendering/paging;
- Match-3 rendering;
- gameplay/save data;
- Pages workflow;
- preview badge/layout;
- assets.

Следующие отдельные slices:

- G8E2 — iOS VN Viewport Stability;
- G8E3 — Match-3 Render Stability;
- затем G8C2 — Campaign Completion & Progression Flow.

## Acceptance

- `npm run check`;
- existing Browser Gate Chromium;
- Mobile WebKit critical lane;
- preview manual QA:
  - первый open актуального candidate не показывает ложный update;
  - после следующего deployment старый открытый build получает banner;
  - `Обновить` гарантированно приводит к актуальному build;
  - manual reload после обновления не возвращает старый banner.
