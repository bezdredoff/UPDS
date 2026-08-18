# ANM-023G8C2 — Match-3 Campaign Completion & Progression Flow

## Цель

Закрыть последний high-value browser gap из G8A для отдельной Match-3 Campaign: доказать production journey от канонической победы до result UI, campaign save, unlock следующего уровня, Next, replay и возврата в hub.

## Почему без QA level override

G8C2 не добавляет browser-only Match-3 правила и не облегчает M3_00. Первая Campaign-попытка использует канонический `M3_00_LOCKER_TUTORIAL` с production seed `9001 + attempt * 101`. Для attempt 1 objective-aware production board имеет стабильную девятиходовую последовательность реальных swap-ов:

`2↔3 → 18↔19 → 32↔33 → 2↔10 → 4↔12 → 29↔37 → 29↔37 → 44↔45 → 59↔60`.

После неё настоящий `Match3Game` завершает обе канонические цели с 15 оставшимися ходами. Playwright только воспроизводит эту последовательность через rendered cells; он не создаёт `Match3Game`, не мутирует controller state и не записывает готовую победу в storage.

## Browser journey

Новый Chromium-only `e2e/tests/campaign-completion.pw.ts` содержит два bounded cases.

Первый:

1. fresh browser state → Match-3 Campaign;
2. запускает M3_00 через production Campaign level button;
3. выполняет девять production swaps и получает настоящий `.match3-campaign-result`;
4. проверяет persisted `completed`, `attempts` и `bestMovesLeft = 15`;
5. нажимает result `Hub`;
6. проверяет completed M3_00 и разблокированный M3_01;
7. запускает completed M3_00 как Replay и возвращается в hub;
8. reload → Main Menu → Campaign;
9. повторно проверяет persisted completion/best/unlock.

Второй независимо выигрывает M3_00 и нажимает result `Next`, после чего production Campaign стартует канонический `M3_01` и фиксирует его первую попытку в campaign save.

## Lane policy

`campaign-completion.pw.ts` намеренно не добавлен в `mobileCriticalTestMatch`. Chromium full E2E владеет полным Campaign progression contract. Mobile WebKit уже защищает production Match-3 mechanics/input/rendering; дублирование девятиходовой progression journey не даёт отдельного mobile-only сигнала и увеличило бы Browser Gate runtime.

## Scope

Нет изменений `src/`, Match-3 engine, canonical levels, save schema, workflows или assets. Меняются только Playwright helper/selectors/spec, coverage contract, E2E documentation и этот feature document.

Loss/retry не добавляется: существующая controller/unit coverage достаточна, а audited G8C2 gap относится к win completion/persistence/unlock boundary.

## Acceptance

- канонический M3_00 выигрывается через production swaps, а не test mutation API;
- result screen появляется через `renderCampaignResult('win')`;
- campaign save содержит M3_00 completion и bestMovesLeft 15;
- M3_01 разблокирован;
- result Hub возвращает в актуальный campaign hub;
- completed M3_00 можно replay;
- reload сохраняет completion/best/unlock;
- result Next запускает M3_01;
- test остаётся Chromium-only;
- Selenium/WebDriver не добавляется.
