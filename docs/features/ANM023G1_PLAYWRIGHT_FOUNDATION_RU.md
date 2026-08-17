# ANM-023G1 — Playwright Foundation

Статус поставки: **R1 candidate**.

## Цель

Создать минимальный browser/E2E foundation для UPDS до начала массового покрытия QA Scene Navigation, Match-3 Campaign и Level Lab.

## Что входит в G1

- отдельный `e2e/` npm-пакет с точно зафиксированной прямой зависимостью `@playwright/test`;
- Playwright config для production `vite build` + `vite preview`;
- отдельный `*.pw.ts` test pattern, чтобы root Vitest не собирал browser tests;
- один Chromium project;
- trace и screenshot только для диагностики падений;
- минимальный boot smoke: production bundle открывается, `#app`, реальное главное меню и кнопка New Game видимы, uncaught `pageerror` отсутствуют;
- корневые команды установки/запуска, но browser suite **не включён** в текущий `npm run check`;
- статический Vitest contract, чтобы существующий GitHub quality gate защищал структуру foundation ещё до появления Browser Gate.

## Архитектурные границы

G1 не добавляет QA-only renderer, отдельную Match-3 реализацию, gameplay hooks, `data-testid`, reset API или browser-only game logic. Эти seams вводятся только в G2 и только там, где они нужны существующим production QA surfaces.

Корневой Quality Gate остаётся прежним: `lint → Vitest → build`. Playwright пока запускается отдельной явной командой. Параллельный GitHub Actions Browser Gate остаётся задачей G7.

## Локальный запуск

Из корня репозитория:

```bash
npm run e2e:install
npm run e2e:install:chromium
npm run test:e2e
```

Playwright сам вызывает production build и поднимает `vite preview` на `127.0.0.1:4173`.

## Не входит

- WebKit/mobile profile;
- `/preview/` base-path smoke;
- QA Scene Navigation selectors и VN coverage;
- Match-3 Campaign / Level Lab mechanics coverage;
- persistence/localization/main-flow journeys;
- visual snapshots;
- blocking Browser Gate в GitHub CI.

Они остаются в ANM-023G2–G7 согласно roadmap.

## Проверка R1

Текущий mobile ZIP pipeline должен по-прежнему пройти обычный `npm run check`. Это проверяет статический `PlaywrightFoundation.test.ts`, но намеренно ещё не скачивает браузеры и не запускает Playwright в CI. Исполняемый browser smoke становится частью автоматического GitHub gate на последующих шагах трека.
