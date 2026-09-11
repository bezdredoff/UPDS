# G2a-TEST-006 — Match-3 browser contract ownership

Status: **accepted via PR #287**.

## Проблема

`tests/Match3BrowserE2EContract.test.ts` исторически смешивал несколько уровней ответственности. Помимо browser helper/spec/selectors он читал production `AnimeDetectiveApp`, `Match3Controller`, `Match3Presentation`, `LevelLabController` и даже `tests/Match3Game.test.ts`, а затем проверял точное написание внутренних условий, вызовов и markup-строк.

Это дублировало уже существующие architecture/domain/browser tests и делало fast gate чувствительным к безопасным рефакторам, которые не меняют пользовательское Match-3 поведение.

## Решение

После G2a-TEST-006 browser contract читает только:

- `e2e/selectors.ts`;
- `e2e/helpers/match3.ts`;
- `e2e/tests/match3.pw.ts`;
- `e2e/playwright.config.ts`.

Он защищает именно browser automation boundary:

1. Campaign и Level Lab открываются через видимые UI entry points;
2. helper/spec не используют `Match3Controller`, `Match3Game`, прямую запись save storage, hidden `__UPDS_TEST__` или `forceWin`;
3. Match-3 automation selectors остаются явным API;
4. deterministic board задаётся через реальные поля Level Lab и Apply/Play;
5. representative browser journeys сохраняются: Campaign smoke, inactivity hint, pointer drag, objective-aware Hint, cascade, invalid swap и special activation;
6. `match3.pw.ts` остаётся в mobile-critical WebKit lane.

## Где теперь живёт остальная защита

- composition root и единственное место конструирования feature controllers — `RepositoryHygiene.test.ts`;
- отсутствие sibling feature imports — `RepositoryHygiene.test.ts`;
- engine legality, swap semantics, hint и side-effect правила — dedicated Match3Game/engine unit tests;
- presentation markup и конкретные renderer contracts — собственные focused tests;
- фактическая связка Campaign/Level Lab → production Match-3 runtime — `match3.pw.ts` в blocking Browser Gate.

Browser contract больше не должен подтверждать эти уровни чтением их исходного текста или текста другого теста.

## Scope

Изменяются только tests/docs. Не меняются:

- runtime/controller/engine;
- Match-3 balance, objectives или level data;
- Level Lab behavior;
- selectors и helper behavior;
- Playwright spec;
- Browser Gate config;
- Golden Samples;
- PWA/safe-area;
- backgrounds/art.

## Завершённый финальный аудит

TEST-006 был принят через PR #287. После него выполнен короткий финальный аудит оставшихся `read('src/...')` tests: source-reading contracts, которые действительно защищают CSS/PWA/version/build ownership или другой намеренно статический repository contract, сохранены; существенное дублирование закрыто последующими bounded architecture slices ARCH-001…010 через PR #288–#298.

G2a закрыт после ARCH-010 / PR #298 и docs closeout / PR #299. Следующий активный трек — release work. KI-001/KI-003 остаются отдельными открытыми real-iPhone gates; этот slice и G2a их не закрывают. Не продолжать G2a без нового доказанного regression/ownership риска.
