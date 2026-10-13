# PG-002C — ввести общий localization runtime contract

Статус: подготовлено к проверке.

## Изменение

- `src/contracts/LocalizationRuntime.ts` описывает интерфейс локального языка, получения перевода,
  проверки ключа, переключения языка и подписки на смену языка.
- Текущий `LocalizationService` реализует интерфейс.
- `RuntimeServices.localization` теперь объявлен через интерфейс, а не через конкретный сервис.

## Эффект для порта

Features используют `t`, `has`, `locale`, `activateLocale`, `setLocale` и `subscribe`. Godot
composition сможет связать эти операции с native translation resources, не подменяя feature API.
Загрузка TS-каталогов, fallback, параметры сообщений и тексты не меняются.
