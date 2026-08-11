# ANM-019C · Localized VN Metadata & Choices

Build: `0.19.2-anm019c`.

## Цель

Расширить работающий ru/en vertical slice ANM-019B на visual novel, сохранив authored screenplay и VN paging неизменными для отдельной проверки в ANM-019D.

## Scope

- локализованы VN topbar/navigation accessibility labels;
- локализованы scene title/location по стабильным `VN_SCENE_*` IDs;
- локализованы direction/chrome labels и VN save/load status messages;
- локализован `CHOICE_00`: header, prompt, title/effect для A/B/C;
- локализован chrome clue-toast `DOSSIER UPDATED`, но clue title остаётся content уровня Match-3 до ANM-019E;
- ru/en catalogs сохраняют полный parity;
- tests проверяют coverage каждого scene ID и choice ID.

## Намеренно не входит

- перевод screenplay line text;
- перевод speaker/emotion authored metadata;
- history/config overlay content;
- Match-3, dossier, ending и diagnostics;
- изменение `VN...` IDs, `CHOICE_00`, choice state, save schema или branching.

## Архитектурный контракт

VN presentation строит localization keys из уже существующих стабильных идентификаторов. `sceneMeta` и `choices` продолжают быть authoritative gameplay/content data; локализованные display strings не участвуют в branching, persistence или expression routing.

## QA на preview

1. Выбрать English в Settings.
2. Начать/продолжить VN: scene title, VN navigation labels и direction chrome должны быть английскими.
3. Dialogue screenplay пока остаётся русским — это ожидаемая граница ANM-019C.
4. Дойти до `CHOICE_00` или открыть соответствующую сцену через QA navigation: choice header/prompt/options/effects должны быть английскими.
5. Переключить обратно на Русский и повторить проверку.

## Следующий пакет

ANM-019D отделяет screenplay locale sources и проверяет, что translated dialogue проходит существующий render-measured paging без изменения VN IDs и progression semantics.
