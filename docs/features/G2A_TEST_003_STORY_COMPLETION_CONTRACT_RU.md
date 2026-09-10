# G2a-TEST-003 — Story Completion browser contract simplification

Status: review.

## Зачем

`BrowserStoryCompletionE2EContract.test.ts` изначально защищал важный boundary, но со временем начал фиксировать детали production-реализации как текст:

- точный русский QA copy;
- точную сигнатуру `Match3Controller.startMatch(...)`;
- локальные строки выбора `levelOverride`;
- конкретные вызовы `session.reset()` и `match3.startMatch(...)` в composition root;
- комментарий внутри `storyFlowQa.ts`;
- конкретную длительность ожидания в Playwright.

Это делает обычный безопасный рефакторинг причиной падения fast gate, хотя фактическое поведение уже проверяется реальным browser journey и отдельным engine-level fixture test.

## Что сохраняем

Contract остаётся полезным и проверяет только устойчивые границы:

- `story-completion.pw.ts` использует публичный QA selector и проходит player-visible Match-3 → Evidence → VN → reload → Continue flow;
- journey проходит через rendered Match-3 cells, а не через `localStorage`, `window.__UPDS_TEST__`, `forceWin` или прямой доступ к `Match3Controller`;
- canonical post-win boundary остаётся `VN0058`;
- QA fixture отдельно проверяется `StoryWinQaFixture.test.ts` через настоящий `Match3Game.attemptSwap()` с `won: true` и без мутации canonical level registry;
- Chromium автоматически обнаруживает spec через общий `*.pw.ts` testMatch;
- текущая осознанная политика lane сохраняется: этот cross-system flow не входит в mobile-critical WebKit set.

## Что больше не является contract

Следующее можно менять без обновления browser contract, если behavioural tests остаются зелёными:

- формулировка QA текста;
- имя локальной переменной в controller;
- порядок внутренних вызовов composition root;
- spelling сигнатуры/implementation details `startMatch`;
- комментарии fixture;
- точное значение технического timeout внутри E2E.

## Результат

Browser contract теперь защищает способ доказательства и пользовательскую boundary-семантику, а не текущую форму production-кода. Runtime, gameplay, story data, QA fixture и сам Playwright scenario этим slice не меняются.
