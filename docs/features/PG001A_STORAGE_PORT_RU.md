# PG-001A — общий контракт key-value storage

Статус: реализация подготовительного шага; игровые данные и поведение не меняются.

## Причина

`CampaignStore` и `Match3CampaignStore` находились в `src/engine/`, но импортировали
`StorageLike` из `src/platform/SafeStorage.ts`. Сам тип был определён как `Pick<Storage, ...>`, то
есть опирался на DOM API браузера. Такой импорт размывал границу движка и связывал persistence
контракты кампании с конкретной web-платформой. Тем же типом пользовались audio settings,
localization settings, error log и telemetry.

## Изменение

- Добавлен `src/contracts/KeyValueStorage.ts` с тремя нейтральными операциями: `getItem`, `setItem`,
  `removeItem`.
- Engine stores, audio/localization settings и platform consumers теперь зависят от этого общего
  типа.
- `SafeStorage` остаётся browser implementation и сохраняет memory fallback; его интерфейс работы,
  probe key и поведение не менялись.
- Ключи сохранения, сериализация, schema version и содержимое локалей не менялись.

## Эффект для переноса

Зависимость направлена от потребителей к общему persistence contract, а браузерный storage остаётся
на краю приложения. При портировании в Godot можно реализовать те же три операции на его storage API
и сохранить логику campaign/settings stores отдельно от текущего DOM `Storage` типа.

## Границы

Этот шаг не переносит TypeScript в GDScript и не меняет audio playback, PWA, viewport, campaign save
schema или платформенную политику. Следующие seams выбирать только после аудита конкретных runtime
зависимостей и без повторного открытия уже завершённых ANM-023F/G2a cleanup-задач.
