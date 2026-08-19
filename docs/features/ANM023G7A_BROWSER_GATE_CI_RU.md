# ANM-023G7A — Browser Gate CI

Статус поставки: **candidate**.

## Цель

Впервые реально запускать накопленный Playwright suite G1–G6 в GitHub Actions, не смешивая browser execution с существующим быстрым `UPDS CI`.

## Почему отдельный workflow

`npm run check` остаётся неизменным:

`lint → Vitest → production build`.

Это важно для мобильного ZIP pipeline: read-only validation candidate и stable main не должны скачивать браузеры и превращаться в тяжёлый browser job.

Browser execution вынесен в `.github/workflows/browser-gate.yml` и запускается параллельно как независимый merge gate.

## Chromium lane

`Chromium full E2E` запускает весь `*.pw.ts` suite:

- boot smoke;
- stable/preview topology smoke;
- QA harness ownership;
- VN QA navigation;
- deterministic Match-3 Campaign/Level Lab;
- persistence/localization/main-flow journeys.

Это основной функциональный browser gate.

Первый живой Chromium run уже выполнил роль аудита накопленных G1–G6 specs: он обнаружил не production bugs, а слишком жёсткие ожидания G5 по deterministic seed/refill. Browser contract был исправлен до наблюдаемого поведения — moves, objective progression, special lifecycle и полностью settled board — без изменений `src/`.

## Mobile WebKit lane

`Mobile WebKit critical E2E` использует Playwright device profile `iPhone 13` и запускает критический subset:

- `boot.pw.ts`;
- `vn-navigation.pw.ts`;
- `match3.pw.ts`;
- `persistence-localization-flow.pw.ts`.

Pages topology smoke не дублируется в WebKit lane: это инфраструктурная проверка base-path/static topology, а не mobile-engine-specific поведение.

### Локальные PWA probe diagnostics

Playwright WebKit на локальном `http://127.0.0.1:4173` иногда поднимает `pageerror` вида:

- `127.0.0.1:4173/sw.js?... due to access control checks`;
- `127.0.0.1:4173/build.json?... due to access control checks`.

Первый относится к service-worker registration, второй — к network-only published-build probe, добавленному позднее в G8E1. Оба production-path уже обрабатывают network/registration failure внутри `try/catch`; это не uncaught gameplay/runtime failure. Поэтому browser-health probe игнорирует только эти два узких local-test pattern: одновременно должны присутствовать localhost `127.0.0.1:4173`, конкретный PWA probe (`sw.js` или `build.json`) и `due to access control checks`.

Все остальные `pageerror`, `console.error`, critical request failures и HTTP 4xx/5xx продолжают валить тест.

### Длинный main-flow на iPhone/WebKit

Полный `New Game → VN → CHOICE_00 → M3_00` заметно медленнее в WebKit, чем Chromium, поэтому только этот тест помечен `test.slow()`.

На intro production `#start` сначала явно проверяется как visible + enabled. После этого click выполняется с `force: true`, чтобы не зависеть от WebKit actionability stability для fixed/safe-area mobile layout. Это не test-only game hook: вызывается тот же production DOM click handler.

## Диагностика

Обе browser lanes используют production Playwright settings:

- `forbidOnly` в CI;
- один worker в CI;
- один retry;
- `trace: retain-on-failure`;
- `screenshot: only-on-failure`.

Независимо от результата job workflow публикует:

- `e2e/playwright-report`;
- `e2e/test-results`.

Artifact names включают browser lane, `github.run_id` и `github.run_attempt`, retention — 14 дней.

## Dependency boundary

Root dependencies устанавливаются через `npm ci --ignore-scripts`, потому что production Vite build остаётся частью реального browser startup.

Playwright остаётся изолирован в `e2e/package.json`; workflow устанавливает его отдельно и скачивает только browser конкретной matrix lane через `playwright install --with-deps`.

## Что намеренно не входит в G7A

G7A не добавляет Golden screenshot baselines.

Причина: до этого момента executable browser suite вообще не был CI gate. Сначала нужно получить реальный Chromium/WebKit run, исправить false assumptions и добиться устойчивого зелёного browser infrastructure baseline.

После этого **ANM-023G7B** добавит небольшой набор утверждаемых Golden Samples поверх уже стабильного Browser Gate.

## Acceptance

G7A считается готовым, когда одновременно зелёные:

1. обычный `UPDS CI`;
2. `Chromium full E2E`;
3. `Mobile WebKit critical E2E`.

Если browser jobs выявляют накопленные ошибки G1–G6, они исправляются на этой же candidate branch до merge.
