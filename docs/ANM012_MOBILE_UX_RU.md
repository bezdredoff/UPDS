# ANM-012 — Mobile UX Foundation

Версия: `0.12.0-anm012`.

## Scope

ANM-012 делает существующий vertical slice устойчивым для iPhone/узких мобильных viewport без изменения канона, VN line IDs, save key, level data, Match-3 правил или production character rigs.

### Добавлено

- viewport contract без искусственного `min-height: 640px`;
- safe-area aware layout и компактный профиль для `320×568` / низких экранов;
- board swipe input через Pointer Events с сохранением tap-to-select;
- board scroll containment: `touch-action: none`, `overscroll-behavior: contain`;
- защита от двойного `pointerup → click` после свайпа;
- input lock вокруг swap transaction;
- отдельный чистый `boardInteraction.ts` с детерминированным swipe resolver;
- minimum 44 px для non-board navigation controls, где размер может быть гарантирован без увеличения board cells;
- landscape recovery layout: игра остаётся управляемой, но portrait остаётся целевым режимом;
- regression viewport matrix и unit/static tests.

## Regression viewports

- `320×568` — minimum supported;
- `375×667`;
- `390×844`;
- `393×852`;
- `430×932`;
- landscape smoke: высота до 500 px.

## Ручной critical path на iPhone

1. Открыть `/preview/` в Safari.
2. Проверить отсутствие document scroll на главном меню.
3. Новая игра → VN → CHOICE_00 → первый Match-3.
4. Проверить tap-select/tap-neighbour swap.
5. Проверить swipe left/right/up/down на нескольких клетках.
6. Свайп по board не должен двигать страницу или вызывать zoom/selection.
7. Свайп за край поля не должен падать или тратить ход.
8. Невалидный swap не должен тратить ход; input после него остаётся рабочим.
9. Открыть dossier и вернуться — board остаётся доступен.
10. Повторить минимум на обычной portrait ориентации и один раз повернуть телефон в landscape, затем вернуться.
11. Проверить `prefers-reduced-motion`, если настройка iOS включена.

## Защищённые контракты

Не менялись намеренно:

- `src/data/narrative.ts`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`;
- `src/data/levels.ts`;
- `src/engine/Match3Game.ts`;
- `src/data/characterRigs.ts`;
- save key `seiran-detectives-anm009-v1`;
- `.github/workflows/*` ANM-010A.
