# ANM-017 · Playtest & Distribution Foundation

Build: `0.17.0-anm017`

ANM-017 объединяет две инфраструктурные задачи, которые упрощают дальнейшие плейтесты vertical slice:

1. локальная playtest telemetry с агрегированным summary и экспортом raw events;
2. installable PWA с offline cache, update flow и изоляцией stable `/` от candidate `/preview/`.

## Playtest telemetry

- отдельный storage key: `seiran-detectives-playtest-v1`;
- schema v1, максимум 2500 событий;
- session start/end и длительность;
- VN line/page/skip/auto/log events;
- CHOICE_00;
- Match-3 start/move/hint/end;
- win/loss/abandon, duration, moves, reshuffle, specials, cascade;
- vertical-slice completion;
- PWA/install/offline/update events;
- экспорт `UPDS_playtest_<version>.json` с `summary + events`;
- очистка telemetry не затрагивает campaign save.

## PWA / offline

- relative `manifest.webmanifest` и standalone portrait contract;
- iOS `apple-touch-icon`;
- service worker + full runtime warm-cache после первого открытия;
- offline readiness отображается в Settings/Diagnostics;
- update detection + явное `Обновить / Позже` без silent reload;
- active Match-3 защищён confirmation перед update;
- stable SW никогда не перехватывает `/preview/*`;
- preview SW использует отдельный cache namespace и network-first fetch policy.

Подробности: `docs/ANM017_PLAYTEST_DISTRIBUTION_RU.md`.
