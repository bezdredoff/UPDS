# ANM-023G3 — Boot / Build / Pages Preview Smoke

Статус поставки: **R1 candidate**.

## Цель

Проверять, что реальный production build UPDS загружается как в корне сайта, так и в мобильном candidate path `/preview/`, не ломает критичные asset URLs и позволяет открыть основные QA entry points.

## Почему обычного `vite preview` недостаточно

Production Vite config использует `base: './'`. Это правильно для GitHub Pages, потому что один и тот же `dist` может быть размещён под разными path prefixes.

Но обычный локальный `vite preview` физически держит assets только в корне. Если открыть `/preview/`, HTML может отрендериться через SPA fallback, а относительные `./assets/...` начнут запрашиваться как `/preview/assets/...` и получат ложный 404.

G3 поэтому добавляет маленький test-only static server `e2e/serve-production.mjs`. Он не меняет игру и не попадает в production bundle. Один и тот же построенный `dist/` он монтирует в:

- `/`;
- `/preview/`.

Это воспроизводит важную часть текущей GitHub Pages topology: stable root + candidate preview subdirectory.

## Base URL contract

Все Playwright navigation helpers переходят с абсолютного `/` на baseURL-relative `./`.

Это позволяет одному suite работать:

- локально на `http://127.0.0.1:4173/`;
- позже против реального GitHub Pages repository root;
- против любого эквивалентного hosted project subpath.

`UPDS_E2E_BASE_URL` позволяет отключить локальный server и прогнать smoke против уже опубликованного сайта.

## Что проверяет Pages smoke

Для обеих lanes — stable root и `/preview/`:

1. document отвечает успешно;
2. `#app` и Main Menu видимы;
3. QA Scene Navigation открывается;
4. возврат в Main Menu работает;
5. Match-3 Campaign открывается;
6. возврат в Main Menu работает;
7. Level Lab открывается;
8. текущий URL остаётся внутри ожидаемого deployment path;
9. нет uncaught `pageerror`;
10. нет `console.error`;
11. нет failed requests или HTTP 4xx/5xx для document/script/stylesheet/image/font.

G3 намеренно не проверяет VN content, swaps, specials или progression — это G4–G6.

## External hosted run

После установки Playwright:

```bash
UPDS_E2E_BASE_URL=https://host.example/project/ npm --prefix e2e run test:pages
```

URL должен указывать на project root, внутри которого candidate preview доступен как `./preview/`.

## CI boundary

Root `npm run check` по-прежнему не устанавливает и не запускает браузеры. Новый `BrowserPagesSmokeContract.test.ts` только статически защищает topology/health contract.

Исполняемый Chromium suite остаётся отдельным до ANM-023G7, где Browser Gate будет добавлен параллельно существующему Quality Gate.
