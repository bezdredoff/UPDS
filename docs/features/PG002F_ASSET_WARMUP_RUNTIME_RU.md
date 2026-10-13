# PG-002F — отделить прогрев ресурсов от игровых контроллеров

Статус: подготовлено к проверке.

## Изменение

- `src/contracts/AssetWarmupRuntime.ts` описывает запрос на предварительную подготовку списка
  визуальных ресурсов без зависимости от `Image` и браузерного URL.
- `BrowserAssetWarmup` соединяет контракт с текущим параллельным image preloader и `AssetHealth`.
- VN и Match-3 запрашивают прогрев через `RuntimeServices`; решение о доступности image loading
  принимает platform adapter.

## Эффект для порта

Feature controllers больше не импортируют web preloader и не проверяют глобальный `Image`. Godot
runtime сможет использовать ресурсный загрузчик или no-op warming без изменения переходов между
линиями и уровнями. Полная загрузка ассетов, fallback для неудачных image запросов и диагностика
ошибок остаются ответственностью текущей web-платформы.

## Проверка

Существующие тесты preloader сохраняют контроль deduplication, concurrency, успеха и ошибок;
архитектурная проверка удерживает VN/Match-3 за `AssetWarmupRuntime`. Полный
`npm.cmd run check` и version policy должны пройти до слияния.
