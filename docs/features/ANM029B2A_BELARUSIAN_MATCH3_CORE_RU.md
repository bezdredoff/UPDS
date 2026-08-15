# ANM-029B2A · Belarusian Match-3 Core

Build label: `ANM-029B2A R1.1 · Belarusian Match-3 Core`.

## Цель

Продолжить ANM-029B небольшим лингвистически проверяемым пакетом и перевести на белорусский общий
player-facing Match-3 runtime: базовые действия, tutorial, feedback, tiles/specials и отдельный campaign UI.

`be` всё ещё **не включается** в runtime selector. B2A не переводит level-specific narrative copy и F2
character reactions, поэтому русский fallback не должен маскировать незавершённый production locale.

## Граница B2A

B2A добавляет ровно **83 source keys**:

- generic `match3.*` UI/actions/accessibility;
- tutorial copy;
- generic feedback и validation barks;
- tile/special labels;
- весь `match3Campaign.*` shell.

Явно отложены в B2B/B2C:

- `match3.level.*` для всех 22 уровней;
- `match3.clue.*` и `match3.ingredient.*`;
- per-level `match3.bark.blockers.*`, `fiveMoves.*`, `ingredient.*`;
- отдельный F2 `match3ReactionCatalogs` (132 strings).

## Терминология

- objective → `мэта`;
- hint → `падказка`;
- match → `супадзенне`;
- combo → `комба`;
- evidence → `доказ`;
- lead → `зачэпка`;
- campaign board → `дошка спраў`;
- `match-3`, SFX/технические ярлыки сохраняются как продуктовые/жанровые обозначения там, где это уже
  является частью UI-контракта.

## Automated gate

`BelarusianMatch3CoreLocalization.test.ts` проверяет:

- exact scope = 83 keys;
- zero missing/extra/empty;
- named-placeholder parity;
- отсутствие level/clue/ingredient/per-level bark copy в B2A;
- `be` остаётся `translation-pending` и отсутствует в runtime selector.

## Следующие пакеты

- **ANM-029B2B** — все 22 Match-3 levels: title/storyAction/objectives/start/win/lose/clue +
  level-specific clue/ingredient/bark copy;
- **ANM-029B2C** — 132 F2 reactions + полный Match-3 Belarusian coverage audit.
