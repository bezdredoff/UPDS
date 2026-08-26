# ANM-025C1 — Responsive Objectives HUD

## Почему

После human playtest следующий UX-срез — читаемость целей. Production Match-3 допускает до трёх одновременных целей, но прежний HUD делил верхнюю строку почти поровну между целями и служебным блоком хода/этапа. При трёх целях карточки сохраняли `min-width`, поэтому `.objectives` превращался в горизонтальный скролл, а длинные RU/BE/EN подписи дополнительно обрезались однострочным ellipsis на 6–7 px.

Для игрового HUD это плохой контракт: игрок не должен прокручивать верхнюю панель, чтобы узнать условие победы.

## Контракт C1

- все 1–3 production objectives видны одновременно без горизонтального скролла;
- карточки целей равномерно делят доступную ширину и могут сжиматься до `min-width: 0`;
- иконка + прогресс занимают верхнюю строку карточки, подпись использует полную ширину нижней строки;
- подпись переносится, а не скрывается однострочным ellipsis;
- на телефонной ширине stage HUD становится компактнее, но moves, номер этапа и stage ID остаются видимыми;
- на узких 320–340 px уменьшаются только размеры HUD-иконок/типографики, а не количество показанных целей.

## Не меняется

- objective kinds, targets, order и localization strings;
- moves budget, blockers, ingredients, seeds, spawn weights, board topology и balance;
- Match-3 engine, hint ranking, invalid-move feedback, reshuffle algorithm и telemetry;
- intro objective cards — C1 меняет именно in-level objective HUD.

## Автопроверки

Vitest-контракт фиксирует максимум в три цели и responsive CSS semantics. Browser Gate запускает реальный Level Lab через production `Match3Controller` с тремя длинными objective labels и проверяет, что:

1. присутствуют все три карточки;
2. objective strip не имеет горизонтального overflow;
3. каждая карточка находится внутри strip;
4. подписи переносятся и не имеют скрытого overflow.

Тот же `match3.pw.ts` входит в Mobile WebKit critical suite, поэтому контракт проверяется и на iPhone viewport.

## Preview QA

На iPhone открыть через `?qa=1` Level Lab и любой production level с тремя целями (например M3_04+):

- все три цели должны быть видны одновременно;
- длинные русские подписи должны читаться без горизонтального свайпа HUD;
- счётчик ходов и номер этапа остаются видимыми;
- board не должен смещаться горизонтально или выходить за viewport;
- изменение progress не должно перестраивать ширину objective cards.
