# PG-002G — отделить runtime telemetry от локального playtest отчёта

Статус: подготовлено к проверке.

## Изменение

- `src/contracts/TelemetryRuntime.ts` задаёт типизированные игровые/platform events и минимальный
  интерфейс `track` / `trackScreen`.
- `PlaytestTelemetry` реализует контракт, сохраняя текущий localStorage журнал, агрегирование,
  session lifecycle и экспорт для мобильного QA.
- Features и `PwaController` используют telemetry contract; diagnostics, app bootstrap и pagehide
  lifecycle обращаются к явно названному `playtestTelemetry` для локальных QA операций.

## Эффект для порта и Playgama

Runtime composition сможет заменить event sink на Playgama analytics или no-op реализацию без
переноса локального playtest schema и инструментов экспорта. Текущий web adapter продолжает писать
тот же список событий в прежний storage key с тем же форматом и агрегатами.

## Проверка

Существующие тесты `PlaytestTelemetry` продолжают проверять события, дедупликацию, summary и schema;
архитектурная проверка фиксирует разделение runtime event contract и local QA service. Полный
`npm.cmd run check` и version policy должны пройти до слияния.
