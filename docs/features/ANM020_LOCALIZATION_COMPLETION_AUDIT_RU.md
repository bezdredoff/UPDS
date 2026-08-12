# ANM-020 · Localization Completion Audit

Build: `0.20.0-anm020`.

## Цель

Формально закрыть localization foundation без изменения пользовательского контента и gameplay.

## Контракт

- ru/en каталоги имеют одинаковый набор ключей;
- для каждой реально используемой screenplay line во всех ветках A/B/C существуют `speaker`, `emotion`, `text` в обоих locale;
- локализованные runtime-контроллеры не содержат кириллических user-facing literals;
- ANM-019 считается завершённым и больше не находится в Next Work.

## Не меняется

- screenplay canon;
- stable VN IDs;
- Match-3 mechanics/balance;
- save schema;
- telemetry schema;
- production assets.
